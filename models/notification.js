const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor', 'Admin']
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'alert'],
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, collection: 'notifications' });

module.exports = mongoose.model("Notification", notificationSchema);
