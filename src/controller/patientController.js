const { bookAppointment, verifyBookAppointment } = require("../service/PatientService");

const postBookAppointment = async (req, res) => {
    try {
        let response = await bookAppointment(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log("postBookAppointment error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};
const postVerifyBookAppointment = async (req, res) => {
    try {
        // Logic for verifying booked appointment goes here
        let respone = await verifyBookAppointment(req.body);
        return res.status(200).json(respone);
    } catch (error) {
        console.log("postVerifyBookAppointment error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};
module.exports = {
    postBookAppointment,
    postVerifyBookAppointment
};