import api from './api';

export const adminApi = {
    // Dashboard
    getDashboardStats: async (period = '30d') => {
        return api.get(`/analytics/dashboard?period=${period}`);
    },

    getTrafficData: async (period = '7d') => {
        return api.get(`/analytics/traffic?period=${period}`);
    },

    getTopProperties: async () => {
        return api.get(`/analytics/top-properties`);
    },

    getViewsByCategory: async () => {
        return api.get('/analytics/views-by-category');
    },

    getRecentActivity: async () => {
        return api.get('/analytics/recent-activity');
    },

    // Properties
    getProperties: async (params = {}) => {
        // params: page, page_size, status, search, etc.
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/properties?${queryString}`);
    },

    getProperty: async (slug) => {
        return api.get(`/properties/${slug}`);
    },

    getPropertyById: async (id) => {
        return api.get(`/properties/id/${id}`);
    },

    createProperty: async (data) => {
        return api.post('/properties', data);
    },

    updateProperty: async (id, data) => {
        return api.put(`/properties/${id}`, data);
    },

    deleteProperty: async (id) => {
        return api.delete(`/properties/${id}`);
    },

    // Users
    getUsers: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/users?${queryString}`);
    },

    updateUserRole: async (userId, role) => {
        return api.patch(`/admin/users/${userId}/role?role=${role}`);
    },

    // System
    getSystemHealth: async () => {
        return api.get('/admin/system/health');
    }
};

export default adminApi;
