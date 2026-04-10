const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  patientName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Accepted", "Rejected", "Completed", "Cancelled"], default: "Pending" },
  prescriptionUrl: { type: String, default: null }
}, {
  timestamps: true,
  collection: 'appointments'
});

module.exports = mongoose.model("Appointment", appointmentSchema);