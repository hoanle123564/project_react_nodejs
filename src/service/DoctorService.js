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
        m.createdAt AS markdownCreatedAt, m.updatedAt AS markdownUpdatedAt
      FROM Users AS u
      LEFT JOIN Allcodes AS p 
        ON u.positionId = p.keyMap AND p.type = 'POSITION'
      LEFT JOIN Allcodes AS g 
        ON u.gender = g.keyMap AND g.type = 'GENDER'
      LEFT JOIN Markdown AS m 
        ON m.doctorId = u.id
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
        if (!data || !data.contentHTML || !data.contentMarkdown || !data.doctorId) {
            status.errCode = 1;
            status.errMessage = 'Missing required parameters';
            return status;
        }

        const { contentHTML, contentMarkdown, description, doctorId } = data;
        console.log("data", data);

        // Kiểm tra xem doctorId đã có markdown chưa
        const [check] = await connection.promise().query(
            `SELECT id FROM Markdown WHERE doctorId = ?`,
            [doctorId]
        );

        if (check.length > 0) {
            // Nếu đã có → cập nhật
            const [result] = await connection.promise().query(
                `
                UPDATE Markdown 
                SET contentHTML = ?, contentMarkdown = ?, description = ?
                WHERE doctorId = ?
                `,
                [contentHTML, contentMarkdown, description || null, doctorId]
            );

            status.errCode = 0;
            status.errMessage = 'Update markdown successfully';
            status.data = result;
        } else {
            // Nếu chưa có → thêm mới
            const [result] = await connection.promise().query(
                `
                INSERT INTO Markdown (contentHTML, contentMarkdown, description, doctorId)
                VALUES (?, ?, ?, ?)
                `,
                [contentHTML, contentMarkdown, description || null, doctorId]
            );

            status.errCode = 0;
            status.errMessage = 'Insert markdown successfully';
            status.data = result;
        }

        return status;
    } catch (error) {
        console.log('UpdateDetailInfoDoctor error:', error);
        status.errCode = 1;
        status.errMessage = error.message || 'Database error';
        status.data = [];
        return status;
    }
}



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

        // ✅ Chuẩn hóa định dạng ngày (trước khi dùng)


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

        // ✅ Insert dữ liệu chuẩn
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


module.exports = {
    getTopDoctorHome,
    getDetailDoctorById,
    getAllDoctorHome,
    saveDetailInfoDoctor,
    PostScheduleDoctor
};
