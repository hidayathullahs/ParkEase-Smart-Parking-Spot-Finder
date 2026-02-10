import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

const getPendingListings = async () => {
    const response = await axios.get(`${API_URL}/admin/listings/pending`, { headers: getAuthHeader() });
    return response.data;
};

const approveListing = async (id) => {
    const response = await axios.put(`${API_URL}/admin/listings/${id}/approve`, {}, { headers: getAuthHeader() });
    return response.data;
};

const rejectListing = async (id, reason) => {
    const response = await axios.put(`${API_URL}/admin/listings/${id}/reject`, { reason }, { headers: getAuthHeader() });
    return response.data;
};

const getAllUsers = async () => {
    const response = await axios.get(`${API_URL}/admin/users`, { headers: getAuthHeader() });
    return response.data;
};

const getSystemStats = async () => {
    const response = await axios.get(`${API_URL}/admin/stats`, { headers: getAuthHeader() });
    return response.data;
};

const AdminService = {
    getPendingListings,
    approveListing,
    rejectListing,
    getAllUsers,
    getSystemStats
};

export default AdminService;
