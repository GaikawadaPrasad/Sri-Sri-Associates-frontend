import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://sri-sri-associates-backend.onrender.com/api",
    timeout: 60000, // 60s timeout to handle Render cold starts
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            error.message = 'Request timed out. The server may be waking up — please try again.';
        }
        return Promise.reject(error);
    }
);

export default API;