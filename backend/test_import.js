try {
    const { startBookingCron } = require('./utils/bookingCron');
    console.log('BookingCron loaded successfully');
} catch (e) {
    console.error(e);
}
