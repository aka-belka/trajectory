// frontend/src/api/api.js - ЕДИНСТВЕННАЯ ПРАВИЛЬНАЯ ВЕРСИЯ

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// ✅ Добавляем токен в заголовки
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return Promise.reject(error);
    }
    
    // ✅ Если 401 и это не повторный запрос
    if ((error.response?.status === 401 || error.response?.status === 403)&& !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // ✅ Пытаемся обновить токен
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true
        });
        const newToken = response.data.accessToken;

        localStorage.setItem('accessToken', newToken);
        
        // ✅ Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {;
        // ✅ Если обновить не удалось — разлогиниваем
        localStorage.removeItem('accessToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;