import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        console.log('Checking auth, token exists:', !!token); // DEBUG
        
        if (token) {
            try {
                const response = await api.get('/auth/me/', {
                    headers: {
                        Authorization: `Bearer ${token}` // Explicitly add token
                    }
                });
                console.log('User data:', response.data); // DEBUG
                setUser(response.data);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (username, password) => {
        try {
            console.log('Attempting login...'); // DEBUG
            const response = await api.post('/auth/login/', { username, password });
            console.log('Login response:', response.data); // DEBUG
            
            const { access, refresh } = response.data;
            
            if (!access || !refresh) {
                throw new Error('Invalid token response');
            }
            
            // Save tokens FIRST
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            console.log('Tokens saved successfully'); // DEBUG
            
            // IMPORTANT: Create a new axios instance with the token for this request
            // OR explicitly pass the token in headers
            try {
                const userResponse = await api.get('/auth/me/', {
                    headers: {
                        Authorization: `Bearer ${access}` // Explicitly use the new token
                    }
                });
                console.log('User details:', userResponse.data); // DEBUG
                setUser(userResponse.data);
                
                return { success: true };
            } catch (userError) {
                console.error('Failed to get user details:', userError);
                // Login succeeded but couldn't get user details
                // Still return success since tokens are valid
                return { 
                    success: true,
                    warning: 'Login successful but could not load user details. Please refresh.'
                };
            }
            
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message); // DEBUG
            return { 
                success: false, 
                error: error.response?.data?.detail || error.message || 'Login failed' 
            };
        }
    };

    const register = async (userData, userType) => {
        try {
            const endpoint = userType === 'citizen' 
                ? '/auth/register/citizen/' 
                : '/auth/register/lawyer/';
            
            console.log('Registering:', endpoint); // DEBUG
            
            // Check if userData is FormData (for file upload)
            const isFormData = userData instanceof FormData;
            
            const config = isFormData ? {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            } : {};
            
            const response = await api.post(endpoint, userData, config);
            console.log('Registration response:', response.data); // DEBUG
            
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Registration error:', error.response?.data); // DEBUG
            return { 
                success: false, 
                error: error.response?.data || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        console.log('Logging out...'); // DEBUG
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
        isAuthenticated: !!user,
        isCitizen: user?.user_type === 'citizen',
        isLawyer: user?.user_type === 'lawyer',
        isAdmin: user?.user_type === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};