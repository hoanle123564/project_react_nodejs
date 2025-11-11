const connection = require("../config/data");
const moment = require("moment");

const getTopDoctorHome = async (limit) => {
    const status = {};
    try {
        // Lấy ra thông tin bác sĩ từ 2 bảng: Users, Allcodes (position)
        const limitNum = Number(limit) || 5;
        const [rows] = await connection.promise().query(
            `SELECT 
        u.id, u.email, u.firstName, u.lastName, u.address,
        u.gender, u.positionId, u.roleId, u.image, u.phoneNumber,
        p.value_vi AS positionVi, p.value_en AS positionEn,
        g.value_vi AS genderVi, g.value_en AS genderEn
      FROM users AS u
      LEFT JOIN Allcodes AS p ON u.positionId = p.keyMap AND p.type = 'POSITION'
      LEFT JOIN Allcodes AS g ON u.gender = g.keyMap AND g.type = 'GENDER'
      WHERE u.roleId = 'R2'
      ORDER BY u.createdAt DESC
      LIMIT ?`,
            [limitNum]
        );
        status.errCode = 0;
        status.errMessage = 'OK';
        status.data = rows;
        return status;
    } catch (error) {
        console.log('getTopDoctorHome error:', error);
        status.errCode = 1;
        status.errMessage = error;
        status.data = [];
        return status;
    }
};


const getDetailDoctorById = async (id) => {
    const status = {};

    try {
        if (!id) {
            status.errCode = 1;
            status.errMessage = 'Missing required parameter: doctorId';
            status.data = [];
            return status;
        }

        const [rows] = await connection.promise().query(
            `
   SELECT 
        u.id, u.email, u.firstName, u.lastName, u.address, u.phoneNumber, u.image,
        u.gender, u.positionId, u.roleId,
        p.value_vi AS positionVi, p.value_en AS positionEn,
        g.value_vi AS genderVi, g.value_en AS genderEn,
        m.contentHTML, m.contentMarkdown, m.description,
        m.createdAt AS markdownCreatedAt, m.updatedAt AS markdownUpdatedAt,

        dc.priceId, dc.paymentId, dc.addressClinic, dc.nameClinic,dc.province,
        dc.startDate, dc.endDate,
        pri.value_vi AS priceVi, pri.value_en AS priceEn,
        pay.value_vi AS paymentVi, pay.value_en AS paymentEn

      FROM Users AS u
      LEFT JOIN Allcodes AS p 
        ON u.positionId = p.keyMap AND p.type = 'POSITION'
      LEFT JOIN Allcodes AS g 
        ON u.gender = g.keyMap AND g.type = 'GENDER'
      LEFT JOIN Markdown AS m 
        ON m.doctorId = u.id
      LEFT JOIN Doctor_Clinic AS dc 
        ON dc.doctorId = u.id
      LEFT JOIN Allcodes AS pri
        ON dc.priceId = pri.keyMap AND pri.type = 'PRICE'
      LEFT JOIN Allcodes AS pay
        ON dc.paymentId = pay.keyMap AND pay.type = 'PAYMENT'
      WHERE u.id = ? AND u.roleId = 'R2';
      `,
            [id]
        );

        if (rows.length > 0) {
            status.errCode = 0;
            status.errMessage = 'OK';
            status.data = rows[0];
        } else {
            status.errCode = 2;
            status.errMessage = 'Doctor not found';
            status.data = {};
        }

        return status;
    } catch (error) {
        console.log('getDetailDoctorById error:', error);
        status.errCode = 1;
        status.errMessage = error.message || 'Database error';
        status.data = [];
        return status;
    }
};

