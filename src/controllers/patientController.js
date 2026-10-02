const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// GET /api/patients
const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    if (req.query.condition) {
      filter.condition = req.query.condition;
    }

    if (req.query.doctor) {
      filter.doctor = req.query.doctor;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate("doctor", "name specialization hospital")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Patient.countDocuments(filter),
    ]);

    res.json({
      data: patients,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/patients/:id
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "doctor",
      "name specialization hospital",
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/patients
const createPatient = async (req, res) => {
  try {
    const { name, age, gender, condition, phone, doctor } = req.body;

    if (!name || !doctor) {
      return res.status(400).json({
        message: "Name and doctor are required",
      });
    }

    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      condition,
      phone,
      doctor,
    });

    const populated = await Patient.findById(patient._id).populate(
      "doctor",
      "name specialization hospital",
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/patients/:id
const updatePatient = async (req, res) => {
  try {
    if (req.body.doctor) {
      const doctorExists = await Doctor.findById(req.body.doctor);
      if (!doctorExists) {
        return res.status(400).json({ message: "Doctor not found" });
      }
    }

    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("doctor", "name specialization hospital");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/patients/:id
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ message: "Patient deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
};
