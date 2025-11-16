const {
    handleUserLoginService,
    getAllUsersService,
    createNewUserService,
    deleteUserService,
    updateUserService,
    getAllCodeService
} = require('../service/userService');


// LOGIN
const handleLogin = async (req, res) => {
    try {
        const response = await handleUserLoginService(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log("handleLogin error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server"
        });
    }
};


// GET ALL USERS
const handleGetAllUser = async (req, res) => {
    try {
        const response = await getAllUsersService(req.query.id);
        return res.status(200).json(response);
    } catch (error) {
        console.log("handleGetAllUser error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
            users: []
        });
    }
};


// CREATE USER
const handleCreateNewUserAPI = async (req, res) => {
    try {
        const response = await createNewUserService(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log("handleCreateNewUserAPI error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server"
        });
    }
};


// EDIT USER
const handleEditUserAPI = async (req, res) => {
    try {
        const response = await updateUserService(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log("handleEditUserAPI error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server"
        });
    }
};


// DELETE USER
const handleDeleteNewUserAPI = async (req, res) => {
    try {
        const response = await deleteUserService(req.body.id);
        return res.status(200).json(response);
    } catch (error) {
        console.log("handleDeleteNewUserAPI error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server"
        });
    }
};


// GET ALLCODE
const getAllCode = async (req, res) => {
    try {
        const response = await getAllCodeService(req.query.type);
        return res.status(200).json(response);
    } catch (error) {
        console.log("getAllCode error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server"
        });
    }
};


module.exports = {
    handleLogin,
    handleGetAllUser,
    handleCreateNewUserAPI,
    handleEditUserAPI,
    handleDeleteNewUserAPI,
    getAllCode
};
