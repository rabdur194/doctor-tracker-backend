const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const getDashboard = async (req, res) => {
  try {
    //totals
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    //Patients per Doctor- Bar chart
    const patientsPerDoctor = await Patient.aggregate([
      {
        $group: {
          _id: "doctor", //group by doctor field
          count: { $sum: 1 }, //count patients
        },
      },

      //joining doctor collection names
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo", //result array
        },
      },
      //doctorInfo is an array, unwind to a single object
      { $unwind: { path: "$doctorInfo", preserveNullAndEmptyArrays: true } },
      //shape the output for forntend chart
      {
        $project: {
          _id: 0,
          doctorId: "$_id",
          doctorName: { $ifNull: ["$doctorInfo.name", "Unknown"] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Top conditions for PIE Chart
    const topConditions = await Patient.aggregate([
      {
        $match: {
          condition: { $exists: true, $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: "$condition", //group by condition text
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          condition: "$_id",
          count: 1,
        },
      },
    ]);

    //History for Line-cahrt
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activityRaw = await Patient.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);
    res.json({
      totals: {
        doctors: totalDoctors,
        patients: totalPatients,
      },
      patientsPerDoctor, //bar chart
      topConditions,
      activity: activityRaw,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getDashboard };
