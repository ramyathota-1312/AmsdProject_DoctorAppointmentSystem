const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function insertDummy() {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Doc_app";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();

        // Pick an existing doctor to assign the notification to, or just make a fake ObjectId if none exist
        const doctor = await db.collection('doctors').findOne({});
        const userId = doctor ? doctor._id : new ObjectId();

        await db.collection('notifications').insertOne({
            userId,
            userModel: 'Doctor',
            message: 'Hello! This is a test notification injected directly into MongoDB to verify the connection.',
            type: 'info',
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log("Inserted test notification!");
        process.exit(0);
    } catch (err) {
        console.error("Failed", err);
        process.exit(1);
    }
}

insertDummy();
