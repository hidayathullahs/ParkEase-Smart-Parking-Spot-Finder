import api from './api';

const getDashboardStats = async () => {
    const response = await api.get('/provider/dashboard');
    return response.data;
};

const getMyListings = async () => {
    const response = await api.get('/provider/listings');
    return response.data;
};

const getProviderBookings = async () => {
    const response = await api.get('/bookings/provider');
    return response.data;
};

const createListing = async (listingData) => {
    const response = await api.post('/provider/listings', listingData);
    return response.data;
};

const ProviderService = {
    getDashboardStats,
    getMyListings,
    getProviderBookings,
    createListing
};

export default ProviderService;
