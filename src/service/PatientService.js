const connection = require("../config/data");
const moment = require("moment");
require("moment/locale/vi"); // bắt buộc để moment hiểu tiếng Việt
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const { sendSimpleEmail } = require("./emailService");

let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};

const bookAppointment = async (data) => {
  const status = {};

  try {
    // Kiểm tra tham số bắt buộc
    if (!data || !data.doctorId || !data.date || !data.timeType) {
      return { errCode: 1, errMessage: "Missing required parameters" };
    }

    const {
      email,
      firstName,
      lastName,
      address,
      gender,
      phoneNumber,
      doctorId,
      date,
      timeType,
      reason,
      timeString,
      patientId     // <-- nếu login thì FE gửi lên patientId
    } = data;

    // Chuẩn hóa ngày
    const formattedDate = moment(date, ["DD/MM/YYYY", moment.ISO_8601]).format("YYYY-MM-DD");

    let realPatientId = patientId;

    // CASE 1: PATIENT ĐÃ ĐĂNG NHẬP → dùng patientId
    if (patientId) {
      console.log("Patient logged in:", realPatientId);

    } else {
      // CASE 2: PATIENT CHƯA LOGIN → kiểm tra email

      const [rows] = await connection.promise().query(
        `SELECT id FROM users WHERE email = ?`,
        [email]
      );

      if (rows.length === 0) {
        // tạo user mới (R3)
        const [insertUser] = await connection.promise().query(
          `INSERT INTO users 
            (email, firstName, lastName, address, gender, phoneNumber, roleId) 
           VALUES (?, ?, ?, ?, ?, ?, 'R3')`,
          [email, firstName, lastName, address, gender, phoneNumber]
        );

        realPatientId = insertUser.insertId;

      } else {
        realPatientId = rows[0].id;

        // cập nhật thông tin user nếu có thay đổi
        await connection.promise().query(
          `UPDATE users SET firstName=?, lastName=?, address=?, gender=?, phoneNumber=? 
           WHERE id=?`,
          [firstName, lastName, address, gender, phoneNumber, realPatientId]
        );
      }
    }

    // CHECK TRÙNG LỊCH — GIỮ NGUYÊN ĐIỀU KIỆN CŨ
    // 4 giá trị phải trùng: doctorId + patientId + date + timeType
    const [existing] = await connection.promise().query(
      `SELECT * FROM booking
       WHERE doctorId = ? 
         AND patientId = ?
         AND date = ?
         AND timeType = ?`,
      [doctorId, realPatientId, formattedDate, timeType]
    );

    if (existing.length > 0) {
      return {
        errCode: 2,
        errMessage: "You already booked this doctor for the same time slot today!"
      };
    }

    // TẠO BOOKING
    const token = uuidv4();

    const [booking] = await connection.promise().query(
      `INSERT INTO booking 
        (statusId, doctorId, patientId, date, timeType, reason, token)
       VALUES ('S1', ?, ?, ?, ?, ?, ?)`,
      [
        doctorId,
        realPatientId,
        formattedDate,
        timeType,
        reason || null,
        token
      ]
    );

    // lấy tên bác sĩ
    const [doctorInfo] = await connection.promise().query(
      `SELECT firstName, lastName FROM users WHERE id = ?`,
      [doctorId]
    );

    const doctorName =
      doctorInfo.length > 0
        ? `${doctorInfo[0].firstName} ${doctorInfo[0].lastName}`
        : "Bác sĩ";

    // GỬI EMAIL XÁC NHẬN — GIỮ NGUYÊN CODE CŨ
    await sendSimpleEmail({
      reciverEmail: email,
      patientName: firstName + " " + lastName,
      time: timeString,
      doctorName: doctorName,
      redirectLink: buildUrlEmail(doctorId, token),
    });

    return {
      errCode: 0,
      errMessage: "Booking appointment successfully!",
      data: booking,
    };

  } catch (error) {
    console.log("❌ bookAppointment error:", error);
    return {
      errCode: 1,
      errMessage: error.message,
      data: [],
    };
  }
};


