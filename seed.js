const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('./models/doctor');
const Patient = require('./models/patient');
const Appointment = require('./models/appointment');

require('dotenv').config();

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/doctor_appointment_v2";

const seedData = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB...");

        console.log("Clearing all old test data...");
        await Doctor.deleteMany();
        await Patient.deleteMany();
        await Appointment.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        console.log("Injecting Realistic Doctors...");
        const doctors = await Doctor.insertMany([
            { name: "Dr. Anya Sharma", email: "anya@hospital.com", password, specialization: "Cardiologist", qualification: "MD, DM", location: "Mumbai City Hospital" },
            { name: "Dr. Vikram Singh", email: "vikram@hospital.com", password, specialization: "Neurologist", qualification: "MBBS, MD", location: "Apollo Clinics, Delhi" },
            { name: "Dr. Priya Patel", email: "priya@hospital.com", password, specialization: "Pediatrician", qualification: "MBBS, DCH", location: "Sunshine Care, Pune" },
            { name: "Dr. Rohan Gupta", email: "rohan@hospital.com", password, specialization: "Dermatologist", qualification: "MD Skin", location: "ClearSkin Clinic, Bangalore" },
            { name: "Dr. Neha Verma", email: "neha@hospital.com", password, specialization: "Orthopedic", qualification: "MS Ortho", location: "Bone & Joint Center, Hyderabad" }
        ]);

        console.log("Injecting Realistic Patients...");
        const patients = await Patient.insertMany([
            { name: "Rahul Deshmukh", email: "rahul@mail.com", password },
            { name: "Sneha Nair", email: "sneha@mail.com", password },
            { name: "Amit Kumar", email: "amit@mail.com", password },
            { name: "Pooja Reddy", email: "pooja@mail.com", password },
            { name: "Karan Johar", email: "karan@mail.com", password }
        ]);

        console.log("Injecting Varied Appointments...");
        const times = ["10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:30 PM"];

        // Get actual today's date dynamically for realistic "Current Appointments"
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const formatDate = (d) => {
            // Prevents local timezone offset issues
            const offset = d.getTimezoneOffset()
            d = new Date(d.getTime() - (offset * 60 * 1000))
            return d.toISOString().split('T')[0]
        };

        const appts = [];
        for (let i = 0; i < 5; i++) {
            // 1. Current appointment (Today) - with one Doctor
            appts.push({
                doctorId: doctors[i % doctors.length]._id,
                patientId: patients[i]._id,
                patientName: patients[i].name,
                date: formatDate(today),
                time: times[i % times.length],
                status: "Accepted"
            });

            // 2. Upcoming appointment (Future) - with a DIFFERENT Doctor
            appts.push({
                doctorId: doctors[(i + 1) % doctors.length]._id,
                patientId: patients[i]._id,
                patientName: patients[i].name,
                date: formatDate(i % 2 === 0 ? tomorrow : nextWeek),
                time: times[(i + 2) % times.length],
                status: "Pending" // Mix of status vs Accepted
            });
        }

        await Appointment.insertMany(appts);
        console.log("Successfully seeded rich database!");

    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        process.exit(0);
    }
};

seedData();
