const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
    const list = await Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(200);

    res.json({ list });
};

exports.getUnreadCount = async (req, res) => {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ count });
};

exports.markAsRead = async (req, res) => {
    const n = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!n) return res.status(404).json({ message: "Notification not found" });

    n.read = true;
    await n.save();

    res.json({ message: "Marked read" });
};

exports.markAllRead = async (req, res) => {
    await Notification.updateMany({ userId: req.user.id, read: false }, { $set: { read: true } });
    res.json({ message: "All marked read" });
};
