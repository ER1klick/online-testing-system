import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("ОШИБКА API:", error.response?.status, error.response?.data);
        if (error.response?.status === 401 || error.response?.status === 403) {
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);