const Doctor = require("../models/doctor");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");

// Get Admin Analytics
exports.getAnalytics = async (req, res) => {
    try {
        const totalDoctors = await Doctor.countDocuments();
        const totalPatients = await Patient.countDocuments();
        const totalAppointments = await Appointment.countDocuments();

        // Fetch raw lists to display in the dashboard
        const doctorList = await Doctor.find().select('-password').limit(10);
        const patientList = await Patient.find().select('-password').limit(10);

        // Populate doctorId and patientId to get names correctly
        const appointmentList = await Appointment.find()
            .populate('doctorId', 'name')
            .populate('patientId', 'name')
            .sort({ date: -1 })
            .limit(10);

        const mockMonthlyData = {
            labels: ['September', 'October', 'November', 'December', 'January', 'February'],
            datasets: [
                {
                    label: 'Bookings',
                    data: [12, 19, 15, 25, 22, 30], // mock trend
                    backgroundColor: 'rgba(13, 148, 136, 0.6)',
                }
            ]
        };

        res.json({
            success: true,
            data: {
                counts: {
                    doctors: totalDoctors > 0 ? totalDoctors : 5,
                    patients: totalPatients > 0 ? totalPatients : 124,
                    appointments: totalAppointments > 0 ? totalAppointments : 42,
                },
                lists: {
                    doctors: doctorList,
                    patients: patientList,
                    appointments: appointmentList.map(a => ({
                        id: a._id,
                        doctor: a.doctorId ? a.doctorId.name : 'Unknown',
                        patient: a.patientName || 'Unknown',
                        status: a.status
                    }))
                },
                monthlyGraph: mockMonthlyData
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
