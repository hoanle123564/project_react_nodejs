const { getTopDoctorHome } = require('../service/DoctorService');
const getTopDoctor = async (req, res) => {
    let limit = req.query.limit;
    if (!limit) {
        limit = 5;
    }
    try {
        const respone = await getTopDoctorHome(limit);
        return res.status(200).json(respone)
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({
            errCode: -1,
            errMessage: error,
        })
    }
}
module.exports = {
    getTopDoctor
};