const http = require('http');

const runTests = async () => {
    try {
        console.log("Starting backend tests...");
        const baseUrl = 'http://localhost:5000/api';

        // 1. Register a Patient
        const patientRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'patient',
                name: 'Test Patient',
                email: 'patient@test.com',
                password: 'password123'
            })
        });
        const patientData = await patientRes.json();
        console.log("Patient Registration:", patientData);
        let patientToken = patientData.token;

        // If user exists, just login
        if (!patientToken) {
            const logRes = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'patient', email: 'patient@test.com', password: 'password123' })
            });
            const lData = await logRes.json();
            patientToken = lData.token;
            console.log("Patient Login:", lData);
        }

        // 2. Register a Doctor
        const docRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'doctor',
                name: 'Test Doctor',
                email: 'doctor@test.com',
                password: 'password123',
                specialization: 'General',
                qualification: 'MBBS',
                location: 'Test City'
            })
        });
        const docData = await docRes.json();
        console.log("Doctor Registration:", docData);
        let docToken = docData.token;
        let docId = docData.user?._id;

        if (!docToken) {
            const logRes = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'doctor', email: 'doctor@test.com', password: 'password123' })
            });
            const lData = await logRes.json();
            docToken = lData.token;
            docId = lData.user?._id;
            console.log("Doctor Login:", lData);
        }

        // 3. Get all Doctors
        const listRes = await fetch(`${baseUrl}/doctors`);
        const listData = await listRes.json();
        console.log("Doctors List:", listData);

        // 4. Book an appointment
        const apptRes = await fetch(`${baseUrl}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientToken}` },
            body: JSON.stringify({
                doctorId: docId || listData.data[0]._id, // use fetched id from login or list
                date: '2026-10-10',
                time: '10:00 AM'
            })
        });
        const apptData = await apptRes.json();
        console.log("Book Appointment:", apptData);

        // 5. Patient sees appointments
        const pApptRes = await fetch(`${baseUrl}/appointments`, {
            headers: { 'Authorization': `Bearer ${patientToken}` }
        });
        console.log("Patient Appointments:", await pApptRes.json());

        // 6. Doctor sees appointments
        const dApptRes = await fetch(`${baseUrl}/appointments`, {
            headers: { 'Authorization': `Bearer ${docToken}` }
        });
        const dApptData = await dApptRes.json();
        console.log("Doctor Appointments:", dApptData);

        // 7. Doctor Updates Status
        if (dApptData.data && dApptData.data.length > 0) {
            const updateRes = await fetch(`${baseUrl}/appointments/${dApptData.data[0]._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
                body: JSON.stringify({ status: 'Approved' })
            });
            console.log("Update Appointment Status:", await updateRes.json());
        }

    } catch (e) {
        console.error("Test error:", e.stack || e.message);
    }
}

// Check if server is running, then run tests
http.get('http://localhost:5000/api/doctors', (res) => {
    if (res.statusCode === 200 || res.statusCode === 404) {
        runTests();
    }
}).on('error', (e) => {
    console.log("Server not running. Please start the server first.");
});
