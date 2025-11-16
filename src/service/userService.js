const connection = require("../config/data");
const bcrypt = require("bcrypt");
const { createToken } = require("../jwtService");


// LOGIN SERVICE
const handleUserLoginService = async (data) => {
    try {
        const { email, password } = data;

        if (!email || !password) {
            return {
                errCode: 1,
                errMessage: "Missing required parameters",
                user: null,
                token: null,
                data: {}
            };
        }

        const [rows] = await connection.promise().query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );

        if (rows.length === 0) {
            return {
                errCode: 2,
                errMessage: "Email does not exist",
                user: null,
                token: null,
                data: {}
            };
        }

        const user = rows[0];
        const checkPass = await bcrypt.compare(password, user.password);
        if (!checkPass) {
            return {
                errCode: 3,
                errMessage: "Wrong password",
                user: null,
                token: null,
                data: {}
            };
        }

        const { password: pw, ...cleanUser } = user;

        const token = createToken({
            id: user.id,
            email: user.email,
            roleId: user.roleId
        });

        return {
            errCode: 0,
            errMessage: "Login success",

            // format mới
            user: cleanUser,
            token: token,

            // format cũ
            data: {
                user: cleanUser,
                token: token
            }
        };

    } catch (error) {
        console.log("handleUserLoginService error:", error);
        return {
            errCode: -1,
            errMessage: "Server error",
            user: null,
            token: null,
            data: {}
        };
    }
};



// GET ALL USERS
const getAllUsersService = async (id) => {
    try {
        if (!id) {
            return { errCode: 1, errMessage: "Missing required parameter", data: [] };
        }

        if (id === "ALL") {
            const [rows] = await connection.promise().query(`SELECT * FROM users`);
            const users = rows.map(({ password, ...rest }) => rest);

            return {
                errCode: 0,
                errMessage: "OK",
                users: users
            };
        }

        const [rows] = await connection.promise().query(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return {
                errCode: 2,
                errMessage: "User not found",
                users: []
            };
        }

        const users = rows.map(({ password, ...rest }) => rest);

        return {
            errCode: 0,
            errMessage: "OK",
            users: users
        };

    } catch (error) {
        console.log("getAllUsersService error:", error);
        return {
            errCode: -1,
            errMessage: "Error from server",
            users: []
        };
    }
};



// CREATE USER
const createNewUserService = async (data) => {
    try {
        const { email, password, firstName, lastName, address, gender, roleId, phoneNumber, positionId, image } = data;

        if (!email || !password || !firstName || !lastName) {
            return { errCode: 1, errMessage: "Missing required parameters" };
        }

        const [check] = await connection.promise().query(
            `SELECT id FROM users WHERE email = ?`,
            [email]
        );

        if (check.length > 0) {
            return { errCode: 2, errMessage: "Email already exists" };
        }

        const hashedPass = await bcrypt.hash(password, 10);

        await connection.promise().query(
            `INSERT INTO users(email, password, firstName, lastName, address, gender, roleId, phoneNumber, positionId, image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                email, hashedPass, firstName, lastName,
                address || null, gender || null,
                roleId || null, phoneNumber || null,
                positionId || null, image || null
            ]
        );

        return { errCode: 0, errMessage: "User created successfully" };

    } catch (error) {
        console.log("createNewUserService error:", error);
        return { errCode: -1, errMessage: "Error from server" };
    }
};


// DELETE USER
const deleteUserService = async (id) => {
    try {
        if (!id) {
            return { errCode: 1, errMessage: "Missing required parameter" };
        }

        const [check] = await connection.promise().query(
            `SELECT id FROM users WHERE id = ?`,
            [id]
        );

        if (check.length === 0) {
            return { errCode: 2, errMessage: "User does not exist" };
        }

        await connection.promise().query(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );

        return { errCode: 0, errMessage: "User deleted successfully" };

    } catch (error) {
        console.log("deleteUserService error:", error);
        return { errCode: -1, errMessage: "Error from server" };
    }
};


// UPDATE USER
const updateUserService = async (data) => {
    try {
        const { id, firstName, lastName, email, address, gender, roleId, phoneNumber, positionId, image } = data;
        if (image) { console.log('image in service:'); }

        if (!id) {
            return { errCode: 1, errMessage: "Missing required parameter" };
        }

        const [check] = await connection.promise().query(
            `SELECT id FROM users WHERE id = ?`,
            [id]
        );

        if (check.length === 0) {
            return { errCode: 2, errMessage: "User not found" };
        }

        await connection.promise().query(
            `UPDATE users SET firstName=?, lastName=?, email=?, address=?, gender=?, roleId=?, phoneNumber=?, positionId=?, image=? WHERE id=?`,
            [
                firstName || null, lastName || null, email || null,
                address || null, gender || null, roleId || null,
                phoneNumber || null, positionId || null, image || null,
                id
            ]
        );

        return { errCode: 0, errMessage: "Update successful" };

    } catch (error) {
        console.log("updateUserService error:", error);
        return { errCode: -1, errMessage: "Error from server" };
    }
};


// GET ALL CODE
const getLookUpService = async (type) => {
    try {
        if (!type) {
            return { errCode: 1, errMessage: "Missing required parameter", data: [] };
        }

        const [rows] = await connection.promise().query(
            `SELECT * FROM lookup WHERE type = ?`,
            [type]
        );

        return { errCode: 0, errMessage: "OK", data: rows };

    } catch (error) {
        console.log("getLookUpService error:", error);
        return { errCode: -1, errMessage: "Error from server", data: [] };
    }
};


module.exports = {
    handleUserLoginService,
    getAllUsersService,
    createNewUserService,
    deleteUserService,
    updateUserService,
    getLookUpService
};
