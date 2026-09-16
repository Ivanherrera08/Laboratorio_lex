'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  Bell,
  LogOut,
  CheckCheck,
  ArrowRight,
  Menu,
  ChevronDown,
  User,
  ShieldCheck,
  Layers,
  Radio,
  FlaskConical,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, solicitarConfirmacionSalir, hasRole } = useAuth();
  const { notificacionesFiltradas, noLeidasCount, marcarComoLeida, marcarTodasComoLeidas } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Pestañas dinámicas centrales con los colores oficiales de la plataforma
  const quickTabs = [
    { name: 'Simulador RFID', href: '/dashboard/simulador', icon: Radio, roles: ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'] },
    { name: 'Personal', href: '/dashboard/personal', icon: User, roles: ['ADMINISTRADOR', 'GESTOR_PERSONAL'] },
    { name: 'Catálogo', href: '/dashboard/catalogos', icon: Layers, roles: ['ADMINISTRADOR', 'GESTOR_PERSONAL'] },
    { name: 'Auditoría', href: '/dashboard/auditoria', icon: ShieldCheck, roles: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'] },
  ];

  // Cerrar paneles flotantes al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSeleccionarNotificacion = (id: string, url?: string) => {
    marcarComoLeida(id);
    setShowNotifications(false);
    if (url) {
      router.push(url);
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-brand-accent/40 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs select-none">
      {/* 1. SECCIÓN IZQUIERDA: Logo + Nombre Libre (Sin recuadros ni cajas encerradas) */}
      <div className="flex items-center gap-3.5">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-brand-secondary hover:bg-brand-accent/40 text-brand-dark transition-all cursor-pointer"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5 text-brand-primary" />
          </button>
        )}

        {/* Logo y Nombre Limpio y Elegante */}
        <Link
          href="/dashboard/simulador"
          className="flex items-center gap-2.5 group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white font-black text-base shadow-sm group-hover:scale-105 group-hover:rotate-3 transition-transform">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base text-brand-dark tracking-tight leading-tight group-hover:text-brand-primary transition-colors">
                Laboratorio Lex
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-brand-primary tracking-wider uppercase block leading-none">
              Zone Control • Farmacéutica
            </span>
          </div>
        </Link>
      </div>

      {/* 2. SECCIÓN CENTRAL: Pestañas de Navegación Rápida Tipo Facebook con Colores Verdes Institucionales */}
      <nav className="hidden md:flex items-center gap-1.5 bg-brand-secondary/70 p-1 rounded-2xl border border-brand-accent/40 shadow-2xs">
        {quickTabs.map((tab) => {
          const isAllowed = hasRole(tab.roles as any);
          if (!isAllowed) return null;

          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm scale-[1.02]'
                  : 'text-brand-text/75 hover:text-brand-dark hover:bg-white/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-primary'}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. SECCIÓN DERECHA: Notificaciones + Avatar y Menú de Usuario */}
      <div className="flex items-center gap-3">
        {/* Campanita de Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-brand-secondary hover:bg-brand-accent/30 text-brand-dark flex items-center justify-center transition-all relative cursor-pointer hover:scale-105 active:scale-95 border border-brand-accent/40"
            title="Centro de Alertas"
          >
            <Bell className="w-4 h-4 text-brand-primary" />
            {noLeidasCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-sm">
                {noLeidasCount}
              </span>
            )}
          </button>

          {/* Menú Flotante de Notificaciones */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-brand-accent/40 p-4 animate-slide-down z-50">
              <div className="flex items-center justify-between border-b border-brand-accent/20 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-primary" />
                  <h4 className="font-heading font-bold text-xs text-brand-dark">Alertas de Bioseguridad</h4>
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
                      className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer group ${
                        item.leida
                          ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                          : 'bg-brand-secondary/80 border-brand-primary/40 text-brand-dark shadow-2xs hover:bg-brand-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] text-brand-dark group-hover:text-brand-primary transition-colors">
                          {item.titulo}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-brand-text/80 leading-relaxed mb-2">
                        {item.mensaje}
                      </p>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-brand-accent/20 text-[10px]">
                        <span className="text-slate-400">Ir al módulo</span>
                        <span className="inline-flex items-center gap-1 font-bold text-brand-primary group-hover:translate-x-1 transition-transform">
                          Ver ahora <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No hay alertas pendientes.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separador vertical */}
        <div className="h-6 w-px bg-brand-accent/40 hidden sm:block" />

        {/* Menú de Perfil de Usuario con Dropdown Integrado */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-2xl bg-brand-secondary hover:bg-brand-accent/30 border border-brand-accent/40 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
              {user?.nombres?.charAt(0) || 'U'}
            </div>
            
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-brand-dark truncate max-w-[120px] leading-tight">
                {user?.nombres}
              </span>
              <span className="text-[9px] font-bold text-brand-primary uppercase leading-none">
                {user?.rol}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-brand-text/60 group-hover:text-brand-dark transition-colors" />
          </button>

          {/* Menú Desplegable de Usuario */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-brand-accent/40 p-3 animate-slide-down z-50 space-y-2">
              <div className="p-3 bg-brand-light rounded-2xl border border-brand-accent/30">
                <p className="text-xs font-bold text-brand-dark truncate">{user?.nombres} {user?.apellidos}</p>
                <p className="text-[10px] text-brand-text/70 truncate">{user?.correo}</p>
                <span className="inline-block px-2 py-0.5 mt-1.5 text-[9px] font-black rounded-full bg-brand-primary/15 text-brand-primary border border-brand-accent/40">
                  {user?.rol}
                </span>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    solicitarConfirmacionSalir();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
