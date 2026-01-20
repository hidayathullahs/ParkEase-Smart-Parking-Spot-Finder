try {
    require('uuid');
    console.log('uuid loaded');
    require('qrcode');
    console.log('qrcode loaded');
    require('./routes/bookingRoutes');
    console.log('bookingRoutes loaded');
} catch (e) {
    console.error('Error loading:', e);
}
