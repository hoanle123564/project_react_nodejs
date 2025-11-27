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
            `SELECT id, email, password FROM users WHERE email = ?`,
            [email]
        );

        // Nếu email đã tồn tại
        if (check.length > 0) {
            const existingUser = check[0];

            // Kiểm tra nếu là khách vãng lai (không có mật khẩu hoặc mật khẩu null)
            if (!existingUser.password || existingUser.password === null || existingUser.password === '') {
                // Cập nhật thông tin cho khách vãng lai
                const hashedPass = await bcrypt.hash(password, 10);

                await connection.promise().query(
                    `UPDATE users 
                     SET password = ?, firstName = ?, lastName = ?, address = ?, 
                         gender = ?, roleId = ?, phoneNumber = ?, positionId = ?, image = ?
                     WHERE id = ?`,
                    [
                        hashedPass, firstName, lastName,
                        address || null, gender || null,
                        roleId || null, phoneNumber || null,
                        positionId || null, image || null,
                        existingUser.id
                    ]
                );

                return {
                    errCode: 0,
                    errMessage: "Guest account upgraded to full user successfully",
                    userId: existingUser.id
                };
            }

            // Nếu email đã có tài khoản đầy đủ
            return { errCode: 2, errMessage: "Email already exists" };
        }

        // Tạo mới user nếu email chưa tồn tại
        const hashedPass = await bcrypt.hash(password, 10);

        const [result] = await connection.promise().query(
            `INSERT INTO users(email, password, firstName, lastName, address, gender, roleId, phoneNumber, positionId, image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                email, hashedPass, firstName, lastName,
                address || null, gender || null,
                roleId || null, phoneNumber || null,
                positionId || null, image || null
            ]
        );

        return {
            errCode: 0,
            errMessage: "User created successfully",
            userId: result.insertId
        };

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
            `SELECT id, roleId FROM users WHERE id = ?`,
            [id]
        );

        if (check.length === 0) {
            return { errCode: 2, errMessage: "User does not exist" };
        }

        const user = check[0];

        // Kiểm tra nếu là bác sĩ (R2)
        if (user.roleId === 'R2') {
            // Kiểm tra lịch làm việc
            const [schedules] = await connection.promise().query(
                `SELECT id FROM schedule WHERE doctorId = ? LIMIT 1`,
                [id]
            );

            if (schedules.length > 0) {
                return {
                    errCode: 3,
                    errMessage: "Cannot delete doctor with existing schedules"
                };
            }

            // Kiểm tra lịch khám bệnh đang hoạt động (không bao gồm S3 - Đã khám và S4 - Đã hủy)
            const [activeBookings] = await connection.promise().query(
                `SELECT id FROM booking 
                 WHERE doctorId = ? 
                 AND statusId NOT IN ('S3', 'S4') 
                 LIMIT 1`,
                [id]
            );

            if (activeBookings.length > 0) {
                return {
                    errCode: 4,
                    errMessage: "Cannot delete doctor with active bookings. Only completed (S3) or cancelled (S4) bookings are allowed."
                };
            }

            // Xóa tất cả booking đã hoàn thành hoặc đã hủy của bác sĩ
            await connection.promise().query(
                `DELETE FROM booking 
                 WHERE doctorId = ? 
                 AND statusId IN ('S3', 'S4')`,
                [id]
            );

            // Xóa thông tin bác sĩ (doctor_info)
            await connection.promise().query(
                `DELETE FROM doctor_info WHERE doctorId = ?`,
                [id]
            );
        }

        // Kiểm tra nếu là bệnh nhân (R3)
        if (user.roleId === 'R3') {
            // Kiểm tra lịch khám đang hoạt động
            const [activeBookings] = await connection.promise().query(
                `SELECT id FROM booking 
                 WHERE patientId = ? 
                 AND statusId NOT IN ('S3', 'S4') 
                 LIMIT 1`,
                [id]
            );

            if (activeBookings.length > 0) {
                return {
                    errCode: 5,
                    errMessage: "Cannot delete patient with active bookings. Only completed (S3) or cancelled (S4) bookings are allowed."
                };
            }

            // Xóa tất cả booking đã hoàn thành hoặc đã hủy của bệnh nhân
            await connection.promise().query(
                `DELETE FROM booking 
                 WHERE patientId = ? 
                 AND statusId IN ('S3', 'S4')`,
                [id]
            );
        }

        // Xóa user
        await connection.promise().query(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );

        return { errCode: 0, errMessage: "User and related data deleted successfully" };

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
        let [edit] = await connection.promise().query(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );
        edit = edit.map(({ password, ...rest }) => rest)[0];

        return { errCode: 0, errMessage: "Update successful", data: edit || [] };

    } catch (error) {
        console.log("updateUserService error:", error);
        return { errCode: -1, errMessage: "Error from server" };
    }
};


// GET ALL LOOKUP
const getLookUpService = async (type) => {
    try {
        if (!type) {
            return { errCode: 1, errMessage: "Missing required parameter", data: [] };
        }

        const [rows] = await connection.promise().query(
            `
            SELECT *
            FROM lookup
            WHERE type = ?
            ORDER BY STR_TO_DATE(SUBSTRING_INDEX(value_vi, ' - ', 1), '%H:%i')
            `,
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
