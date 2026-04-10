const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Load models
const Patient = require('./models/patient');
const Doctor = require('./models/doctor');
const Notification = require('./models/notification');
const Appointment = require('./models/appointment');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Connected to MongoDB!");
        console.log("-----------------------------------------");

        const patients = await Patient.find({}).lean();
        console.log(`PATIENTS (${patients.length}):`);
        console.log(JSON.stringify(patients, null, 2));
        console.log("-----------------------------------------");

        const doctors = await Doctor.find({}).lean();
        console.log(`DOCTORS (${doctors.length}):`);
        console.log(JSON.stringify(doctors, null, 2));
        console.log("-----------------------------------------");

        const notifications = await Notification.find({}).lean();
        console.log(`NOTIFICATIONS (${notifications.length}):`);
        console.log(JSON.stringify(notifications, null, 2));
        console.log("-----------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("Error connecting to DB:", error);
        process.exit(1);
    }
}

checkDB();
