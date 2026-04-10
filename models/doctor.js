const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  qualification: { type: String, required: true },
  location: { type: String, required: true },
  available: { type: Boolean, default: true }
}, { timestamps: true, collection: 'doctors' });

module.exports = mongoose.model("Doctor", doctorSchema);