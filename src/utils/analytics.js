import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your token
mixpanel.init('8b65bc55f20a1c344eed14d8d997bbad', {
    autocapture: true,
    record_sessions_percent: 100,
    api_host: 'https://api-eu.mixpanel.com',
});

// Analytics utility functions
export const analytics = {
    // Track page views
    trackPageView: (pageName) => {
        mixpanel.track('Page View', {
            page: pageName,
            timestamp: new Date().toISOString(),
        });
    },

    // Track property views
    trackPropertyView: (property) => {
        mixpanel.track('Property View', {
            property_id: property.slug,
            property_type: property.type,
            location: `${property.location.city}, ${property.location.country}`,
            price: property.price,
            currency: property.currency,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
        });
    },

    // Track search actions
    trackSearch: (searchParams) => {
        mixpanel.track('Search Performed', {
            search_type: searchParams.type, // 'buy' or 'rent'
            location: searchParams.location,
            property_type: searchParams.propertyType,
            price_range: searchParams.priceRange,
        });
    },

    // Track contact form submissions
    trackContactForm: (formType, propertyId = null) => {
        mixpanel.track('Contact Form Submit', {
            form_type: formType,
            property_id: propertyId,
            timestamp: new Date().toISOString(),
        });
    },

    // Track property card interactions
    trackPropertyCardAction: (action, propertyId) => {
        mixpanel.track('Property Card Action', {
            action: action, // 'details', 'compare', 'favorite'
            property_id: propertyId,
        });
    },

    // Track category selection
    trackCategorySelect: (category) => {
        mixpanel.track('Category Selected', {
            category: category,
        });
    },

    // Track navigation
    trackNavigation: (destination) => {
        mixpanel.track('Navigation Click', {
            destination: destination,
        });
    },

    // Track user actions
    trackAction: (actionName, properties = {}) => {
        mixpanel.track(actionName, properties);
    },

    // Identify user (call this when user logs in or signs up)
    identifyUser: (userId, userProperties = {}) => {
        mixpanel.identify(userId);
        mixpanel.people.set(userProperties);
    },

    // Set user properties
    setUserProperties: (properties) => {
        mixpanel.people.set(properties);
    },

    // Track user signup
    trackSignup: (method) => {
        mixpanel.track('User Signup', {
            method: method, // 'email', 'google', 'facebook', etc.
        });
    },

    // Track user login
    trackLogin: (method) => {
        mixpanel.track('User Login', {
            method: method,
        });
    },

    // Reset user (call on logout)
    reset: () => {
        mixpanel.reset();
    },
};

export default analytics;
