const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        title: { type: String, required: true },
        message: { type: String, required: true },

        type: {
            type: String,
            enum: ["BOOKING", "REMINDER", "EXPIRE"],
            default: "BOOKING",
        },

        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
