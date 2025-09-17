const connection = require('../config/data')
const bcrypt = require("bcrypt");
const { hashPassword } = require('../service/CRUDservice')


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

const getAllUsers = async(userId) => {
    try {
        if (userId === 'ALL') {
            const [rows] = await connection.promise().query(`SELECT * FROM users `)
            const users = rows.map(({ password, ...rest }) => rest);

            console.log('rows >>', rows);
            return users

        }
        if (userId && userId !== 'ALL') {
            const [rows] = await connection.promise().query(`SELECT * FROM users where id = ?`, [userId])
            const users = rows.map(({ password, ...rest }) => rest);
            console.log('rows >>', rows);

            return users

        }

    } catch (error) {
        console.log(error);
    }
}
const createNewUser = async(data) => {
    const status = {}
    const check = await checkEmail(data.email)
    if (check) {
        status.errCode = 1
        status.errMessage = `Email is exist. Try another`;
        return status
    }
    const pass = data.password
    data.password = await hashPassword(pass);
    data.gender = data.gender === '1' ? true : false
    const { email, password, fistname, lastname, address, gender, role, phonenumber } = data
    // const id = 3
    try {
        const [results, fields] = await connection.promise().query(`INSERT INTO users(email,password,firstName,	lastName,address,gender	,roleId,phoneNumber) 
            VALUES (?,?,?,?,?,?,?,?)`, [email, password, fistname, lastname, address, gender, role, phonenumber])
        status.errCode = 0;
        status.errMessage = `0K`;
        return status
    } catch (error) {
        console.log(error);
        return error
    }
}
module.exports = { handleUserLogin, getAllUsers, createNewUser }