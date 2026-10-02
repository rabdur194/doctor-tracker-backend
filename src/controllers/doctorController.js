//handling all doctors business logic list
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
//route GET /api/doctors
//query: search, specialization,limit, start,end
const getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    //text search on name/hospital
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    //filter by specialization
    if (req.query.specialization) {
      filter.specialization = req.query.specialization;
    }
    //Date wise filter(createdAt)
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    const [doctors, total] = await Promise.all([
      Doctor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Doctor.countDocuments(filter),
    ]);
    res.json({
      data: doctors,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//route-> GET /api/doctors/:id
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//route POST /api/doctors
const createDoctor = async (req, res) => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;
    if (!name || !specialization || !hospital) {
      return res.status(400).json({
        message: "Name, Specialization and hospital are Required",
      });
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
    res.status(500).json({ message: error.message });
  }
};

//@route PUT /api/doctors/:id
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //return updated doc
      runValidators: true,
    });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Route DELTE /api/doctors/:id
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not Found" });
    //also removing patients udner this doctor
    await Patient.deleteMany({ doctor: doctor._id });
    await doctor.deleteOne();
    res.json({ message: "Doctor Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//route GET /api/doctors/:id/patients
const getDoctorPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not Found" });
    }
    const patients = await Patient.find({ doctor: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
};
