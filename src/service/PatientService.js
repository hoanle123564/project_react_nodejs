const connection = require("../config/data");
const moment = require("moment");
require("moment/locale/vi"); // bắt buộc để moment hiểu tiếng Việt
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
const { sendSimpleEmail } = require("./emailService");


let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
    return result;
};

const bookAppointment = async (data) => {
    const status = {};
    try {
        // ===== Kiểm tra tham số bắt buộc =====
        if (
            !data ||
            !data.email ||
            !data.doctorId ||
            !data.date ||
            !data.timeType
        ) {
            status.errCode = 1;
            status.errMessage = "Missing required parameters";
            return status;
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
            timeString
        } = data;

        // ===== Chuẩn hóa định dạng ngày =====
        const formattedDate = moment(date, ["DD/MM/YYYY", moment.ISO_8601]).format(
            "YYYY-MM-DD"
        );

        // ===== 3️⃣ Kiểm tra email có tồn tại chưa =====
        const [rows] = await connection
            .promise()
            .query("SELECT id FROM users WHERE email = ?", [email]);

        let patientId;

        if (rows.length === 0) {
            // ===== 4️⃣ Nếu chưa có -> tạo user mới =====
            const [insertUser] = await connection
                .promise()
                .query(
                    `INSERT INTO users 
                    (email, firstName, lastName, address, gender, phoneNumber, roleId, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, ?, 'R3', NOW(), NOW())`,
                    [email, firstName, lastName, address, gender, phoneNumber]
                );

            patientId = insertUser.insertId;
            console.log("✅ Đã tạo mới bệnh nhân:", email, patientId, insertUser);
        } else {
            patientId = rows[0].id;
            console.log("⚠️ Bệnh nhân đã tồn tại:", email);
        }

        // ===== 5️⃣ Kiểm tra trùng lịch =====
        const [existing] = await connection
            .promise()
            .query(
                `SELECT * 
                 FROM booking 
                 WHERE doctorId = ? AND patientId = ? AND date = ? AND timeType = ?`,
                [doctorId, patientId, formattedDate, timeType]
            );

        if (existing.length > 0) {
            status.errCode = 2;
            status.errMessage =
                "You already booked this doctor for the same time slot today!";
            return status;
        }
        const token = uuidv4();

        // ===== 6️⃣ Tạo lịch hẹn mới (có thêm reason) =====
        const [booking] = await connection.promise().query(
            `INSERT INTO booking 
             (statusId, doctorId, patientId, date, timeType, reason, token, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?,?, NOW(), NOW())`,
            ['S1', doctorId, patientId, formattedDate, timeType, reason || null, token]
        );

        const [doctorInfo] = await connection
            .promise()
            .query("SELECT firstName, lastName FROM users WHERE id = ?", [doctorId]);
        const doctorName = doctorInfo.length > 0 ? `${doctorInfo[0].firstName} ${doctorInfo[0].lastName}` : "Bác sĩ";

        ;
        // ===== 7️⃣ Gửi email xác nhận =====
        await sendSimpleEmail({
            reciverEmail: email,
            patientName: firstName + " " + lastName,
            time: timeString,
            doctorName: doctorName,
            redirectLink: buildUrlEmail(doctorId, token),
        });

        console.log("✅ Đặt lịch khám thành công cho:", email);

        status.errCode = 0;
        status.errMessage = "Booking appointment successfully!";
        status.data = booking;
        return status;
    } catch (error) {
        console.log("❌ bookAppointment error:", error);
        status.errCode = 1;
        status.errMessage = error.message || "Database error";
        status.data = [];
        return status;
    }
};

const verifyBookAppointment = async (data) => {
    const status = {};
    try {
        // ===== Kiểm tra tham số bắt buộc =====
        if (!data || !data.token || !data.doctorId) {
            status.errCode = 1;
            status.errMessage = "Missing required parameters";
            return status;
        }
        const { token, doctorId } = data;

        // ===== 2️⃣ Tìm kiếm lịch hẹn =====
        const [rows] = await connection
            .promise()
            .query(
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
        await connection
            .promise()
            .query(
                `UPDATE booking 
                 SET statusId = 'S2', updatedAt = NOW() 
                 WHERE doctorId = ? AND token = ? AND statusId = 'S1'`,
                [doctorId, token]
            );
        status.errCode = 0;
        status.errMessage = "Appointment activated successfully!";
        return status;
    }
    catch (error) {
        console.log("❌ verifyBookAppointment error:", error);
        status.errCode = 1;
        status.errMessage = error.message || "Database error";
        return status;
    }
};

module.exports = {
    bookAppointment,
    verifyBookAppointment
};
