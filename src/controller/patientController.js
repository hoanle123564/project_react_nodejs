const { bookAppointment } = require("../service/PatientService");

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
module.exports = {
    postBookAppointment,
};