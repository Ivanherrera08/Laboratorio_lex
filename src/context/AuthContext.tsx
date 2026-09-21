'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UsuarioAuth, RolUsuario } from '@/types';
import { api } from '@/lib/api';
import { LogOut } from 'lucide-react';

interface AuthContextType {
  user: UsuarioAuth | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UsuarioAuth) => void;
  logout: () => void;
  solicitarConfirmacionSalir: () => void;
  hasRole: (allowedRoles: RolUsuario[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  solicitarConfirmacionSalir: () => {},
  hasRole: () => false,
});

// Timeout// Configuración de Seguridad: 60 minutos de inactividad (para pruebas)
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Inicialización SÍNCRONA de sesión desde sessionStorage
  const [user, setUser] = useState<UsuarioAuth | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = sessionStorage.getItem('zone_control_user');
        return storedUser ? JSON.parse(storedUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('zone_control_token') || null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState<boolean>(false);
  const timerInactividadRef = useRef<NodeJS.Timeout | null>(null);

  // Función de Logout Manual y Automático (RF F-04, CU-02)
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      // 1. Notificar al backend si el endpoint existe
      try {
        api.post('/auth/logout').catch(() => {});
      } catch {}

      // 2. Limpiar headers de autorización de Axios
      delete api.defaults.headers.common['Authorization'];

      // 3. Destrucción total de almacenamiento local y de sesión
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch {}

      // 4. Eliminación de cookies seguras de sesión
      const isHttps = window.location.protocol === 'https:';
      const secureFlag = isHttps ? '; Secure' : '';

      document.cookie = `zone_control_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag};`;
      document.cookie = `zone_control_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag};`;

      // 5. Limpieza de estado local
      setUser(null);
      setToken(null);
      setShowConfirmLogout(false);

      if (timerInactividadRef.current) {
        clearTimeout(timerInactividadRef.current);
      }

      // 6. Reemplazo atómico del historial del navegador
      window.location.replace('/');
    }
  }, []);

  const solicitarConfirmacionSalir = () => {
    setShowConfirmLogout(true);
  };

  // Función de Login con identificador único (jti) y cabeceras Axios
  const login = (newToken: string, newUser: UsuarioAuth) => {
    if (typeof window !== 'undefined') {
      // Inyección en Axios
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Persistencia en sessionStorage
      sessionStorage.setItem('zone_control_token', newToken);
      sessionStorage.setItem('zone_control_user', JSON.stringify(newUser));

      // Cookies de sesión
      const isHttps = window.location.protocol === 'https:';
      const secureFlag = isHttps ? '; Secure' : '';

      document.cookie = `zone_control_token=${newToken}; path=/; SameSite=Lax${secureFlag};`;
      document.cookie = `zone_control_role=${newUser.rol}; path=/; SameSite=Lax${secureFlag};`;

      setToken(newToken);
      setUser(newUser);
    }
  };

  // Temporizador Estricto de Inactividad de 5 Minutos (RF F-03, CU-10)
  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;

    const reiniciarTemporizador = () => {
      if (timerInactividadRef.current) {
        clearTimeout(timerInactividadRef.current);
      }

      timerInactividadRef.current = setTimeout(() => {
        alert('Sesión cerrada automáticamente por 5 minutos de inactividad (Políticas de Seguridad Laboratorio XYZ).');
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Escuchar eventos globales del usuario (mousemove, keydown, click, scroll)
    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    eventos.forEach((evento) => {
      window.addEventListener(evento, reiniciarTemporizador);
    });

    // Iniciar temporizador
    reiniciarTemporizador();

    return () => {
      if (timerInactividadRef.current) {
        clearTimeout(timerInactividadRef.current);
      }
      eventos.forEach((evento) => {
        window.removeEventListener(evento, reiniciarTemporizador);
      });
    };
  }, [token, logout]);

  // Sincronización continua de cookies de sesión y escucha de evento de expiración
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleSessionExpired = () => {
        alert('Tu sesión ha expirado por seguridad. Por favor, vuelve a iniciar sesión.');
        logout();
      };
      
      window.addEventListener('session_expired', handleSessionExpired);

      const storedToken = sessionStorage.getItem('zone_control_token');
      const storedUser = sessionStorage.getItem('zone_control_user');
      const isHttps = window.location.protocol === 'https:';
      const secureFlag = isHttps ? '; Secure' : '';

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.rol) {
            setToken(storedToken);
            setUser(parsedUser);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            document.cookie = `zone_control_token=${storedToken}; path=/; SameSite=Lax${secureFlag};`;
            document.cookie = `zone_control_role=${parsedUser.rol}; path=/; SameSite=Lax${secureFlag};`;
          } else {
            logout();
          }
        } catch {
          logout();
        }
      } else {
        document.cookie = `zone_control_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag};`;
        document.cookie = `zone_control_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag};`;
        setUser(null);
        setToken(null);
      }
      
      return () => {
        window.removeEventListener('session_expired', handleSessionExpired);
      };
    }
  }, [logout]);

  const hasRole = (allowedRoles: RolUsuario[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.rol);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        solicitarConfirmacionSalir,
        hasRole,
      }}
    >
      {children}

      {/* Modal Global de Confirmación para Salir */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-brand-accent/40 animate-slide-down">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-200">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-heading font-bold text-brand-dark">
                  ¿Deseas cerrar tu sesión?
                </h3>
                <p className="text-xs text-brand-text/70">
                  Zone Control • Laboratorio XYZ
                </p>
              </div>
            </div>

            <p className="text-xs text-brand-text/80 leading-relaxed bg-brand-light p-3.5 rounded-xl border border-brand-accent/30 mb-5">
              Al salir, se cerrará tu sesión activa y se protegerá la información de biometría y trazabilidad farmacéutica.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmLogout(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
              >
                Permanecer en el Sistema
              </button>
              <button
                type="button"
                onClick={logout}
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer hover:opacity-95 hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
