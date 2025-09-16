const handleUserLogin = require('../service/userService')
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
module.exports = handleLogin