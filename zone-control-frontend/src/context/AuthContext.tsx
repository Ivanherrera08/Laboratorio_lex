'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UsuarioAuth, RolUsuario } from '@/types';
import { LogOut, AlertTriangle, ShieldCheck } from 'lucide-react';

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

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutos de inactividad (RF F-03, CU-10)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioAuth | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showConfirmLogout, setShowConfirmLogout] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zone_control_token');
      localStorage.removeItem('zone_control_user');
      // Borrar cookies de seguridad de ruta
      document.cookie = 'zone_control_token=; path=/; max-age=0; SameSite=Strict;';
      document.cookie = 'zone_control_role=; path=/; max-age=0; SameSite=Strict;';
      setUser(null);
      setToken(null);
      setShowConfirmLogout(false);
      window.location.href = '/';
    }
  }, []);

  const solicitarConfirmacionSalir = () => {
    setShowConfirmLogout(true);
  };

  // Carga inicial de sesión desde localStorage y cookies con verificación
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('zone_control_token');
      const storedUser = localStorage.getItem('zone_control_user');
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.rol) {
            setToken(storedToken);
            setUser(parsedUser);
            // Asegurar sincronización de cookie de seguridad
            document.cookie = `zone_control_token=${storedToken}; path=/; max-age=28800; SameSite=Strict;`;
            document.cookie = `zone_control_role=${parsedUser.rol}; path=/; max-age=28800; SameSite=Strict;`;
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    }
  }, [logout]);

  // Listener para resetear timer de inactividad
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUserActivity = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, []);

  // Intervalo de control de inactividad de 5 minutos
  useEffect(() => {
    if (!token || typeof window === 'undefined') return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_LIMIT_MS) {
        alert('Su sesión ha caducado por 5 minutos de inactividad (Políticas de Seguridad Zone Control).');
        logout();
      }
    }, 10000); // Check cada 10s

    return () => clearInterval(interval);
  }, [lastActivity, token, logout]);

  const login = (newToken: string, newUser: UsuarioAuth) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zone_control_token', newToken);
      localStorage.setItem('zone_control_user', JSON.stringify(newUser));
      // Sincronizar cookies seguras con expiración (8 horas / 28800 segundos) y SameSite=Strict
      document.cookie = `zone_control_token=${newToken}; path=/; max-age=28800; SameSite=Strict;`;
      document.cookie = `zone_control_role=${newUser.rol}; path=/; max-age=28800; SameSite=Strict;`;
      setToken(newToken);
      setUser(newUser);
      setLastActivity(Date.now());
    }
  };

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

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmLogout(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-text hover:bg-gray-100 transition-all cursor-pointer"
              >
                Permanecer en el Sistema
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Sí, Cerrar Sesión
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
