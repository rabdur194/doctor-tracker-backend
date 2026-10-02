const express = require("express");
const router = express.Router();
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
} = require("../controllers/doctorController");
const { protect } = require("../middleware/auth");

//All doctord require login
router.use(protect);
router.route("/").get(getDoctors).post(createDoctor);
router.route("/:id").get(getDoctor).put(updateDoctor).delete(deleteDoctor);
router.get("/:id/patients", getDoctorPatients);
module.exports = router;
