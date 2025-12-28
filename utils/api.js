import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual ASP.NET backend URL
const API_BASE_URL = 'http://192.168.68.108:5056'; // Your ASP.NET backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token might be expired, clear it and redirect to login
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('user');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

export default api;