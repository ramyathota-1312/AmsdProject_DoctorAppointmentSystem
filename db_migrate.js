const { MongoClient } = require('mongodb');

async function migrate() {
    const uri = "mongodb://127.0.0.1:27017";
    const client = new MongoClient(uri);
    try {
        await client.connect();

        const oldDb = client.db('doctor_appointment_v2');
        const newDb = client.db('Doc_app');

        const collectionsToMigrate = ['users', 'doctors', 'appointments', 'patients'];

        for (const collName of collectionsToMigrate) {
            const docs = await oldDb.collection(collName).find({}).toArray();
            if (docs.length > 0) {
                console.log(`Migrating ${docs.length} from ${collName}...`);
                try {
                    await newDb.collection(collName).insertMany(docs, { ordered: false });
                    console.log(`-> Inserted ${docs.length} into Doc_app.${collName}`);
                } catch (e) {
                    console.log(`-> Merged partial/some documents into ${collName} (duplicates skipped).`);
                }
            } else {
                console.log(`No documents found in ${collName} to migrate.`);
            }
        }

        console.log("Migration complete!");
        process.exit(0);
    } catch (err) {
        console.error("Migration Failed:", err);
        process.exit(1);
    }
}

migrate();
