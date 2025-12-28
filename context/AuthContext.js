import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api'; // Import the API service

const AuthContext = createContext({});

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Check for stored user data
      const storedUser = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);

      // Call the backend login API
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const userData = response.data.user;
        
        // Store user data and token
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('authToken', response.data.token);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        setLoading(false);
        return { success: true, role: userData.role, user: userData };
      } else {
        setLoading(false);
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        setLoading(false);
        return { 
          success: false, 
          error: error.response.data.message || 'Login failed. Please check your credentials.' 
        };
      } else if (error.request) {
        // Request was made but no response received
        setLoading(false);
        return { 
          success: false, 
          error: 'Network error. Please check your connection.' 
        };
      } else {
        // Something else happened
        setLoading(false);
        return { 
          success: false, 
          error: 'An error occurred during login.' 
        };
      }
    }
  };

  const logout = async () => {
    try {
      // Call backend logout API if available
      try {
        await api.post('/api/auth/logout');
      } catch (error) {
        console.log('Logout API call failed, continuing with local logout');
      }

      // Clear local storage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Update profile on backend
      const response = await api.put('/api/auth/profile', profileData);
      
      if (response.data.success) {
        const updatedUser = response.data.user;
        
        // Update local storage
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: response.data.message || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data.message || 'Failed to update profile' 
        };
      } else {
        return { 
          success: false, 
          error: 'Network error. Please try again.' 
        };
      }
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      const response = await api.post('/api/auth/register', userData);
      
      if (response.data.success) {
        // Store user data and token
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        await AsyncStorage.setItem('authToken', response.data.token);
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        setLoading(false);
        return { success: true, user: response.data.user };
      } else {
        setLoading(false);
        // Handle validation errors from backend
        if (response.data.errors) {
          let errorMessage = 'Validation errors occurred:\n';
          for (const [field, messages] of Object.entries(response.data.errors)) {
            errorMessage += `- ${field}: ${messages.join(', ')}\n`;
          }
          return { success: false, error: errorMessage };
        }
        return { success: false, error: response.data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        setLoading(false);
        return { 
          success: false, 
          error: error.response.data.message || 'Registration failed. Please check your details.' 
        };
      } else if (error.request) {
        setLoading(false);
        return { 
          success: false, 
          error: 'Network error. Please check your connection.' 
        };
      } else {
        setLoading(false);
        return { 
          success: false, 
          error: 'An error occurred during registration.' 
        };
      }
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        return { success: true, message: response.data.message || 'Password changed successfully' };
      } else {
        return { success: false, error: response.data.message || 'Failed to change password' };
      }
    } catch (error) {
      console.error('Change password error:', error);
      
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data.message || 'Failed to change password' 
        };
      } else {
        return { 
          success: false, 
          error: 'Network error. Please try again.' 
        };
      }
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        return { success: true, message: response.data.message || 'Password reset link sent to your email' };
      } else {
        return { success: false, error: response.data.message || 'Failed to send password reset email' };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data.message || 'Failed to send password reset email' 
        };
      } else {
        return { 
          success: false, 
          error: 'Network error. Please try again.' 
        };
      }
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    register,
    changePassword,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
