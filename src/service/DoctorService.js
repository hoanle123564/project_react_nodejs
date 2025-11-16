const connection = require("../config/data");
const moment = require("moment");
const { sendResultEmail } = require("./emailService");
const getTopDoctorHome = async (limit) => {
  const status = {};
  try {
    const limitNum = Number(limit) || 5;

    const [rows] = await connection.promise().query(
      `
             SELECT 
                u.id,
                u.email,
                u.firstName,
                u.lastName,
                u.address,
                u.gender,
                u.positionId,
                u.roleId,
                u.image,
                u.phoneNumber,

                p.value_vi AS positionVi,
                p.value_en AS positionEn,

                g.value_vi AS genderVi,
                g.value_en AS genderEn,

                m.description

            FROM users AS u

            LEFT JOIN Allcodes AS p 
                ON u.positionId = p.keyMap 
                AND p.type = 'POSITION'

            LEFT JOIN Allcodes AS g 
                ON u.gender = g.keyMap 
                AND g.type = 'GENDER'

            LEFT JOIN detail_doctor AS m 
                ON m.doctorId = u.id

            WHERE u.roleId = 'R2'     
            ORDER BY u.createdAt DESC  
            LIMIT ?;
            `,
      [limitNum]
    );

    status.errCode = 0;
    status.errMessage = "OK";
    status.data = rows;
    return status;
  } catch (error) {
    console.log("getTopDoctorHome error:", error);
    status.errCode = 1;
    status.errMessage = error;
    status.data = [];
    return status;
  }
};

const getDetailDoctorById = async (doctorId) => {
  const status = {};

  try {
    if (!doctorId) {
      return {
        errCode: 1,
        errMessage: "Missing required parameter: doctorId",
        data: {},
      };
    }

    // 1️⃣ LẤY THÔNG TIN NGƯỜI DÙNG
    const [userRows] = await connection.promise().query(
      `
            SELECT 
                u.id, u.email, u.firstName, u.lastName, u.address, 
                u.phoneNumber, u.image, u.gender, u.positionId, u.roleId,
                p.value_vi AS positionVi, p.value_en AS positionEn,
                g.value_vi AS genderVi, g.value_en AS genderEn
            FROM Users AS u
            LEFT JOIN Allcodes AS p 
                ON u.positionId = p.keyMap AND p.type = 'POSITION'
            LEFT JOIN Allcodes AS g 
                ON u.gender = g.keyMap AND g.type = 'GENDER'
            WHERE u.id = ? AND u.roleId = 'R2'
        `,
      [doctorId]
    );

    if (userRows.length === 0) {
      return {
        errCode: 2,
        errMessage: "Doctor not found",
        data: {},
      };
    }

    const user = userRows[0];

    // 2️⃣ LẤY detail_doctor
    const [markdownRows] = await connection.promise().query(
      `
            SELECT contentHTML, contentMarkdown, description
                 
            FROM detail_doctor
            WHERE doctorId = ?
        `,
      [doctorId]
    );

    const detail_doctor = markdownRows[0] || {};

    // 3️⃣ LẤY DOCTOR_CLINIC
    const [clinicRows] = await connection.promise().query(
      `
            SELECT doctorId, priceId, paymentId, clinicId, province, specialtyId
            FROM doctor_clinic
            WHERE doctorId = ?
        `,
      [doctorId]
    );

    const dc = clinicRows[0] || {};

    // 4️⃣ LẤY GIÁ & PAYMENT
    const [priceRows] = await connection.promise().query(
      `
            SELECT value_vi AS priceVi, value_en AS priceEn
            FROM Allcodes
            WHERE keyMap = ? AND type = 'PRICE'
        `,
      [dc.priceId]
    );

    const price = priceRows[0] || {};

    const [paymentRows] = await connection.promise().query(
      `
            SELECT value_vi AS paymentVi, value_en AS paymentEn
            FROM Allcodes
            WHERE keyMap = ? AND type = 'PAYMENT'
        `,
      [dc.paymentId]
    );

    const payment = paymentRows[0] || {};

    // 5️⃣ LẤY SPECIALTY
    const [specialtyRows] = await connection.promise().query(
      `
            SELECT name AS specialtyName
            FROM Specialty
            WHERE id = ?
        `,
      [dc.specialtyId]
    );

    const specialty = specialtyRows[0] || {};

    // 6️⃣ LẤY CLINIC
    const [clinicDetailRows] = await connection.promise().query(
      `
            SELECT name AS clinicName, address AS clinicAddress
            FROM Clinic
            WHERE id = ?
        `,
      [dc.clinicId]
    );

    const clinic = clinicDetailRows[0] || {};

    // 7️⃣ GỘP TẤT CẢ LẠI
    const data = {
      ...user,
      ...detail_doctor,
      ...dc,
      ...price,
      ...payment,
      ...specialty,
      ...clinic,
    };

    return {
      errCode: 0,
      errMessage: "OK",
      data,
    };
  } catch (error) {
    console.log("getDetailDoctorById error:", error);
    return {
      errCode: 1,
      errMessage: error.message,
      data: {},
    };
  }
};

