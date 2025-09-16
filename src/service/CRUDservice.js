const connection = require('../config/data')
const bcrypt = require("bcrypt");
const saltRounds = 10; // Số vòng lặp (độ phức tạp)

const createNewUser = async(data) => {
    const pass = data.password
    data.password = await hashPassword(pass);
    data.gender = data.gender === '1' ? true : false
    const { email, password, fistname, lastname, address, gender, role, phonenumber } = data
    // const id = 2
    try {
        const [results, fields] = await connection.promise().query(`INSERT INTO users(email,	password,firstName,	lastName,address,gender	,roleId,phoneNumber) 
            VALUES (?,?,?,?,?,?,?,?)`, [id, email, password, fistname, lastname, address, gender, role, phonenumber])
        console.log(data);
    } catch (error) {
        console.log(error);
    }

}

// 🔹 Hash mật khẩu trước khi lưu
const hashPassword = async(password) => {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Mật khẩu đã hash:", hash);
    return hash;
}

const getAllUser = async() => {
    try {
        const [results, fields] = await connection.promise().query(`SELECT * FROM users`);
        console.log(results);

    } catch (error) {
        console.log(error);
    }

}
module.exports = {
    createNewUser,
    hashPassword,
    checkPassword,
    getAllUser
}