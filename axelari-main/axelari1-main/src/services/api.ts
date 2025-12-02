import axios from 'axios';

export const FASTAPI_BASE = 'http://localhost:8000/api/v1';
export const AUTH_BASE = 'http://localhost:3000';

const api = axios.create({
    baseURL: FASTAPI_BASE, // FastAPI backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const get = api.get;
export const post = api.post;
export const put = api.put;
export const del = api.delete; // 'delete' is a reserved word

export default api;
