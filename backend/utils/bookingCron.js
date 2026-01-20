const cron = require("node-cron");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

const notifyOnce = async ({ userId, booking, minutes, type }) => {
    // Avoid duplicate reminder notifications
    const exists = await Notification.findOne({
        userId,
        bookingId: booking._id,
        type,
        message: { $regex: `${minutes} minutes`, $options: "i" },
    });

    if (exists) return;

    await Notification.create({
        userId,
        bookingId: booking._id,
        type,
        title: "Parking Reminder",
        message: `Your booking (${booking.bookingId}) will expire in ${minutes} minutes. Extend if needed.`,
    });
};

const startBookingCron = () => {
    // Runs every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const in30 = new Date(now.getTime() + 30 * 60 * 1000);
            const in10 = new Date(now.getTime() + 10 * 60 * 1000);

            // 30 min reminder (endTime between 29-30 mins)
            const remind30 = await Booking.find({
                status: { $in: ["BOOKED", "CHECKED_IN"] },
                endTime: { $gte: new Date(in30.getTime() - 60 * 1000), $lte: in30 }, // 1min window
            });

            for (const b of remind30) {
                await notifyOnce({ userId: b.userId, booking: b, minutes: 30, type: "REMINDER" });
            }

            // 10 min reminder
            const remind10 = await Booking.find({
                status: { $in: ["BOOKED", "CHECKED_IN"] },
                endTime: { $gte: new Date(in10.getTime() - 60 * 1000), $lte: in10 },
            });

            for (const b of remind10) {
                await notifyOnce({ userId: b.userId, booking: b, minutes: 10, type: "REMINDER" });
            }

            const result = await Booking.updateMany(
                {
                    status: { $in: ["BOOKED", "CHECKED_IN"] },
                    endTime: { $lt: now },
                },
                {
                    $set: { status: "EXPIRED" },
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[CRON] Expired bookings updated: ${result.modifiedCount}`);
            }
        } catch (err) {
            console.error("[CRON] Booking expire error:", err.message);
        }
    });

    console.log("[CRON] Booking expiry cron started (every 1 min).");
};

module.exports = { startBookingCron };
