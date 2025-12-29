import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.detail || error.message;

        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            // We'll handle this in the AuthContext usually, or emit an event
        }

        return Promise.reject({ ...error, message });
    }
);

export const saveProperty = async (propertyId) => {
    return api.post(`/users/me/saved/${propertyId}`);
};

export const unsaveProperty = async (propertyId) => {
    return api.delete(`/users/me/saved/${propertyId}`);
};

export const getSavedProperties = async () => {
    return api.get('/users/me/saved');
};

export const getUserStats = async () => {
    return api.get('/users/me/stats');
};

export const trackUserView = async (propertyId) => {
    return api.post(`/users/me/viewed/${propertyId}`);
};

export const createInquiry = async (inquiryData) => {
    return api.post('/inquiries', inquiryData);
};

export default api;
