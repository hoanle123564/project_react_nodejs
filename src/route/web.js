const express = require("express");

// middleware
const authMiddleware = require("../MiiddleWare/authMiddleware");

// user controller
const {
  handleLogin,
  handleGetAllUser,
  handleCreateNewUserAPI,
  handleEditUserAPI,
  handleDeleteNewUserAPI,
  getLookUp,
} = require("../controller/userController");

// doctor controller
const {
  getTopDoctor,
  getDetailDoctor,
  getAllDoctor,
  postInfoDoctor,
  CreateScheduleDoctor,
  GetcheScheduleDoctor,
  getListPatientForDoctor,
  postSendRemedy,
} = require("../controller/doctorController");

// patient controller
const {
  postBookAppointment,
  postVerifyBookAppointment,
  getAllPatient,
} = require("../controller/patientController");

// specialty controller
const {
  postCreateSpecialty,
  getAllSpecialty,
  getDetailSpecialtyById,
  handleDeleteSpecialty,
  handleEditSpecialty,
} = require("../controller/specialtyController");

// clinic controller
const {
  postCreateClinic,
  getAllClinic,
  getDetailClinicById,
  handleDeleteClinic,
  handleEditClinic,
} = require("../controller/clinicController");
const router = express.Router();

router.post("/api/login", handleLogin);
router.get("/api/get-all-user", handleGetAllUser);
router.post("/api/create-new-user", authMiddleware, handleCreateNewUserAPI);
router.put("/api/edit-user", authMiddleware, handleEditUserAPI);
router.delete("/api/delete-user", authMiddleware, handleDeleteNewUserAPI);
router.get("/api/lookup", getLookUp);

// doctocr routes
router.get("/api/top-doctor", getTopDoctor);
router.get("/api/all-doctor", getAllDoctor);
router.get("/api/detail-doctor", getDetailDoctor);
router.post("/api/save-doctor", authMiddleware, postInfoDoctor);
router.post("/api/create-schedule-doctor", authMiddleware, CreateScheduleDoctor);
router.get("/api/get-schedule-doctor", authMiddleware, GetcheScheduleDoctor);
router.get("/api/get-list-patient-for-doctor", authMiddleware, getListPatientForDoctor);
router.post("/api/send-remedy", authMiddleware, postSendRemedy);

// patient routes
router.post("/api/patient-book-appointment", postBookAppointment);
router.post("/api/verify-book-appointment", postVerifyBookAppointment);
router.get("/api/all-patien", getAllPatient);

// specialty routes
router.post("/api/create-specialty", authMiddleware, postCreateSpecialty);
router.delete("/api/delete-specialty", authMiddleware, handleDeleteSpecialty);
router.put("/api/edit-specialty", authMiddleware, handleEditSpecialty);
router.get("/api/get-specialty", getAllSpecialty);
router.get("/api/get-detail-specialty-by-id", getDetailSpecialtyById);

// clinic routes
router.post("/api/create-clinic", authMiddleware, postCreateClinic);
router.delete("/api/delete-clinic", authMiddleware, handleDeleteClinic);
router.put("/api/edit-clinic", authMiddleware, handleEditClinic);
router.get("/api/get-clinic", getAllClinic);
router.get("/api/get-detail-clinic-by-id", getDetailClinicById);

module.exports = router;
