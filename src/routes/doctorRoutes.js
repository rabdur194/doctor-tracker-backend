const express = require('express');
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  getDoctorPatients,
  addPatientToDoctor,
  deletePatientFromDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All doctor routes are protected
router.use(protect);

router.route('/')
  .get(getDoctors)
  .post(createDoctor);

router.route('/:id')
  .get(getDoctorById)
  .delete(deleteDoctor);

router.route('/:id/patients')
  .get(getDoctorPatients)
  .post(addPatientToDoctor);

router.route('/:doctorId/patients/:patientId')
  .delete(deletePatientFromDoctor);

module.exports = router;
