const { handleUserLogin, getAllUsers, createNewUser, deleteUser, updateUserData } = require('../service/userService')

let handleLogin = async(req, res) => {
    const email = req.body.email;
    const password = req.body.password

    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing input parameter'
        })
    }
    const useData = await handleUserLogin(email, password)
    return res.status(200).json({
        errCode: useData.errCode,
        message: useData.errMessage,
        useData
    })
}

let handleGetAllUser = async(req, res) => {
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
const handleCreateNewUserAPI = async(req, res) => {

    const message = await createNewUser(req.body);
    return res.status(200).json(message)
}

const handleEditUserAPI = async(req, res) => {
    const data = req.body;
    const message = await updateUserData(data);
    return res.status(200).json(message)
}

const handleDeleteNewUserAPI = async(req, res) => {
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
module.exports = {
    handleLogin,
    handleGetAllUser,
    handleCreateNewUserAPI,
    handleEditUserAPI,
    handleDeleteNewUserAPI
}