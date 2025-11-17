const { bookAppointment, verifyBookAppointment, AllPatient, ListBookingForPatient, cancelBookAppointment } = require("../service/PatientService");

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
const getAllPatient = async (req, res) => {
    try {
        let respone = await AllPatient();
        return res.status(200).json(respone);
    } catch (error) {
        console.log("AllPatient error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

const getListBookingForPatient = async (req, res) => {
    try {
        let patientId = req.query.id// Assuming authMiddleware sets req.user
        let respone = await ListBookingForPatient(patientId);
        return res.status(200).json(respone);
    } catch (error) {
        console.log("getListBookingForPatient error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};
const postCancelBookAppointment = async (req, res) => {
    try {
        let respone = await cancelBookAppointment(req.body);
        return res.status(200).json(respone);

    } catch (error) {
        console.log("postCancelBookAppointment error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};
module.exports = {
    postBookAppointment,
    postVerifyBookAppointment,
    getAllPatient,
    getListBookingForPatient,
    postCancelBookAppointment
};