'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Bell, LogOut, CheckCheck, ExternalLink, ShieldAlert, ArrowRight, Menu, Sparkles, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { user, solicitarConfirmacionSalir } = useAuth();
  const { notificacionesFiltradas, noLeidasCount, marcarComoLeida, marcarTodasComoLeidas } = useNotifications();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar panel al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSeleccionarNotificacion = (id: string, url?: string) => {
    marcarComoLeida(id);
    setShowMenu(false);
    if (url) {
      router.push(url);
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-brand-accent/30 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-all shadow-xs">
      {/* Identidad Oficial: Laboratorio Lex + Botón Móvil */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-brand-secondary hover:bg-brand-accent/40 text-brand-dark transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
            title="Abrir menú lateral"
          >
            <Menu className="w-5 h-5 text-brand-primary" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-brand-secondary via-emerald-50/60 to-white px-3.5 py-1.5 rounded-2xl border border-brand-accent/50 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-primary to-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
              L
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-sm text-brand-dark tracking-tight leading-none">
                  Laboratorio Lex
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[9.5px] font-bold text-brand-primary uppercase tracking-wider block leading-tight">
                Zone Control • Farmacéutica
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-status-authorized"></span>
            <span>Sistema Central Bioseguro</span>
          </div>
        </div>
      </div>

      {/* Controles: Notificaciones + Usuario + Botón Salir */}
      <div className="flex items-center gap-4">
        {/* Campanita de Notificaciones */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2.5 rounded-xl bg-brand-secondary hover:bg-brand-accent/30 text-brand-dark transition-all relative cursor-pointer hover:scale-105 active:scale-95"
            title="Centro de Notificaciones"
          >
            <Bell className="w-4 h-4 text-brand-primary" />
            {noLeidasCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-sm">
                {noLeidasCount}
              </span>
            )}
          </button>

          {/* Menú Desplegable de Notificaciones */}
          {showMenu && (
            <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-white rounded-3xl shadow-2xl border border-brand-accent/40 p-4 animate-slide-down z-50">
              <div className="flex items-center justify-between border-b border-brand-accent/20 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-primary" />
                  <h4 className="font-heading font-bold text-xs text-brand-dark">Notificaciones de Tu Rol</h4>
                </div>
                {noLeidasCount > 0 && (
                  <button
                    onClick={marcarTodasComoLeidas}
                    className="text-[11px] text-brand-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Leídas
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notificacionesFiltradas.length > 0 ? (
                  notificacionesFiltradas.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSeleccionarNotificacion(item.id, item.accionUrl)}
                      className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer group hover:scale-[1.01] ${
                        item.leida
                          ? 'bg-gray-50/70 border-gray-200 opacity-75 hover:bg-brand-light/60 hover:opacity-100'
                          : 'bg-brand-secondary/80 border-brand-primary/50 shadow-xs hover:bg-brand-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-brand-dark text-[11px] group-hover:text-brand-primary transition-colors">
                          {item.titulo}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-brand-text/80 leading-relaxed mb-2.5">
                        {item.mensaje}
                      </p>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-brand-accent/20 text-[10px]">
                        <span className="text-gray-400">Clic para ir al módulo</span>
                        <span className="inline-flex items-center gap-1 font-bold text-brand-primary group-hover:translate-x-1 transition-transform">
                          Ver ahora <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-gray-400">
                    No tienes nuevas alertas en este momento.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-brand-accent/40"></div>

        {/* Info Usuario */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-bold text-brand-dark truncate max-w-[140px]">
            {user?.nombres} {user?.apellidos}
          </span>
          <span className="text-[10px] text-brand-primary font-semibold uppercase tracking-wider">
            {user?.rol}
          </span>
        </div>

        {/* Botón Salir con Confirmación Modal */}
        <button
          onClick={solicitarConfirmacionSalir}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs border border-red-200 transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
          title="Cerrar sesión actual"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
}
