import axios from 'axios';

// Create an instance pointing to your backend
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Automatically attach the JWT token to every request if it exists in LocalStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;