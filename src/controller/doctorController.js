const {
    getTopDoctorHome,
    getDetailDoctorById,
    getAllDoctorHome,
    saveDetailInfoDoctor,
    PostScheduleDoctor,
    GetcheScheduleDoctorByDate,
    GetListPatientForDoctor,
    sendRemedy,
    deleteScheduleDoctor,
    GetListAppointment,
    ListBooking
} = require("../service/DoctorService");
const getTopDoctor = async (req, res) => {
    let limit = req.query.limit;
    if (!limit) {
        limit = 5;
    }
    try {
        const respone = await getTopDoctorHome(limit);
        return res.status(200).json(respone);
    } catch (error) {
        console.log("error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: error,
        });
    }
};
const getAllDoctor = async (req, res) => {
    try {
        const respone = await getAllDoctorHome();
        return res.status(200).json(respone);
    } catch (error) {
        console.log("getAllDoctor error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};
const getDetailDoctor = async (req, res) => {
    try {
        let respone = await getDetailDoctorById(req.query.id);
        return res.status(200).json(respone);
    } catch (error) {
        console.log("getDetailDoctor error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

const postInfoDoctor = async (req, res) => {
    try {
        let response = await saveDetailInfoDoctor(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log("postInfoDoctor error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

const CreateScheduleDoctor = async (req, res) => {
    try {
        let response = await PostScheduleDoctor(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log("CreateScheduleDoctor error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

const GetcheScheduleDoctor = async (req, res) => {
    try {
        let doctorId = req.query.doctorId;
        let date = req.query.date;
        let response = await GetcheScheduleDoctorByDate(doctorId, date);
        console.log('response', response);

        return res.status(200).json(response);

    } catch (error) {
        console.log("GetcheScheduleDoctor error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
}

const getListPatientForDoctor = async (req, res) => {
    try {
        let doctorId = req.query.id;
        let date = req.query.date;
        let response = await GetListPatientForDoctor(doctorId, date);
        return res.status(200).json(response);
    } catch (error) {
        console.log("getListPatientForDoctor error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};
const postSendRemedy = async (req, res) => {
    try {
        // Logic for sending remedy goes here
        let response = await sendRemedy(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log("postSendRemedy error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

const handleDeleteScheduleDoctor = async (req, res) => {
    try {
        let scheduleId = req.body.id;
        let response = await deleteScheduleDoctor(scheduleId);
        return res.status(200).json(response);
    }
    catch (error) {
        console.log("handleDeleteScheduleDoctor error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

const getListAppointmentForDoctor = async (req, res) => {
    try {
        let doctorId = req.query.id;
        let response = await GetListAppointment(doctorId);
        return res.status(200).json(response);
    } catch (error) {
        console.log("getListAppointmentForDoctor error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

const getListBooking = async (req, res) => {
    try {
        let response = await ListBooking();
        return res.status(200).json(response);
    } catch (error) {
        console.log("getListBooking error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

module.exports = {
    getTopDoctor,
    getDetailDoctor,
    getAllDoctor,
    postInfoDoctor,
    CreateScheduleDoctor,
    GetcheScheduleDoctor,
    getListPatientForDoctor,
    postSendRemedy,
    handleDeleteScheduleDoctor,
    getListAppointmentForDoctor,
    getListBooking
};
