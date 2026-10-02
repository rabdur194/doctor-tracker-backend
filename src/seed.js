require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Patient = require("./models/Patient");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected for seeding");
};
const seedData = async () => {
  try {
    await connectDB();
    //clear existing data
    await User.deleteMnay();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    console.log("cleared old data");

    //create Admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@doctortracker.com",
      password: "admin123",
    });
    console.log("Admin created", admin.email);
    const doctors = await Doctor.insertMany([
      {
        name: "Dr. Rafiqul Islam",
        specialization: "Cardiology",
        hospital: "Square Hospital, Dhaka",
        phone: "+880-1711-100101",
        email: "rafiqul.islam@hospital.com",
      },
      {
        name: "Dr. Nasrin Akter",
        specialization: "Neurology",
        hospital: "Evercare Hospital, Dhaka",
        phone: "+880-1711-100102",
        email: "nasrin.akter@hospital.com",
      },
      {
        name: "Dr. Kamal Hossain",
        specialization: "Pediatrics",
        hospital: "Dhaka Shishu Hospital",
        phone: "+880-1711-100103",
        email: "kamal.hossain@hospital.com",
      },
      {
        name: "Dr. Farhana Rahman",
        specialization: "Orthopedics",
        hospital: "Popular Diagnostic Center",
        phone: "+880-1711-100104",
        email: "farhana.rahman@hospital.com",
      },
      {
        name: "Dr. Imran Chowdhury",
        specialization: "Dermatology",
        hospital: "Labaid Specialized Hospital",
        phone: "+880-1711-100105",
        email: "imran.chowdhury@hospital.com",
      },
      {
        name: "Dr. Sabina Yasmin",
        specialization: "Gynecology",
        hospital: "Birdem General Hospital",
        phone: "+880-1711-100106",
        email: "sabina.yasmin@hospital.com",
      },
    ]);
    console.log(`creted ${doctors.length} dcotors`);
    const patientNames = [
      "Abdul Karim",
      "Fatema Begum",
      "Mohammad Ali",
      "Rokeya Khatun",
      "Jahid Hasan",
      "Nusrat Jahan",
      "Shahidul Islam",
      "Mitu Akter",
      "Rashed Khan",
      "Salma Sultana",
      "Tanvir Ahmed",
      "Jannatul Ferdous",
      "Mahmudul Hasan",
      "Sharmin Akter",
      "Rakibul Islam",
      "Nazmul Huda",
      "Ayesha Siddika",
      "Sajjad Hossain",
      "Mariam Begum",
      "Faruk Ahmed",
      "Laila Parvin",
      "Asif Mahmud",
      "Sumaiya Rahman",
      "Habibullah Khan",
      "Nargis Akter",
    ];
    const conditions = [
      "Hypertension",
      "Diabetes Type 2",
      "Migraine",
      "Asthma",
      "Arthritis",
      "Eczema",
      "Common Cold",
      "Back Pain",
      "Allergy",
      "Anxiety",
    ];
    const patients = [];
    for (let i = 0; i < 25; i++) {
      const doctor = doctors[i % doctors.length];
      patients.push({
        name: patientNames[i],
        age: 18 + Math.floor(Math.random() * 55),
        gender: i % 2 === 0 ? "male" : "female",
        condition: conditions[i % conditions.length],
        phone: `+880-17${String(10000000 + i).slice(-8)}`,
        doctor: doctor._id,
      });
    }
    await Patient.insertMany(patients);
    console.log(`Created ${patients.length} patients`);

    console.log("\nSeed completed successfully!");
    console.log("Login credentials:");
    console.log("  Email: admin@doctortracker.com");
    console.log("  Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error", error);
    process.exit(1);
  }
};
seedData();
