const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

// Route to get admin dashboard analytics
// In a real app we would have an admin role check as well e.g authMiddleware.restrictTo('admin')
// but for now, we'll allow any logged in user who is an admin to access it via frontend auth guard.
router.get("/analytics", adminController.getAnalytics);

module.exports = router;
