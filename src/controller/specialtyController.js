const { createSpecialty } = require("../service/specialtyService");

const postCreateSpecialty = async (req, res) => {
    try {
        let response = await createSpecialty(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log("postCreateSpecialty error", error);
        return res.status(400).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
}
module.exports = {
    postCreateSpecialty
};