const Doctor = require("../models/doctor");

// Get all available doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ available: true }).select("-password");
        res.json({ success: true, count: doctors.length, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single doctor details
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select("-password");
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        res.json({ success: true, data: doctor });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid Doctor ID" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
