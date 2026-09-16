import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de Request: inyección automática del token Bearer JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('zone_control_token') || localStorage.getItem('zone_control_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: Manejo centralizado de 401, 403 y expiración de sesión
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        sessionStorage.removeItem('zone_control_token');
        sessionStorage.removeItem('zone_control_user');
        localStorage.removeItem('zone_control_token');
        localStorage.removeItem('zone_control_user');
        document.cookie = 'zone_control_token=; path=/; max-age=0; SameSite=Strict;';
        document.cookie = 'zone_control_role=; path=/; max-age=0; SameSite=Strict;';
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
