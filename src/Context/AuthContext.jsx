import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, API_ENDPOINTS } from '@/Utils/ApiConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();

        // Escuchar sesión expirada
        const handleUnauthorized = () => {
            handleLogout();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await apiClient.get(API_ENDPOINTS.CHECK_AUTH);
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.LOGIN, { username, password });
            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiClient.post(API_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            handleLogout();
        }
    };

    const handleLogout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}