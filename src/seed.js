/**
 * Seed script - creates an admin user and sample doctors + patients
 * Run with: npm run seed
 */
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

    // Clear existing data
    await User.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    console.log("Cleared existing data");

    // Create admin user
    // Default credentials: admin@doctortracker.com / admin123
    const admin = await User.create({
      name: "Admin User",
      email: "admin@doctortracker.com",
      password: "admin123",
    });
    console.log("Admin created:", admin.email);

    // Sample doctors
    const doctors = await Doctor.insertMany([
      {
        name: "Dr. Sarah Johnson",
        specialization: "Cardiology",
        hospital: "City Heart Hospital",
        phone: "+1-555-0101",
        email: "sarah.johnson@hospital.com",
      },
      {
        name: "Dr. Michael Chen",
        specialization: "Neurology",
        hospital: "Metro Neuro Center",
        phone: "+1-555-0102",
        email: "michael.chen@hospital.com",
      },
      {
        name: "Dr. Emily Rodriguez",
        specialization: "Pediatrics",
        hospital: "Children Care Clinic",
        phone: "+1-555-0103",
        email: "emily.rodriguez@hospital.com",
      },
      {
        name: "Dr. James Wilson",
        specialization: "Orthopedics",
        hospital: "Bone & Joint Institute",
        phone: "+1-555-0104",
        email: "james.wilson@hospital.com",
      },
      {
        name: "Dr. Aisha Patel",
        specialization: "Dermatology",
        hospital: "Skin Health Center",
        phone: "+1-555-0105",
        email: "aisha.patel@hospital.com",
      },
    ]);
    console.log(`Created ${doctors.length} doctors`);

    // Sample patients
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
        name: `Patient ${i + 1}`,
        age: 20 + Math.floor(Math.random() * 50),
        condition: conditions[i % conditions.length],
        phone: `+1-555-${String(1000 + i).padStart(4, "0")}`,
        email: `patient${i + 1}@email.com`,
        doctor: doctor._id,
      });
    }

    await Patient.insertMany(patients);
    console.log(`Created ${patients.length} patients`);

    console.log("\n✅ Seed completed successfully!");
    console.log("Login credentials:");
    console.log("  Email: admin@doctortracker.com");
    console.log("  Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();
