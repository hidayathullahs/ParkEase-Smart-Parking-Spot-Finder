import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}/provider/dashboard`, { headers: getAuthHeader() });
    return response.data;
};

const getMyListings = async () => {
    const response = await axios.get(`${API_URL}/provider/listings`, { headers: getAuthHeader() });
    return response.data;
};

const getProviderBookings = async () => {
    const response = await axios.get(`${API_URL}/provider/bookings`, { headers: getAuthHeader() });
    return response.data;
};

const createListing = async (listingData) => {
    const response = await axios.post(`${API_URL}/provider/listings`, listingData, { headers: getAuthHeader() });
    return response.data;
};

const ProviderService = {
    getDashboardStats,
    getMyListings,
    getProviderBookings,
    createListing
};

export default ProviderService;
