const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

/**
 * @desc    Create a new doctor
 * @route   POST /api/doctors
 * @access  Private
 */
const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    // Basic validation
    if (!name || !specialization || !hospital || !phone || !email) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email,
    });

    res.status(201).json(doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all doctors with search, filter, pagination
 * @route   GET /api/doctors
 * @access  Private
 * Query params:
 *   - page (default 1)
 *   - limit (default 10)
 *   - search (searches name, specialization, hospital)
 *   - specialization
 *   - hospital
 *   - startDate / endDate (filter by createdAt)
 */
const getDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object dynamically
    const filter = {};

    // Text search across name, specialization, hospital
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { specialization: { $regex: req.query.search, $options: 'i' } },
        { hospital: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Filter by specialization
    if (req.query.specialization) {
      filter.specialization = { $regex: req.query.specialization, $options: 'i' };
    }

    // Filter by hospital
    if (req.query.hospital) {
      filter.hospital = { $regex: req.query.hospital, $options: 'i' };
    }

    // Date-wise filter (createdAt)
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        // Include the whole end day
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Execute query with pagination
    // .lean() returns plain JS objects (faster)
    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(filter),
    ]);

    res.json({
      doctors,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Private
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patients of a specific doctor (with pagination)
 * @route   GET /api/doctors/:id/patients
 * @access  Private
 */
const getDoctorPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const doctorId = req.params.id;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const filter = { doctor: doctorId };

    // Optional search on patient name/condition
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { condition: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(filter),
    ]);

    res.json({
      patients,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      doctor: { _id: doctor._id, name: doctor.name },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a patient under a specific doctor
 * @route   POST /api/doctors/:id/patients
 * @access  Private
 */
const addPatientToDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const { name, age, condition, phone, email } = req.body;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!name || age === undefined || !condition || !phone) {
      return res.status(400).json({ message: 'Please provide name, age, condition and phone' });
    }

    const patient = await Patient.create({
      name,
      age,
      condition,
      phone,
      email,
      doctor: doctorId,
    });

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a patient from a doctor's list
 * @route   DELETE /api/doctors/:doctorId/patients/:patientId
 * @access  Private
 */
const deletePatientFromDoctor = async (req, res, next) => {
  try {
    const { doctorId, patientId } = req.params;

    const patient = await Patient.findOne({ _id: patientId, doctor: doctorId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found under this doctor' });
    }

    await patient.deleteOne();
    res.json({ message: 'Patient removed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a doctor (optional - and cascade delete patients? here we just delete doctor)
 * @route   DELETE /api/doctors/:id
 * @access  Private
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Optionally delete related patients
    await Patient.deleteMany({ doctor: doctor._id });
    await doctor.deleteOne();

    res.json({ message: 'Doctor and related patients deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  getDoctorPatients,
  addPatientToDoctor,
  deletePatientFromDoctor,
  deleteDoctor,
};
