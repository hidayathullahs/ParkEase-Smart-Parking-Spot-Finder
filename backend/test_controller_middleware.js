try {
    console.log('Testing authMiddleware...');
    require('./middleware/authMiddleware');
    console.log('authMiddleware loaded');

    console.log('Testing bookingController...');
    require('./controllers/bookingController');
    console.log('bookingController loaded');
} catch (e) {
    console.error('FAIL:', e.message);
    console.error('Stack:', e.stack);
}
