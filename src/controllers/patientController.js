const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

/**
 * @desc    Get all patients with search, filter, pagination
 * @route   GET /api/patients
 * @access  Private
 * Query params:
 *   - page, limit
 *   - search (name or condition)
 *   - condition
 *   - doctorId
 *   - startDate / endDate
 */
const getPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Search by name or condition
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { condition: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Filter by patient condition
    if (req.query.condition) {
      filter.condition = { $regex: req.query.condition, $options: 'i' };
    }

    // Filter by doctor
    if (req.query.doctorId) {
      filter.doctor = req.query.doctorId;
    }

    // Date-wise filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate('doctor', 'name specialization hospital') // Get doctor info
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
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single patient
 * @route   GET /api/patients/:id
 * @access  Private
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      'doctor',
      'name specialization hospital'
    );
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update patient information
 * @route   PUT /api/patients/:id
 * @access  Private
 */
const updatePatient = async (req, res, next) => {
  try {
    const { name, age, condition, phone, email, doctor } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update only provided fields
    if (name !== undefined) patient.name = name;
    if (age !== undefined) patient.age = age;
    if (condition !== undefined) patient.condition = condition;
    if (phone !== undefined) patient.phone = phone;
    if (email !== undefined) patient.email = email;
    if (doctor !== undefined) {
      // Verify new doctor exists
      const doctorExists = await Doctor.findById(doctor);
      if (!doctorExists) {
        return res.status(400).json({ message: 'Doctor not found' });
      }
      patient.doctor = doctor;
    }

    const updated = await patient.save();
    await updated.populate('doctor', 'name specialization hospital');

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a patient
 * @route   DELETE /api/patients/:id
 * @access  Private
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await patient.deleteOne();
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
