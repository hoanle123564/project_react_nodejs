const connection = require('../config/data')

const createClinic = async (clinicData) => {
    const status = {};
    const { name, image, address, descriptionHTML, descriptionMarkdown } = clinicData;

    try {
        if (!name || !image || !descriptionHTML || !address) {
            status.errCode = 1;
            status.errMessage = 'Missing required parameters';
            return status;
        }
        await connection.promise().query(
            `INSERT INTO clinic (name, image, address, descriptionHTML, descriptionMarkdown ) 
         VALUES (?, ?, ?, ?, ? )`,
            [name, image, address, descriptionHTML, descriptionMarkdown]
        );
        status.errCode = 0;
        status.errMessage = 'Create clinic successfully';
        return status;

    } catch (error) {
        console.log(" createClinic error:", error);
        status.errCode = 1;
        status.errMessage = 'Error from server';
        return status;
    }
};

const getClinic = async () => {
    try {
        const [rows, fields] = await connection.promise().query(
            `SELECT * FROM clinic `
        );
        return {
            errCode: 0,
            errMessage: 'OK',
            data: rows
        };

    } catch (error) {
        console.log(" getClinic error:", error);
        return {
            errCode: 1,
            errMessage: 'Error from server',
            data: []
        };
    }
}

const getClinicDetailById = async (clinicId, location) => {
    try {
        if (!clinicId) {
            return {
                errCode: 1,
                errMessage: 'Missing required parameters',
                data: {}
            };
        }
        const [rows] = await connection.promise().query(
            `SELECT * FROM clinic WHERE id = ?`,
            [clinicId]
        );
        if (rows && rows.length > 0) {
            if (location === 'ALL') {
                let [doctorClinic] = await connection.promise().query(
                    `SELECT doctorId, province FROM doctor_clinic WHERE clinicId = ?`,
                    [clinicId]
                );
                rows[0].doctorClinic = doctorClinic;

            } else {
                let [doctorClinic] = await connection.promise().query(
                    `SELECT doctorId, province FROM doctor_clinic WHERE clinicId = ? AND province = ?`,
                    [clinicId, location]
                );
                rows[0].doctorClinic = doctorClinic;

            }
        }
        return {
            errCode: 0,
            errMessage: 'OK',
            data: rows || {}
        };

    } catch (error) {
        console.log(" getClinicDetailById error:", error);
        return {
            errCode: 1,
            errMessage: 'Error from server',
            data: {}
        };
    }
}

const deleteClinic = async (clinicId) => {
    const status = {};
    try {
        if (!clinicId) {
            status.errCode = 1;
            status.errMessage = 'Missing required parameters';
            return status;
        }
        const [row] = await connection.promise().query(
            `SELECT * FROM clinic WHERE id = ?`,
            [clinicId]
        );
        if (row.length === 0) {
            status.errCode = 2;
            status.errMessage = `The clinic with id ${clinicId} does not exist`;
            return status;
        }
        await connection.promise().query(
            `DELETE FROM clinic WHERE id = ?`,
            [clinicId]
        );
        status.errCode = 0;
        status.errMessage = 'Delete clinic successfully';
        return status;
    } catch (error) {
        console.log(" deleteClinic error:", error);
        status.errCode = 1;
        status.errMessage = 'Error from server';
        return status;
    }
};

const editClinic = async (data) => {
    const status = {};
    try {
        if (!data.id || !data.name || !data.address || !data.descriptionHTML || !data.descriptionMarkdown) {
            status.errCode = 1;
            status.errMessage = 'Missing required parameters';
            return status;
        }
        const [row] = await connection.promise().query(
            `SELECT * FROM clinic WHERE id = ?`,
            [data.id]
        );
        if (row.length === 0) {
            status.errCode = 2;
            status.errMessage = `The clinic with id ${data.id} does not exist`;
            return status;
        }
        await connection.promise().query(
            `UPDATE clinic 
             SET name = ?, address = ?, descriptionHTML = ?, descriptionMarkdown = ?
                WHERE id = ?`,
            [data.name, data.address, data.descriptionHTML, data.descriptionMarkdown, data.id]
        );
        status.errCode = 0;
        status.errMessage = 'Update clinic successfully';
        return status;
    } catch (error) {
        console.log(" editClinic error:", error);
        status.errCode = 1;
        status.errMessage = 'Error from server';
        return status;
    }
};
module.exports = {
    createClinic,
    getClinic,
    getClinicDetailById,
    deleteClinic,
    editClinic
};