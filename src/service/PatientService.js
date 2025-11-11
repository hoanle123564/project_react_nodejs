const connection = require("../config/data");
const moment = require("moment");
require("moment/locale/vi"); // bắt buộc để moment hiểu tiếng Việt

const { sendSimpleEmail } = require("./emailService");
const bookAppointment = async (data) => {
    const status = {};
    try {
        // ===== 1️⃣ Kiểm tra tham số bắt buộc =====
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
                    (email, firstName, lastName, address, gender, phoneNumber, roleId, positionId, createdAt, updatedAt) 
                    VALUES (?, ?, ?, ?, ?, ?, 'R3', 'P0', NOW(), NOW())`,
                    [email, firstName, lastName, address, gender, phoneNumber]
                );

            patientId = insertUser.insertId;
            console.log("✅ Đã tạo mới bệnh nhân:", email);
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

        // ===== 6️⃣ Tạo lịch hẹn mới (có thêm reason) =====
        const [booking] = await connection.promise().query(
            `INSERT INTO booking 
             (statusId, doctorId, patientId, date, timeType, reason, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['S1', doctorId, patientId, formattedDate, timeType, reason || null]
        );
        const [doctorInfo] = await connection
            .promise()
            .query("SELECT firstName, lastName FROM users WHERE id = ?", [doctorId]);
        const doctorName = doctorInfo.length > 0 ? `${doctorInfo[0].firstName} ${doctorInfo[0].lastName}` : "Bác sĩ";

        // ===== 7️⃣ Gửi email xác nhận =====
        await sendSimpleEmail({
            reciverEmail: email,
            patientName: firstName + " " + lastName,
            time: timeString,
            doctorName: doctorName,
            redirectLink: 'https://www.youtube.com/watch?v=0GL--Adfqhc&list=PLncHg6Kn2JT6E38Z3kit9Hnif1xC_9VqI&index=97',
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

module.exports = {
    bookAppointment,
};