const getAllDoctorHome = async () => {
  const status = {};

  let [rows] = await connection
    .promise()
    .query(`SELECT * FROM users WHERE roleId = 'R2'`);
  status.errCode = 0;
  status.errMessage = `0K`;
  status.data = rows;
  return status;
};

const saveDetailInfoDoctor = async (data) => {
  const status = {};
  try {
    if (
      !data ||
      !data.contentHTML ||
      !data.contentMarkdown ||
      !data.doctorId ||
      !data.priceId ||
      !data.paymentId ||
      !data.specialtyId ||
      !data.clinicId
    ) {
      status.errCode = 1;
      status.errMessage = "Missing required parameters";
      return status;
    }

    const {
      contentHTML,
      contentMarkdown,
      doctorId,
      priceId,
      paymentId,
      clinicId,
      specialtyId,
      province,
      description,
    } = data;

    console.log(">>> Save doctor detail:", data);

    // ====== 1️⃣ detail_doctor ======
    const [checkMarkdown] = await connection
      .promise()
      .query(`SELECT id FROM detail_doctor WHERE doctorId = ?`, [doctorId]);
    console.log("checkMarkdown", checkMarkdown);

    if (checkMarkdown.length > 0) {
      await connection.promise().query(
        `
          UPDATE detail_doctor
          SET contentHTML = ?, contentMarkdown = ?, description = ?
          WHERE doctorId = ?
        `,
        [contentHTML, contentMarkdown, description || null, doctorId]
      );
    } else {
      await connection.promise().query(
        `
          INSERT INTO detail_doctor (contentHTML, contentMarkdown, description, doctorId)
          VALUES (?, ?, ?, ?)
        `,
        [contentHTML, contentMarkdown, description || null, doctorId]
      );
    }

    // ====== 2️⃣ Doctor_Clinic ======
    const [checkClinic] = await connection
      .promise()
      .query(`SELECT id FROM doctor_clinic WHERE doctorId = ?`, [doctorId]);
    if (checkClinic.length > 0) {
      // Cập nhật nếu đã tồn tại
      await connection.promise().query(
        `
       UPDATE doctor_clinic
          SET priceId = ?, paymentId = ?, province = ?, specialtyId = ?, clinicId = ?
          WHERE doctorId = ?
        `,
        [priceId, paymentId, province, specialtyId, clinicId, doctorId]
      );
    } else {
      // Thêm mới nếu chưa có
      await connection.promise().query(
        `
        INSERT INTO doctor_clinic 
          (doctorId, priceId, paymentId, province, specialtyId, clinicId)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [doctorId, priceId, paymentId, province, specialtyId, clinicId]
      );
    }

    status.errCode = 0;
    status.errMessage = "Save doctor detail successfully";

    return status;
  } catch (error) {
    console.log("saveDetailInfoDoctor error:", error);
    status.errCode = 2;
    status.errMessage = error.message || "Database error";
    status.data = [];
    return status;
  }
};

// Định nghĩa 1 hàm chuẩn hóa ngày
const normalizeDate = (dateValue) => {
  if (!dateValue) return null;

  // Nếu là chuỗi DD/MM/YYYY
  if (typeof dateValue === "string" && dateValue.includes("/")) {
    return moment(dateValue, "DD/MM/YYYY", true).format("YYYY-MM-DD");
  }

  // Nếu là đối tượng Date hoặc ISO string
  return moment(dateValue).format("YYYY-MM-DD");
};

const PostScheduleDoctor = async (data) => {
  const status = {};
  try {
    if (!data || !data.doctorId || !data.date || !data.timeType) {
      status.errCode = 1;
      status.errMessage = "Missing required parameters";
      return status;
    }

    const maxNumber = 10;
    const { doctorId, date, timeType } = data;

    // Chuẩn hóa định dạng ngày (trước khi dùng)

    // Chuẩn bị mảng insert
    let values = timeType.map((slot) => [maxNumber, doctorId, date, slot]);
    console.log("Bulk insert values:", values);

    const [rows] = await connection
      .promise()
      .query(`SELECT doctorId, date, timeType FROM schedule`);

    // Lọc trùng
    values = values.filter((v) => {
      return !rows.some((row) => {
        console.log("row.date", row.date);

        const rowDate = moment(row.date).format("YYYY-MM-DD");
        v[2] = moment(v[2], ["DD/MM/YYYY", moment.ISO_8601]).format(
          "YYYY-MM-DD"
        );
        return (
          Number(row.doctorId) === Number(v[1]) &&
          rowDate === v[2] &&
          row.timeType === v[3]
        );
      });
    });

    console.log("Values after filter:", values);

    //  Chuyển tất cả date về YYYY-DD-MM một lần nữa để chắc chắn
    values = values.map((v) => {
      v[2] = moment(v[2], ["DD/MM/YYYY", moment.ISO_8601]).format("YYYY-MM-DD");
      return v;
    });

    // Nếu không có giá trị mới thì dừng
    if (values.length === 0) {
      status.errCode = 0;
      status.errMessage = "No new schedule to insert";
      status.data = [];
      return status;
    }

    //  Insert dữ liệu chuẩn
    const [result] = await connection.promise().query(
      `
      INSERT INTO schedule (maxNumber, doctorId, date, timeType)
      VALUES ?`,
      [values]
    );

    status.errCode = 0;
    status.errMessage = "Schedule created successfully";
    status.data = result;
    return status;
  } catch (error) {
    console.log("PostScheduleDoctor error:", error);
    status.errCode = 1;
    status.errMessage = error.message || "Database error";
    status.data = [];
    return status;
  }
};

const GetcheScheduleDoctorByDate = async (doctorId, date) => {
  const status = {};
  console.log("doctorId, date", doctorId, date);

  try {
    if (!doctorId || !date) {
      status.errCode = 1;
      status.errMessage = "Missing required parameters";
      status.data = [];
      return status;
    }
    const normalizedDate = normalizeDate(date);
    const [rows] = await connection.promise().query(
      `
       SELECT s.id, s.doctorId, s.date, s.timeType, s.maxNumber,
           a.value_vi, a.value_en
    FROM schedule AS s
    LEFT JOIN allcodes AS a 
        ON s.timeType = a.keyMap AND a.type = 'TIME'
    WHERE s.doctorId = ? AND s.date = ?
    ORDER BY CAST(SUBSTRING(s.timeType, 2) AS UNSIGNED) ASC
      `,
      [doctorId, normalizedDate]
    );
    console.log("schedules", rows);

    status.errCode = 0;
    status.errMessage = "OK";
    status.data = rows;
    return status;
  } catch (error) {
    console.log("GetcheScheduleDoctorByDate error:", error);
    status.errCode = 1;
    status.errMessage = error.message || "Database error";
    status.data = [];
    return status;
  }
};

const GetListPatientForDoctor = async (doctorId, date) => {
  const status = {};
  try {
    if (!doctorId || !date) {
      status.errCode = 1;
      status.errMessage = "Missing required parameters";
      status.data = [];
      return status;
    }
    const normalizedDate = normalizeDate(date);
    const [rows] = await connection.promise().query(
      `
         SELECT b.id, b.date, b.timeType, b.statusId, b.reason,
         b.doctorId, b.patientId,
                u.email, u.firstName, u.lastName, u.address, u.phoneNumber,
                a.value_vi AS timeTypeVi, a.value_en AS timeTypeEn
         FROM booking AS b
            LEFT JOIN users AS u ON b.patientId = u.id
            LEFT JOIN allcodes AS a 
                ON b.timeType = a.keyMap AND a.type = 'TIME'
         WHERE b.doctorId = ? AND b.date = ? AND b.statusId = 'S2'
        `,
      [doctorId, normalizedDate]
    );

    status.errCode = 0;
    status.errMessage = "OK";
    status.data = rows;
    return status;
  } catch (error) {
    console.log("GetListPatientForDoctor error:", error);
    status.errCode = 1;
    status.errMessage = error.message || "Database error";
    status.data = [];
    return status;
  }
};

const sendRemedy = async (data) => {
  const status = {};
  try {
    if (
      !data ||
      !data.email ||
      !data.doctorId ||
      !data.patientId ||
      !data.time ||
      !data.image ||
      !data.date ||
      !data.firstNamePatient ||
      !data.lastNamePatient
    ) {
      status.errCode = 1;
      status.errMessage = "Missing required parameters";
      return status;
    }
    const {
      email,
      doctorId,
      patientId,
      date,
      image,
      time,
      firstNamePatient,
      lastNamePatient,
      reason,
    } = data;
    const normalizedDate = normalizeDate(date);

    // Cập nhật trạng thái booking
    await connection.promise().query(
      `
        UPDATE booking
        SET statusId = 'S3'
        WHERE doctorId = ? AND patientId = ? AND date = ? AND statusId = 'S2'
      `,
      [doctorId, patientId, normalizedDate]
    );

    // Gửi email (giả lập)
    console.log(`Sending remedy to ${email} with attachment...`);
    // Thực tế bạn sẽ sử dụng một thư viện gửi email như nodemailer để thực hiện việc này
    // await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả lập delay

    // Lấy tên bác sĩ và bệnh nhân
    let [doctorInfo] = await connection
      .promise()
      .query("SELECT firstName, lastName FROM users WHERE id = ?", [doctorId]);
    const doctorName =
      doctorInfo.length > 0
        ? `${doctorInfo[0].firstName} ${doctorInfo[0].lastName}`
        : "Bác sĩ";

    const patientName = `${firstNamePatient} ${lastNamePatient}`;

    await sendResultEmail({
      reciverEmail: email,
      patientName: patientName,
      doctorName: doctorName,
      image: image,
      time: time,
      reason: reason,
    });

    console.log(`Remedy sent to ${email} successfully.`);
    status.errCode = 0;
    status.errMessage = "Remedy sent successfully";
    return status;
  } catch (error) {
    console.log("sendRemedy error:", error);
    status.errCode = 1;
    status.errMessage = error.message || "Database error";
    status.data = [];
    return status;
  }
};
module.exports = {
  getTopDoctorHome,
  getDetailDoctorById,
  getAllDoctorHome,
  saveDetailInfoDoctor,
  PostScheduleDoctor,
  GetcheScheduleDoctorByDate,
  GetListPatientForDoctor,
  sendRemedy,
};
