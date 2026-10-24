import api from './api';

const getPendingListings = async () => {
    const response = await api.get('/admin/parkings/pending');
    return response.data;
};

const approveListing = async (id) => {
    const response = await api.put(`/admin/parkings/${id}/approve`, {});
    return response.data;
};

const rejectListing = async (id, reason) => {
    const response = await api.put(`/admin/parkings/${id}/reject`, { reason });
    return response.data;
};

const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

const getSystemStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

const getRevenueStats = async () => {
    const response = await api.get('/admin/revenue-stats');
    return response.data;
};

const getApprovedListings = async () => {
    const response = await api.get('/admin/parkings/approved');
    return response.data;
};

const updateUser = async (id, updates) => {
    const response = await api.put(`/admin/users/${id}`, updates);
    return response.data;
};

const AdminService = {
    getPendingListings,
    approveListing,
    rejectListing,
    getAllUsers,
    getSystemStats,
    getRevenueStats,
    getApprovedListings,
    updateUser
};

export default AdminService;
