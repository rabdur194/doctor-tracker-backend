const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/dashboard
 * @access  Private
 * Returns:
 *  - totalDoctors
 *  - totalPatients
 *  - patientsPerDoctor (array)
 *  - dateBasedStats (patients/doctors created per day for last 30 days)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // Total counts - simple and fast
    const [totalDoctors, totalPatients] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
    ]);

    // Patients per doctor (aggregation for performance)
    const patientsPerDoctor = await Patient.aggregate([
      {
        $group: {
          _id: '$doctor',
          patientCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'doctors', // collection name (lowercase plural)
          localField: '_id',
          foreignField: '_id',
          as: 'doctorInfo',
        },
      },
      {
        $unwind: {
          path: '$doctorInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          doctorId: '$_id',
          doctorName: '$doctorInfo.name',
          specialization: '$doctorInfo.specialization',
          patientCount: 1,
          _id: 0,
        },
      },
      {
        $sort: { patientCount: -1 },
      },
    ]);

    // Date-based stats: last 30 days of new patients & doctors
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const patientsByDate = await Patient.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const doctorsByDate = await Doctor.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Condition distribution (for pie chart)
    const conditionStats = await Patient.aggregate([
      {
        $group: {
          _id: '$condition',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 }, // Top 10 conditions
    ]);

    res.json({
      totalDoctors,
      totalPatients,
      patientsPerDoctor,
      patientsByDate,
      doctorsByDate,
      conditionStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
