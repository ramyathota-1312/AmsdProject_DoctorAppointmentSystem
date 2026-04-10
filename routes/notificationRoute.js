const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Notification = require("../models/notification");

// Get all notifications for the logged-in user
router.get("/", protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Mark a notification as read
router.put("/:id/read", protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (notification.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to update this notification" });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a generic notification (usually called internally by other controllers)
exports.createNotification = async (userId, userModel, message, type = 'info') => {
    try {
        await Notification.create({
            userId,
            userModel,
            message,
            type
        });
    } catch (err) {
        console.error("Failed to create notification:", err.message);
    }
};

module.exports = {
    router,
    createNotification: exports.createNotification
};
