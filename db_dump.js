const { MongoClient } = require('mongodb');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function dump() {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/doctor_appointment_v2";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();

        // Fetch specifically from patients, doctors, and notifications collections
        const patients = await db.collection('patients').find({}).limit(5).toArray();
        const doctors = await db.collection('doctors').find({}).limit(5).toArray();
        const notifications = await db.collection('notifications').find({}).limit(10).toArray();

        fs.writeFileSync(path.join(__dirname, 'db_output.json'), JSON.stringify({
            patients,
            doctors,
            notifications
        }, null, 2));

        console.log("Successfully exported db_output.json");
        process.exit(0);
    } catch (err) {
        fs.writeFileSync(path.join(__dirname, 'db_error.txt'), err.toString());
        console.error("Failed", err);
        process.exit(1);
    }
}

dump();
