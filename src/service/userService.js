const connection = require('../config/data')
const bcrypt = require("bcrypt");

const handleUserLogin = async(email, pass) => {
    try {
        const isExistMail = await checkEmail(email);

        const userData = {};
        if (isExistMail) {
            const [rows] = await connection.promise().query(`SELECT * FROM users where email = ?`, [email])
            const user = rows[0];
            const hashPassword = user.password;
            const checkPass = await bcrypt.compare(pass, hashPassword)
            if (checkPass) {
                userData.errCode = 0;
                userData.errMessage = 'Oke';
                userData.user = user
            } else {
                userData.errCode = 2;
                userData.errMessage = 'Wrong password';
            }
        } else {
            userData.errCode = 1;
            userData.errMessage = `Your email isn't exist. Try other email`
        }
        return userData

    } catch (error) {
        console.log(error);
    }

}
const checkEmail = async(email) => {
    try {
        const [results, fields] = await connection.promise().query(`SELECT * FROM users Where email = ?`, [email])

        if (results.length > 0) {
            return true;
        } else {
            return false
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = handleUserLogin