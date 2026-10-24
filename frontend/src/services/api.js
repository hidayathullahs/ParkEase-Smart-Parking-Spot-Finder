import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
let trimmed = rawBaseUrl.trim();

// Ensure protocol is present if only hostname was passed
if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
}

// Strip trailing slashes
trimmed = trimmed.replace(/\/+$/, '');

// Ensure it ends with /api
if (!trimmed.endsWith('/api')) {
    trimmed = `${trimmed}/api`;
}

const api = axios.create({
    baseURL: trimmed,
});

// Request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
