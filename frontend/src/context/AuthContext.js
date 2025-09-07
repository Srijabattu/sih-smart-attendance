// src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, isLoading: true };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                user: null,
                token: null,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
            };
        case 'LOAD_USER':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            dispatch({
                type: 'LOAD_USER',
                payload: {
                    token,
                    user: JSON.parse(user),
                },
            });
        } else {
            dispatch({ type: 'LOGIN_FAILURE' });
        }
    }, []);

    const login = async (credentials) => {
        try {
            dispatch({ type: 'LOGIN_START' });
            const response = await authAPI.login(credentials);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { token, user },
            });

            return { success: true };
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE' });
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const register = async (userData) => {
        try {
            dispatch({ type: 'LOGIN_START' });
            const response = await authAPI.register(userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { token, user },
            });

            return { success: true };
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE' });
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
