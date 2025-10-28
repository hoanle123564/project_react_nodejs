const { handleUserLogin, getAllUsers, createNewUser, deleteUser, updateUserData, getAllCodeService } = require('../service/userService')

let handleLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password

    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing input parameter'
        })
    }
    const user = await handleUserLogin(email, password)
    return res.status(200).json({
        errCode: user.errCode,
        message: user.errMessage,
        user
    })
}

let handleGetAllUser = async (req, res) => {
    const id = req.query ? req.query.id : null;
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters',
            users: []
        })
    }
    const users = await getAllUsers(id);
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        users
    })
}
const handleCreateNewUserAPI = async (req, res) => {

    const message = await createNewUser(req.body);
    return res.status(200).json(message)
}

const handleEditUserAPI = async (req, res) => {
    const data = req.body;
    const message = await updateUserData(data);
    return res.status(200).json(message)
}

const handleDeleteNewUserAPI = async (req, res) => {
    const id = req.body.id;
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters'
        })
    }
    const message = await deleteUser(id);
    return res.status(200).json(message)
}

const getAllCode = async (req, res) => {
    try {
        console.log('check req', req.query.type);

        let data = await getAllCodeService(req.query.type);
        return res.status(200).json(data)
    } catch (error) {
        console.log('Error get all code', error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from Server'
        })
    }
}
module.exports = {
    handleLogin,
    handleGetAllUser,
    handleCreateNewUserAPI,
    handleEditUserAPI,
    handleDeleteNewUserAPI,
    getAllCode
}