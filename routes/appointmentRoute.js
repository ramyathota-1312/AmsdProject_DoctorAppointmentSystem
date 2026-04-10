const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

const multer = require('multer');
const path = require('path');
const fs = require('fs');

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post("/", protect, appointmentController.bookAppointment);
router.get("/", protect, appointmentController.getAppointments);
router.put("/:id/status", protect, appointmentController.updateAppointmentStatus);
router.post("/:id/prescription", protect, upload.single('prescription'), appointmentController.uploadPrescription);

module.exports = router;
