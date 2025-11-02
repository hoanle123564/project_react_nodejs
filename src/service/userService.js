const connection = require('../config/data')
const bcrypt = require("bcrypt");
const { hashPassword } = require('../service/CRUDservice')


const handleUserLogin = async (email, pass) => {
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
const checkEmail = async (email) => {
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

const getAllUsers = async (userId) => {
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
const createNewUser = async (data) => {
    const status = {}
    console.log("Received data:", data);

    const check = await checkEmail(data.email)
    try {
        if (check) {
            status.errCode = 1
            status.errMessage = `Email is exist. Try another`;
            return status
        }
        const pass = data.password
        data.password = await hashPassword(pass);
        const { email, password, firstName, lastName, address, gender, roleId, phoneNumber, positionId, avatar } = data;
        console.log('check data');

        // const id = 3

        const [results, fields] = await connection.promise().query(
            `INSERT INTO users(email,password,firstName,lastName,address,gender,positionId,roleId,phoneNumber,image)
   VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [email, password, firstName, lastName, address, gender, positionId, roleId, phoneNumber, avatar]
        );
        status.errCode = 0;
        status.errMessage = `0K`;
        return status
    } catch (error) {
        console.log(error);
        return error
    }
}

const deleteUser = async (id) => {
    const status = {}
    const [rows] = await connection.promise().query(`SELECT * FROM users where id = ? `, [id])
    if (rows.length > 0) {
        await connection.promise().query(`DELETE FROM users where id = ? `, [id])
        status.errCode = 0;
        status.errMessage = 'Delete user succeed'
    } else {
        status.errCode = 1;
        status.errMessage = `User is't exist`
    }
    return status
}

const updateUserData = async (data) => {
    const status = {};
    const id = data ? data.id : null
    const [rows] = await connection.promise().query(`SELECT * FROM users where id = ? `, [id])

    if (rows.length > 0) {
        const { email, password, firstName, lastName, address, gender, roleId, phoneNumber, positionId, avatar } = data;
        await connection.promise().query(
            `UPDATE users 
       SET firstName = ?, lastName = ?, email = ?, address = ?, gender = ?, roleId = ?, 
           phoneNumber = ?, positionId = ?, image = ? 
       WHERE id = ?`,
            [
                firstName,
                lastName,
                email,
                address,
                gender,
                roleId,
                phoneNumber,
                positionId,
                avatar,
                id,
            ]
        );
        status.errCode = 0;
        status.errMessage = 'Update user succeed!';
    } else {
        status.errCode = 1;
        status.errMessage = `User not found!`;
    }
    return status
}

const getAllCodeService = async (type) => {
    let message = {};
    try {
        const [rows] = await connection.promise().query('select * from Allcodes where type = ?', [type]);
        message.errCode = 0;
        message.errMessage = 'Done';
        message.data = rows;
        return message

    } catch (error) {
        message.errCode = 1;
        message.errMessage = 'Error';
        return error
    }
}
module.exports = { handleUserLogin, getAllUsers, createNewUser, deleteUser, updateUserData, getAllCodeService }