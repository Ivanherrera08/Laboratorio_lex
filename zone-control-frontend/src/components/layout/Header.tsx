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
  Search,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  User,
  ShieldCheck,
  Globe,
  Radio,
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
  const [busquedaRapida, setBusquedaRapida] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Módulos rápidos centrales estilo Facebook / Navigation Tabs
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
    <header className="h-16 bg-[#111827] text-white border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-lg select-none">
      {/* 1. SECCIÓN IZQUIERDA: Logo estilizado Facebook-Style + Buscador */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5 text-emerald-400" />
          </button>
        )}

        {/* Logo / Badge Oficial Laboratorio Lex estilo SaaS Moderno */}
        <Link
          href="/dashboard/simulador"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-emerald-500/30 hover:border-emerald-400 shadow-md group transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            L
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-sm text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                Laboratorio Lex
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            </div>
            <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase leading-none">
              Zone Control
            </span>
          </div>
        </Link>
      </div>

      {/* 2. SECCIÓN CENTRAL: Pestañas de Navegación Rápida Tipo Facebook */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
        {quickTabs.map((tab) => {
          const isAllowed = hasRole(tab.roles as any);
          if (!isAllowed) return null;

          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. SECCIÓN DERECHA: Centro de Notificaciones + Perfil de Usuario con Dropdown */}
      <div className="flex items-center gap-3">
        {/* Campanita de Notificaciones estilo Red Social */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-all relative cursor-pointer hover:scale-105 active:scale-95 border border-slate-700"
            title="Centro de Alertas"
          >
            <Bell className="w-4 h-4 text-emerald-400" />
            {noLeidasCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
                {noLeidasCount}
              </span>
            )}
          </button>

          {/* Menú Flotante de Notificaciones */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 p-4 animate-slide-down z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-heading font-bold text-xs text-white">Alertas de Bioseguridad</h4>
                </div>
                {noLeidasCount > 0 && (
                  <button
                    onClick={marcarTodasComoLeidas}
                    className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
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
                          ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                          : 'bg-slate-800/90 border-emerald-500/40 text-white shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] text-emerald-300">
                          {item.titulo}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                        {item.mensaje}
                      </p>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[10px]">
                        <span className="text-slate-400">Ir al módulo</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                          Ver <ArrowRight className="w-3 h-3" />
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
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* Menú de Perfil de Usuario con Dropdown tipo Facebook */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-extrabold text-xs shadow-xs">
              {user?.nombres?.charAt(0) || 'U'}
            </div>
            
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-white truncate max-w-[120px] leading-tight">
                {user?.nombres}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase leading-none">
                {user?.rol}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* Menú Desplegable de Usuario */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 p-3 animate-slide-down z-50 space-y-2">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <p className="text-xs font-bold text-white truncate">{user?.nombres} {user?.apellidos}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.correo}</p>
                <span className="inline-block px-2 py-0.5 mt-1.5 text-[9px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {user?.rol}
                </span>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    solicitarConfirmacionSalir();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
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
