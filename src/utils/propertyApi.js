import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

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
        const response = await api.get('/properties', { params });
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
        if (purpose && purpose !== 'all') {
            params.purpose = purpose.toLowerCase();
        }
        const response = await api.get('/properties', { params });
        return response.data;
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
        'sale': 'Buy'
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
