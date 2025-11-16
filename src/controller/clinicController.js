const {
    createClinic,
    getClinic,
    getClinicDetailById,
    deleteClinic,
    editClinic
} = require("../service/ClinicService");

const postCreateClinic = async (req, res) => {
    try {
        let response = await createClinic(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log("postCreateClinic error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};
const getAllClinic = async (req, res) => {
    try {
        let respone = await getClinic();
        return res.status(200).json(respone);
    } catch (error) {
        console.log("getAllClinic error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

const getDetailClinicById = async (req, res) => {
    try {
        const clinicId = req.query.id;
        const location = req.query.location;
        let response = await getClinicDetailById(clinicId, location);
        return res.status(200).json(response);
    } catch (error) {
        console.log("getDetailClinicById error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};
const handleDeleteClinic = async (req, res) => {
    try {
        const clinicId = req.body.id;
        let response = await deleteClinic(clinicId);
        return res.status(200).json(response);
    }
    catch (error) {
        console.log("handleDeleteClinic error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

const handleEditClinic = async (req, res) => {
    try {
        const data = req.body;
        let response = await editClinic(data);
        return res.status(200).json(response);
    }
    catch (error) {
        console.log("handleEditClinic error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

module.exports = { postCreateClinic, getAllClinic, getDetailClinicById, handleDeleteClinic, handleEditClinic };
