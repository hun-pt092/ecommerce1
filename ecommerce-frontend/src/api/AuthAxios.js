// src/api/authAxios.js
import axios from 'axios';

const authAxios = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default authAxios;
