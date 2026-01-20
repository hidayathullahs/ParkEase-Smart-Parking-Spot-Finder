try {
    console.log('Testing routes...');
    require('./routes/authRoutes'); console.log('authRoutes ok');
    require('./routes/parkingRoutes'); console.log('parkingRoutes ok');
    require('./routes/providerRoutes'); console.log('providerRoutes ok');
    require('./routes/adminRoutes'); console.log('adminRoutes ok');
    require('./routes/bookingRoutes'); console.log('bookingRoutes ok');
    require('./routes/reviewRoutes'); console.log('reviewRoutes ok');
    console.log('ALL ROUTES OK');
} catch (e) {
    console.error('Failed loading route:', e.message);
    console.error(e.stack);
}
