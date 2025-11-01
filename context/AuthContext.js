import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
      // Check for both nurse and doctor users
      const nurseUserData = await AsyncStorage.getItem('nurseUser');
      const doctorUserData = await AsyncStorage.getItem('doctorUser');
      const userData = nurseUserData || doctorUserData;
      if (userData) {
        const parsedUser = JSON.parse(userData);
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
      // Doctor login: any email + password "doctor123"
      if (password === 'doctor123') {
        const userData = {
          email: email,
          name: 'Dr. Michael Green', // Default doctor name
          phone: '+1 (555) 987-6543',
          role: 'doctor',
          loginTime: new Date().toISOString(),
        };

        await AsyncStorage.setItem('doctorUser', JSON.stringify(userData));
        // Clear nurse user if exists
        await AsyncStorage.removeItem('nurseUser');
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, role: 'doctor' };
      }
      // Nurse login: any email + password "nurse123"
      else if (password === 'nurse123') {
        const userData = {
          email: email,
          name: 'Sarah Johnson', // Default nurse name
          phone: '+1 (555) 123-4567',
          role: 'nurse',
          loginTime: new Date().toISOString(),
        };

        await AsyncStorage.setItem('nurseUser', JSON.stringify(userData));
        // Clear doctor user if exists
        await AsyncStorage.removeItem('doctorUser');
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, role: 'nurse' };
      } else {
        return { success: false, error: 'Invalid credentials. Please use password: nurse123 or doctor123' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('nurseUser');
      await AsyncStorage.removeItem('doctorUser');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = {
        ...user,
        ...profileData,
      };
      // Save to appropriate storage based on role
      const storageKey = user?.role === 'doctor' ? 'doctorUser' : 'nurseUser';
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

