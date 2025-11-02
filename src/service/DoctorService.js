const connection = require("../config/data");

const getTopDoctorHome = async (limit) => {
    const status = {};
    try {
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

module.exports = {
    getTopDoctorHome,
};
