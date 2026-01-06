import axios from 'axios';

const API_BASE_URL = 'http://143.198.30.249:8001/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
});

// Property API functions
export const propertyApi = {
    // Get all properties with filters
    getProperties: async (params = {}) => {
        const fetchParams = { ...params };
        if (fetchParams.purpose && fetchParams.purpose.toLowerCase() === 'buy') {
            fetchParams.purpose = 'sale';
        }
        const response = await api.get('/properties', { params: fetchParams });
        return response.data;
    },

    // Get property by slug
    getPropertyBySlug: async (slug) => {
        const response = await api.get(`/properties/${slug}`);
        return response.data;
    },

    // Get property by ID
    getPropertyById: async (id) => {
        const response = await api.get(`/properties/id/${id}`);
        return response.data;
    },

    // Filter properties by purpose
    getPropertiesByPurpose: async (purpose, page = 1, pageSize = 20) => {
        const params = { page, page_size: pageSize };
        let normalizedPurpose = purpose;

        if (purpose && purpose !== 'all') {
            normalizedPurpose = purpose.toLowerCase();
            if (normalizedPurpose === 'buy') normalizedPurpose = 'sale';
            params.purpose = normalizedPurpose;
        }

        try {
            const response = await api.get('/properties', { params });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch properties by purpose:", error);
            throw error;
        }
    },

    // Filter properties by type
    getPropertiesByType: async (type, page = 1, pageSize = 20) => {
        const params = { page, page_size: pageSize };
        if (type && type !== 'all') {
            params.type = type.toLowerCase();
        }
        const response = await api.get('/properties', { params });
        return response.data;
    },

    // Search properties
    searchProperties: async (searchTerm, page = 1, pageSize = 20) => {
        const response = await api.get('/properties', {
            params: {
                search: searchTerm,
                page,
                page_size: pageSize
            }
        });
        return response.data;
    },

    // Create a new booking
    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    // Get availability dates for a property
    getAvailability: async (propertyId) => {
        const response = await api.get(`/bookings/property/${propertyId}/availability`);
        return response.data;
    },

    // Get my bookings
    getMyBookings: async () => {
        const response = await api.get('/bookings/me');
        return response.data;
    },

    // --- Agent Actions ---

    // Get Agent's Properties
    getAgentProperties: async (page = 1, pageSize = 20) => {
        // Assuming backend supports this or filtering by current user
        const response = await api.get('/agent/properties', {
            params: { page, page_size: pageSize }
        });
        return response.data;
    },

    // Create New Property
    createProperty: async (propertyData) => {
        const response = await api.post('/agent/properties', propertyData);
        return response.data;
    },

    // Update Property
    updateProperty: async (id, propertyData) => {
        const response = await api.patch(`/agent/properties/${id}`, propertyData);
        return response.data;
    },

    // Upload Property Image
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/agent/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

// Helper function to format price (kept for compatibility)
export const formatPrice = (price, currency = 'KSh', priceUnit = '') => {
    const formatted = parseFloat(price).toLocaleString();
    return `${currency}${formatted}${priceUnit ? ` ${priceUnit}` : ''}`;
};

// Helper function to map backend property type to frontend format
export const mapPropertyType = (type) => {
    const typeMap = {
        'apartment': 'Apartment',
        'house': 'House',
        'villa': 'Villa',
        'commercial': 'Office',
        'land': 'Land'
    };
    return typeMap[type] || type;
};

// Helper function to map backend purpose to frontend format
export const mapPropertyPurpose = (purpose) => {
    const purposeMap = {
        'rent': 'Rent',
        'sale': 'Buy',
        'stay': 'Stay'
    };
    return purposeMap[purpose] || purpose;
};

// Helper to transform backend property to frontend format
export const transformProperty = (property) => {
    return {
        id: property.id,
        slug: property.slug,
        title: property.title,
        description: property.description,
        type: mapPropertyType(property.type),
        purpose: mapPropertyPurpose(property.purpose),
        price: property.price,
        currency: 'KSh',
        priceUnit: '',
        location: {
            city: property.location.split(',')[1]?.trim() || 'Nairobi',
            area: property.location.split(',')[0]?.trim() || property.location,
            country: 'Kenya'
        },
        coordinates: {
            lat: property.latitude || 0,
            lng: property.longitude || 0
        },
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        size: property.area_sqft ? `${property.area_sqft.toLocaleString()} sq ft` : 'N/A',
        features: Object.entries(property.features || {})
            .filter(([_, value]) => value === true)
            .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)),
        images: property.images || [],
        agent: {
            name: 'Guri24 Team',
            phone: '+254 706 070 747',
            email: 'support@guri24.com'
        },
        views: property.views || 0,
        status: property.status,
        created_at: property.created_at,
        published_at: property.published_at
    };
};

export default api;
