const connection = require("../config/data");

const createSpecialty = async (data) => {
    const status = {};
    const { name, image, descriptionHTML, descriptionMarkdown } = data;
    console.log('data specialty', data);

    try {
        if (!name || !image || !descriptionHTML) {
            status.errCode = 1;
            status.errMessage = 'Missing required parameters';
            return status;
        }
        await connection.promise().query(
            `INSERT INTO specialty (name, image, descriptionHTML, descriptionMarkdown ) 
         VALUES (?, ?, ?, ? )`,
            [name, image, descriptionHTML, descriptionMarkdown]
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


const getSpecialty = async () => {
    try {
        const [rows, fields] = await connection.promise().query(
            `SELECT * FROM specialty `
        );
        return {
            errCode: 0,
            errMessage: 'OK',
            data: rows
        };
    } catch (error) {
        console.log(" getSpecialty error:", error);
        return {
            errCode: 1,
            errMessage: 'Error from server',
            data: []
        };
    }
}
const getSpecialtyDetailById = async (specialtyId, location) => {
    try {
        if (!specialtyId) {
            return {
                errCode: 1,
                errMessage: 'Missing required parameters',
                data: {}
            };
        }
        const [rows] = await connection.promise().query(
            `SELECT * FROM specialty WHERE id = ?`,
            [specialtyId]
        );
        if (rows && rows.length > 0) {
            if (location === 'ALL') {
                const [doctorRows] = await connection.promise().query(
                    `SELECT doctorId, province FROM doctor_clinic WHERE specialtyId = ?`,
                    [specialtyId]
                );
                rows[0].doctorSpecialty = doctorRows;
            } else {
                const [doctorRows] = await connection.promise().query(
                    `SELECT doctorId, province FROM doctor_clinic WHERE specialtyId = ? AND province = ?`,
                    [specialtyId, location]
                );
                rows[0].doctorSpecialty = doctorRows;
            }
        }
        return {
            errCode: 0,
            errMessage: 'OK',
            data: rows || {}
        };
    } catch (error) {
        console.log(" getSpecialtyDetailById error:", error);
        return {
            errCode: 1,
            errMessage: 'Error from server',
            data: {}
        };
    }
}

const deleteSpecialty = async (specialtyId) => {
    const status = {};
    try {
        if (!specialtyId) {
            status.errCode = 1;
            status.errMessage = 'Missing required parameters';
            return status;
        }
        await connection.promise().query(
            `DELETE FROM specialty WHERE id = ?`,
            [specialtyId]
        );
        status.errCode = 0;
        status.errMessage = 'Delete specialty successfully';
        return status;
    }
    catch (error) {
        console.log(" deleteSpecialty error", error);
        status.errCode = 1;
        status.errMessage = 'Error from server';
        return status;
    }
};
const editSpecialty = async (data) => {
    const status = {};
    try {
        if (!data.id || !data.name || !data.descriptionHTML || !data.descriptionMarkdown) {
            status.errCode = 1;
            status.errMessage = 'Missing required parameters';
            return status;
        }
        await connection.promise().query(
            `UPDATE specialty 
         SET name = ?, descriptionHTML = ?, descriptionMarkdown = ?
            WHERE id = ?`,
            [data.name, data.descriptionHTML, data.descriptionMarkdown, data.id]
        );
        status.errCode = 0;
        status.errMessage = 'Update specialty successfully';
        return status;
    }
    catch (error) {
        console.log(" editSpecialty error", error);
        status.errCode = 1;
        status.errMessage = 'Error from server';
        return status;
    }
};

module.exports = {
    createSpecialty,
    getSpecialty,
    getSpecialtyDetailById,
    deleteSpecialty,
    editSpecialty
};