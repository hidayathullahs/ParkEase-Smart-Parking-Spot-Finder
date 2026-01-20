const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
    {
        bookingId: { type: String, required: true, unique: true },

        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        parkingId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingListing", required: true },

        vehicleType: {
            type: String,
            enum: ["TWO_WHEELER", "FOUR_SEATER", "SIX_SEATER", "SUV"],
            required: true,
        },

        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },

        totalHours: { type: Number, required: true },
        totalAmount: { type: Number, required: true },

        status: {
            type: String,
            enum: ["BOOKED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "EXPIRED"],
            default: "BOOKED",
        },

        qrCodeDataUrl: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
