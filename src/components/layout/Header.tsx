'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, NotificacionSistema } from '@/context/NotificationContext';
import {
  Bell,
  LogOut,
  CheckCheck,
  ArrowRight,
  Menu,
  ChevronDown,
  FlaskConical,
  Filter,
  Trash2,
  ShieldAlert,
  Users,
  Cpu,
  FileCheck,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import DetalleNotificacionModal from '@/components/ui/DetalleNotificacionModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, solicitarConfirmacionSalir } = useAuth();
  const {
    notificaciones,
    noLeidasCount,
    marcarComoLeida,
    marcarTodasComoLeidas,
    limpiarLeidas,
  } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'TODAS' | 'NO_LEIDAS' | 'SEGURIDAD' | 'AUDITORIA'>('TODAS');
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState<NotificacionSistema | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

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

  const notificacionesMostradas = notificaciones.filter((n) => {
    if (filtroTipo === 'NO_LEIDAS') return !n.leida;
    if (filtroTipo === 'SEGURIDAD') return n.tipo === 'SEGURIDAD';
    if (filtroTipo === 'AUDITORIA') return n.tipo === 'AUDITORIA';
    return true;
  });

  const handleAbrirDetalle = (item: NotificacionSistema) => {
    marcarComoLeida(item.id);
    setNotificacionSeleccionada(item);
    setShowNotifications(false);
  };

  const getIconoTipo = (tipo: NotificacionSistema['tipo']) => {
    switch (tipo) {
      case 'SEGURIDAD':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'PERSONAL':
        return <Users className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'SISTEMA':
        return <Cpu className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'AUDITORIA':
        return <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <>
      <header className="h-20 bg-white/60 backdrop-blur-2xl border-b border-white/50 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm select-none">
        {/* 1. SECCIÓN IZQUIERDA: Logo + Toggle Mobile */}
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 transition-all cursor-pointer shadow-sm border border-emerald-100"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5 text-emerald-600" />
            </button>
          )}

          <Link
            href="/dashboard/simulador"
            className="flex items-center gap-3 group transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-base shadow-lg shadow-emerald-500/30 group-hover:scale-105 group-hover:rotate-3 transition-transform relative">
              <FlaskConical className="w-5 h-5 text-white absolute z-10" />
              <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-lg text-slate-800 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                  Zone Control
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase block leading-none mt-0.5">
                Autenticación Biométrica
              </span>
            </div>
          </Link>
        </div>

        {/* 2. SECCIÓN DERECHA: Notificaciones + Avatar y Menú de Usuario */}
        <div className="flex items-center gap-4">
          {/* Campanita de Notificaciones Persistente */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-11 h-11 rounded-2xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 flex items-center justify-center transition-all relative cursor-pointer hover:scale-105 active:scale-95 border border-emerald-100 shadow-sm ${
                noLeidasCount > 0 ? 'ring-2 ring-rose-400/30 shadow-rose-100/50' : ''
              }`}
              title="Centro Interactivo de Alertas y Auditoría"
            >
              <Bell
                className={`w-5 h-5 transition-transform ${
                  noLeidasCount > 0 ? 'animate-[shake_1s_ease-in-out_infinite] text-rose-500' : ''
                }`}
              />
              {noLeidasCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-md shadow-rose-500/30 border-2 border-white">
                  {noLeidasCount}
                </span>
              )}
            </button>

            {/* Menú Flotante de Notificaciones Interactivo */}
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(16,185,129,0.25)] border border-white p-5 animate-fade-in-up z-50">
                {/* Cabecera del Panel */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-sm text-slate-800">Notificaciones</h4>
                      <span className="text-[10px] text-slate-500 font-bold tracking-wide">Registro de Eventos y Auditoría</span>
                    </div>
                  </div>
                  {noLeidasCount > 0 && (
                    <button
                      onClick={marcarTodasComoLeidas}
                      className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg hover:bg-emerald-100 font-bold flex items-center gap-1 cursor-pointer transition-colors border border-emerald-100"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Marcar todo
                    </button>
                  )}
                </div>

                {/* Filtros de Notificaciones */}
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 overflow-x-auto text-[10px] scrollbar-hide">
                  {(['TODAS', 'NO_LEIDAS', 'SEGURIDAD', 'AUDITORIA'] as const).map((filtro) => (
                    <button
                      key={filtro}
                      onClick={() => setFiltroTipo(filtro)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 border ${
                        filtroTipo === filtro
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {filtro === 'TODAS'
                        ? 'Todas'
                        : filtro === 'NO_LEIDAS'
                        ? `Nuevas (${noLeidasCount})`
                        : filtro === 'SEGURIDAD'
                        ? 'Seguridad'
                        : 'Auditoría'}
                    </button>
                  ))}
                </div>

                {/* Lista de Notificaciones */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mt-3 custom-scrollbar">
                  {notificacionesMostradas.length > 0 ? (
                    notificacionesMostradas.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleAbrirDetalle(item)}
                        className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer group hover:scale-[1.02] relative overflow-hidden ${
                          item.leida
                            ? 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-white'
                            : 'bg-white border-emerald-200 text-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300'
                        }`}
                      >
                        {/* Brillo lateral sutil en hover */}
                        <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 z-0"></div>

                        <div className="flex items-start justify-between gap-2 mb-1.5 relative z-10">
                          <div className="flex items-center gap-2">
                            {getIconoTipo(item.tipo)}
                            <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                              {item.titulo}
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded-md ${
                            item.leida ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-2 line-clamp-2 relative z-10 font-medium">
                          {item.mensaje}
                        </p>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] relative z-10">
                          <span className="text-slate-400 font-bold">Clic para expandir</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                            Detalles <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300">
                        <CheckCheck className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-500">Todo al día</p>
                      <p className="text-[10px] text-slate-400 mt-1">No hay notificaciones en esta vista.</p>
                    </div>
                  )}
                </div>

                {/* Pie del Panel */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{notificaciones.length} registros</span>
                  <button
                    onClick={limpiarLeidas}
                    className="text-slate-500 hover:text-rose-500 font-bold flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpiar historial
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Separador vertical */}
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Menú de Perfil de Usuario con Dropdown Integrado */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1 sm:pr-4 sm:py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer shadow-sm group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-inner relative overflow-hidden">
                <span className="relative z-10">{user?.nombres?.charAt(0) || 'U'}</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] leading-none group-hover:text-emerald-700 transition-colors">
                  {user?.nombres}
                </span>
                <span className="text-[9px] font-bold text-emerald-600 uppercase leading-none mt-1">
                  {user?.rol.replace('_', ' ')}
                </span>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </button>

            {/* Menú Desplegable de Usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(16,185,129,0.2)] border border-white p-3 animate-fade-in-down z-50">
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 mb-2">
                  <p className="text-sm font-black text-slate-800 truncate">
                    {user?.nombres} {user?.apellidos}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">{user?.correo}</p>
                  <span className="inline-block px-2.5 py-1 mt-2 text-[9px] font-black rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider shadow-sm">
                    {user?.rol.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      solicitarConfirmacionSalir();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer border border-transparent hover:border-rose-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión Segura</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Interactivo de Detalle de Auditoría */}
      <DetalleNotificacionModal
        notificacion={notificacionSeleccionada}
        onClose={() => setNotificacionSeleccionada(null)}
      />
    </>
  );
}
