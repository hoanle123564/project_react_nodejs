const express = require("express");
const {
  getHomePage,
  getCRUD,
  postCRUD,
  displayGetCRUD,
} = require("../controller/homeController");
const {
  handleLogin,
  handleGetAllUser,
  handleCreateNewUserAPI,
  handleEditUserAPI,
  handleDeleteNewUserAPI,
  getAllCode,
} = require("../controller/userController");

const {
  getTopDoctor,
  getDetailDoctor,
  getAllDoctor,
  postInfoDoctor,
  CreateScheduleDoctor,
  GetcheScheduleDoctor,
} = require("../controller/doctorController");

const { postBookAppointment, postVerifyBookAppointment } = require("../controller/patientController");
const { postCreateSpecialty, getAllSpecialty, getDetailSpecialtyById } = require("../controller/specialtyController");
const router = express.Router();

router.get("/crud", getCRUD);
router.get("/display-crud", displayGetCRUD);
router.post("/post-crud", postCRUD);
router.get("/", getHomePage);
router.post("/api/login", handleLogin);
router.get("/api/get-all-user", handleGetAllUser);
router.post("/api/create-new-user", handleCreateNewUserAPI);
router.put("/api/edit-user", handleEditUserAPI);
router.delete("/api/delete-user", handleDeleteNewUserAPI);
router.get("/api/allcodes", getAllCode);

// doctocr routes
router.get("/api/top-doctor", getTopDoctor);
router.get("/api/all-doctor", getAllDoctor);
router.get("/api/detail-doctor", getDetailDoctor);
router.post("/api/save-doctor", postInfoDoctor);
router.post("/api/create-schedule-doctor", CreateScheduleDoctor);
router.get("/api/get-schedule-doctor", GetcheScheduleDoctor);

// patient routes
router.post("/api/patient-book-appointment", postBookAppointment);
router.post("/api/verify-book-appointment", postVerifyBookAppointment);

// specialty routes
router.post("/api/create-specialty", postCreateSpecialty);
router.get("/api/get-specialty", getAllSpecialty);
router.get("/api/get-detail-specialty-by-id", getDetailSpecialtyById);

// clinic routes
module.exports = router;
