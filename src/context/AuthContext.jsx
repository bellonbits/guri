import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import api from '../utils/api';
import analytics from '../utils/analytics';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing auth on mount and setup interceptors
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/users/me');
                setUser(response);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Setup axios interceptor for 401s
        const interceptorId = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    setUser(null);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptorId);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const formData = { email, password };
            const response = await api.post('/auth/login', formData);

            // Backend sets HttpOnly cookies. We get user data in response.
            // response matches UserResponse schema
            setUser(response);

            // Track login
            analytics.trackLogin('email');
            if (response.id) {
                analytics.identifyUser(response.id, {
                    email: response.email,
                    name: response.name,
                    role: response.role
                });
            }

            return { success: true, user: response };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', userData);

            // Backend sends simple message, email verification required
            // We don't log them in automatically usually, or we do?
            // "Registration successful. Please check your email..."

            // Track signup
            analytics.trackSignup('email');

            return { success: true, message: "Please check your email to verify your account." };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            analytics.trackAction('logout');
            analytics.reset();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API fails, clear local state
            setUser(null);
            return { success: false };
        }
    };

    const verifyEmail = async (token) => {
        try {
            await api.post('/auth/verify-email', { token });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Verification failed' };
        }
    };

    const resendVerification = async (email) => {
        try {
            await api.post('/auth/resend-verification', { email });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to resend verification' };
        }
    };

    const forgotPassword = async (email) => {
        try {
            await api.post('/auth/forgot-password', { email });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Request failed' };
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            await api.post('/auth/reset-password', { token, new_password: newPassword });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Reset failed' };
        }
    };

    const updateProfile = async (userData) => {
        try {
            const response = await api.put('/users/me', userData);
            setUser(response);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Update failed' };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
