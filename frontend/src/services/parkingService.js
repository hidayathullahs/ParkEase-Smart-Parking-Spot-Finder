import api from './api';

const getAllParkings = async () => {
    const response = await api.get('/parkings');
    return response.data;
};

const getParkingById = async (id) => {
    const response = await api.get(`/parkings/${id}`);
    return response.data;
};

const getPrediction = async (id) => {
    const response = await api.get(`/parkings/${id}/predict`);
    return response.data;
};

const getDynamicPrice = async (id) => {
    const response = await api.get(`/parkings/${id}/price`);
    return response.data;
};

const ParkingService = {
    getAllParkings,
    getParkingById,
    getPrediction,
    getDynamicPrice
};

export default ParkingService;
