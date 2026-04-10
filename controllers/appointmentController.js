const Appointment = require("../models/appointment");
const Doctor = require("../models/doctor");

const sendEmail = require("../utils/email");

// Book an appointment (Patient)
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;
        const patientId = req.user.id;
        const patientName = req.user.name || "Patient";

        const Patient = require("../models/patient");
        const patientUser = await Patient.findById(patientId);

        if (!doctorId || !date || !time) {
            return res.status(400).json({ success: false, message: "Please provide doctorId, date, and time" });
        }

        const newAppointment = await Appointment.create({
            doctorId,
            patientId,
            patientName: patientUser ? patientUser.name : patientName,
            date,
            time
        });

        // Notify Doctor
        const doctor = await Doctor.findById(doctorId);
        if (doctor) {
            const { createNotification } = require("../routes/notificationRoute");
            await createNotification(
                doctorId,
                'Doctor',
                `New appointment booked by ${newAppointment.patientName} for ${date} at ${time}.`,
                'info'
            );

            if (doctor.email) {
                await sendEmail({
                    email: doctor.email,
                    subject: 'New Appointment Booked - DocBook',
                    message: `Hello Dr. ${doctor.name},\n\nYou have a new appointment booked by ${newAppointment.patientName} on ${newAppointment.date} at ${newAppointment.time}.\n\nPlease check your dashboard to accept or reject this appointment.`
                });
            }
        }

        res.status(201).json({ success: true, data: newAppointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all appointments for the logged-in user (Patient or Doctor)
exports.getAppointments = async (req, res) => {
    try {
        let query;
        if (req.user.role === "doctor") {
            query = { doctorId: req.user.id };
        } else {
            query = { patientId: req.user.id };
        }

        const appointments = await Appointment.find(query)
            .populate("doctorId", "-password")
            .populate("patientId", "-password")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Appointment Status (Doctor)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;

        if (req.user.role !== "doctor") {
            return res.status(403).json({ success: false, message: "Only doctors can update appointment statuses" });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.doctorId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to update this appointment" });
        }

        appointment.status = status;
        await appointment.save();

        const { createNotification } = require("../routes/notificationRoute");

        // Notify Patient if Approved/Accepted/Rejected
        if (status === 'Accepted' || status === 'Rejected' || status === 'Completed') {
            const Patient = require("../models/patient");
            const patient = await Patient.findById(appointment.patientId);
            if (patient && patient.email) {
                const doctor = await Doctor.findById(appointment.doctorId);

                // Mongoose Notification
                await createNotification(
                    patient._id,
                    'Patient',
                    `Your appointment with Dr. ${doctor.name} was ${status}.`,
                    status === 'Accepted' ? 'success' : status === 'Rejected' ? 'alert' : 'info'
                );

                await sendEmail({
                    email: patient.email,
                    subject: `Appointment ${status} - DocBook`,
                    message: `Hello ${patient.name},\n\nYour appointment with Dr. ${doctor.name} on ${appointment.date} at ${appointment.time} has been ${status}.\n\nThank you for using DocBook!`
                });
            }
        }

        res.json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload Prescription (Doctor)
exports.uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload a prescription PDF" });
        }

        if (req.user.role !== "doctor") {
            return res.status(403).json({ success: false, message: "Only doctors can upload prescriptions" });
        }

        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

        // Build the URL to serve the file
        appointment.prescriptionUrl = `/uploads/${req.file.filename}`;
        await appointment.save();

        res.json({ success: true, data: appointment, url: appointment.prescriptionUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
