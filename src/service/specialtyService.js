const connection = require("../config/data");

const createSpecialty = async (data) => {
    const status = {};
    const { name, image, descriptionHTML } = data;
    try {
        if (!name || !image || !descriptionHTML) {
            status.errCode = 1;
            status.errMessage = 'Missing required parameters';
            return status;
        }
        await connection.promise().query(
            `INSERT INTO specialty (name, image, description ) 
         VALUES (?, ?, ?)`,
            [name, image, descriptionHTML]
        );
        status.errCode = 0;
        status.errMessage = 'Create specialty successfully';
        return status;
    } catch (error) {
        console.log(" createSpecialty error:", error);
        status.errCode = 1;
        status.errMessage = 'Error from server';
        return status;
    }
}

module.exports = {
    createSpecialty
};