const getAllDoctorHome = async () => {
    const status = {}

    let [rows] = await connection.promise().query(
        `SELECT * FROM users WHERE roleId = 'R2'`
    );
    status.errCode = 0;
    status.errMessage = `0K`;
    status.data = rows;
    return status;
}

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
            !data.nameClinic ||
            !data.addressClinic
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
            province,
            nameClinic,
            addressClinic,
            description
        } = data;

        console.log(">>> Save doctor detail:", data);

        // ====== 1️⃣ Markdown ======
        const [checkMarkdown] = await connection
            .promise()
            .query(`SELECT id FROM Markdown WHERE doctorId = ?`, [doctorId]);
        console.log('checkMarkdown', checkMarkdown);

        if (checkMarkdown.length > 0) {
            await connection.promise().query(
                `
          UPDATE Markdown
          SET contentHTML = ?, contentMarkdown = ?, description = ?
          WHERE doctorId = ?
        `,
                [contentHTML, contentMarkdown, description || null, doctorId]
            );
        } else {
            await connection.promise().query(
                `
          INSERT INTO Markdown (contentHTML, contentMarkdown, description, doctorId)
          VALUES (?, ?, ?, ?)
        `,
                [contentHTML, contentMarkdown, description || null, doctorId]
            );
        }

        // ====== 2️⃣ Doctor_Clinic ======
        const [checkClinic] = await connection.promise().query(
            `SELECT id FROM doctor_clinic WHERE doctorId = ?`,
            [doctorId]
        );
        if (checkClinic.length > 0) {
            // Cập nhật nếu đã tồn tại
            await connection.promise().query(
                `
          UPDATE doctor_clinic
          SET priceId = ?, paymentId = ?, nameClinic = ?, addressClinic = ?, province = ?
          WHERE doctorId = ? 
        `,
                [
                    priceId,
                    paymentId,
                    nameClinic,
                    addressClinic,
                    province,
                    doctorId,
                ]
            );
        } else {
            // Thêm mới nếu chưa có
            await connection.promise().query(
                `
          INSERT INTO doctor_clinic 
          (doctorId, nameClinic, priceId, paymentId, addressClinic,province)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
                [doctorId, nameClinic, priceId, paymentId, addressClinic, province]
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
        let values = timeType.map((slot) => [
            maxNumber,
            doctorId,
            date,
            slot,
        ]);
        console.log("Bulk insert values:", values);

        const [rows] = await connection
            .promise()
            .query(`SELECT doctorId, date, timeType FROM schedule`);

        // ✅ Lọc trùng
        values = values.filter((v) => {
            return !rows.some((row) => {
                console.log('row.date', row.date);

                const rowDate = moment(row.date).format("YYYY-MM-DD");
                v[2] = moment(v[2], ["DD/MM/YYYY", moment.ISO_8601]).format("YYYY-MM-DD");
                return (
                    Number(row.doctorId) === Number(v[1]) &&
                    rowDate === v[2] &&
                    row.timeType === v[3]
                );
            });
        });

        console.log("Values after filter:", values);

        // ✅ Chuyển tất cả date về YYYY-DD-MM một lần nữa để chắc chắn
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
      VALUES ?`
            ,
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
    console.log('doctorId, date', doctorId, date);

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
        a.value_vi , a.value_en 
        FROM schedule AS s
        LEFT JOIN allcodes AS a ON s.timeType = a.keyMap AND a.type = 'TIME'
        WHERE s.doctorId = ? AND s.date = ?
        ORDER BY s.timeType ASC
      `,
            [doctorId, normalizedDate]
        );
        console.log('schedules', rows);

        status.errCode = 0;
        status.errMessage = "OK";
        status.data = rows;
        return status;
    }
    catch (error) {
        console.log("GetcheScheduleDoctorByDate error:", error);
        status.errCode = 1;
        status.errMessage = error.message || "Database error";
        status.data = [];
        return status;
    }

}
module.exports = {
    getTopDoctorHome,
    getDetailDoctorById,
    getAllDoctorHome,
    saveDetailInfoDoctor,
    PostScheduleDoctor,
    GetcheScheduleDoctorByDate
};