const verifyBookAppointment = async (data) => {
  const status = {};
  try {
    // Kiểm tra tham số bắt buộc
    if (!data || !data.token || !data.doctorId) {
      status.errCode = 1;
      status.errMessage = "Missing required parameters";
      return status;
    }
    const { token, doctorId } = data;

    // Tìm kiếm lịch hẹn
    const [rows] = await connection.promise().query(
      `SELECT * 
                 FROM booking 
                 WHERE doctorId = ? AND token = ? AND statusId = 'S1'`,
      [doctorId, token]
    );
    if (rows.length === 0) {
      status.errCode = 2;
      status.errMessage = "Appointment has been activated or does not exist!";
      return status;
    }
    //  Cập nhật trạng thái đã xác nhận lịch hẹn
    await connection.promise().query(
      `UPDATE booking 
                 SET statusId = 'S2'
                 WHERE doctorId = ? AND token = ? AND statusId = 'S1'`,
      [doctorId, token]
    );
    status.errCode = 0;
    status.errMessage = "Appointment activated successfully!";
    return status;
  } catch (error) {
    console.log("❌ verifyBookAppointment error:", error);
    status.errCode = 1;
    status.errMessage = error.message || "Database error";
    return status;
  }
};

const AllPatient = async () => {
  const status = {};
  try {
    const [rows] = await connection
      .promise()
      .query(`SELECT * FROM users WHERE roleId = "R3"`);
    status.errCode = 0;
    status.errMessage = "OK";
    status.data = rows;
    return status;
  }
  catch (error) {
    console.log("❌ AllPatient error:", error);
    status.errCode = 1;
    status.errMessage = error.message || "Database error";
    status.data = [];
    return status;
  }
};

const ListBookingForPatient = async (patientId) => {
  const status = {};
  try {
    const [rows] = await connection.promise().query(
      `
     SELECT 
          b.id, 
          b.date,
          b.timeType,
          b.statusId,

          -- Trạng thái khám bệnh
          ls.value_en AS statusEn,
          ls.value_vi AS statusVi,

          -- Khung giờ khám
          lt.value_en AS timeEn,
          lt.value_vi AS timeVi,

          -- Tên bác sĩ
          u.firstName AS doctorFirstName,
          u.lastName AS doctorLastName

      FROM booking b

      JOIN users u 
          ON b.doctorId = u.id

      -- lookup STATUS
      LEFT JOIN lookup ls 
          ON b.statusId = ls.keyMap 
         AND ls.type = 'STATUS'

      -- lookup TIME
      LEFT JOIN lookup lt
          ON b.timeType = lt.keyMap
         AND lt.type = 'TIME'

      WHERE b.patientId = ?
      ORDER BY b.date DESC, b.timeType ASC
      `,
      [patientId]
    );

    status.errCode = 0;
    status.errMessage = "OK";
    status.data = rows || [];
    return status;

  } catch (error) {
    console.log("❌ ListBookingForPatient error:", error);
    status.errCode = 1;
    status.errMessage = error.message || "Database error";
    status.data = [];
    return status;
  }
};



const cancelBookAppointment = async (data) => {
  const status = {};
  try {
    // Kiểm tra tham số bắt buộc
    if (!data || !data.BookingId) {
      status.errCode = 1;
      status.errMessage = "Missing required parameters";
      return status;
    }
    const { BookingId } = data;

    // Tìm kiếm lịch hẹn
    const [rows] = await connection.promise().query(
      `SELECT * 
                 FROM booking
                  WHERE id = ? AND statusId <> 'S3' AND statusId <> 'S4'`,
      [BookingId]
    );
    if (rows.length === 0) {
      status.errCode = 2;
      status.errMessage = "Appointment cannot be canceled or does not exist!";
      return status;
    }
    //  Cập nhật trạng thái đã hủy lịch hẹn
    await connection.promise().query(
      `UPDATE booking
                  SET statusId = 'S4'
                  WHERE id = ? AND statusId <> 'S3'`,
      [BookingId]
    );
    status.errCode = 0;
    status.errMessage = "Appointment canceled successfully!";
    return status;
  } catch (error) {
    console.log("❌ cancelBookAppointment error:", error);
    status.errCode = 1;
    status.errMessage = error.message || "Database error";
    return status;
  }
};

module.exports = {
  bookAppointment,
  verifyBookAppointment,
  AllPatient,
  ListBookingForPatient,
  cancelBookAppointment
};
