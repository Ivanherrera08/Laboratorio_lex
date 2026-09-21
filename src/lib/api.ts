import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/recuperar-password') ||
        error.config?.url?.includes('/auth/reset-password');

      if (error.response?.status === 401 && !isAuthEndpoint) {
        console.warn("401 Unauthorized detectado, despachando evento de sesión expirada:", error.config?.url);
        // Despachar un evento personalizado para que AuthContext lo maneje suavemente
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('session_expired'));
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extrae un mensaje amigable y descriptivo de cualquier error de Axios / Backend.
 */
export function extraerMensajeError(error: unknown, defaultMsg = 'Ocurrió un error inesperado al procesar la solicitud.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    if (data) {
      if (data.errors && typeof data.errors === 'object') {
        const firstErrorKey = Object.keys(data.errors)[0];
        return data.errors[firstErrorKey] || data.message || defaultMsg;
      }
      if (data.message) {
        return data.message;
      }
    }
    if (error.response?.status === 409) {
      return 'Ya existe un registro con estos datos únicos (cédula, correo o código).';
    }
    if (error.response?.status === 403) {
      return 'No cuenta con permisos suficientes para realizar esta acción.';
    }
    if (error.message === 'Network Error') {
      return 'No fue posible conectar con el servidor backend (revisa tu conexión o el puerto 8080).';
    }
  }
  return (error as Error)?.message || defaultMsg;
}
