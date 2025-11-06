const {
    getTopDoctorHome,
    getDetailDoctorById,
    getAllDoctorHome,
    saveDetailInfoDoctor,
    PostScheduleDoctor,
    GetcheScheduleDoctorByDate
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

module.exports = {
    getTopDoctor,
    getDetailDoctor,
    getAllDoctor,
    postInfoDoctor,
    CreateScheduleDoctor,
    GetcheScheduleDoctor
};
