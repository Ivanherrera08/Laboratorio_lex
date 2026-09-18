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
        return <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case 'PERSONAL':
        return <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'SISTEMA':
        return <Cpu className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'AUDITORIA':
        return <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-brand-accent/40 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs select-none">
        {/* 1. SECCIÓN IZQUIERDA: Logo + Toggle Mobile */}
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

        {/* 2. SECCIÓN DERECHA: Notificaciones + Avatar y Menú de Usuario */}
        <div className="flex items-center gap-3">
          {/* Campanita de Notificaciones Persistente */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-full bg-brand-secondary hover:bg-brand-accent/30 text-brand-dark flex items-center justify-center transition-all relative cursor-pointer hover:scale-105 active:scale-95 border border-brand-accent/40"
              title="Centro Interactivo de Alertas y Auditoría"
            >
              <Bell className="w-4 h-4 text-brand-primary" />
              {noLeidasCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-sm">
                  {noLeidasCount}
                </span>
              )}
            </button>

            {/* Menú Flotante de Notificaciones Interactivo */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-brand-accent/40 p-4 animate-slide-down z-50">
                {/* Cabecera del Panel */}
                <div className="flex items-center justify-between border-b border-brand-accent/20 pb-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-primary" />
                    <div>
                      <h4 className="font-heading font-bold text-xs text-brand-dark">Centro de Notificaciones</h4>
                      <span className="text-[9px] text-slate-400 font-medium">Persistencia local y auditoría</span>
                    </div>
                  </div>
                  {noLeidasCount > 0 && (
                    <button
                      onClick={marcarTodasComoLeidas}
                      className="text-[11px] text-brand-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Marcar leídas
                    </button>
                  )}
                </div>

                {/* Filtros de Notificaciones */}
                <div className="flex items-center gap-1 pb-2 border-b border-slate-100 overflow-x-auto text-[10px]">
                  {(['TODAS', 'NO_LEIDAS', 'SEGURIDAD', 'AUDITORIA'] as const).map((filtro) => (
                    <button
                      key={filtro}
                      onClick={() => setFiltroTipo(filtro)}
                      className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                        filtroTipo === filtro
                          ? 'bg-brand-primary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filtro === 'TODAS'
                        ? 'Todas'
                        : filtro === 'NO_LEIDAS'
                        ? `Sin leer (${noLeidasCount})`
                        : filtro === 'SEGURIDAD'
                        ? 'Seguridad'
                        : 'Auditoría'}
                    </button>
                  ))}
                </div>

                {/* Lista de Notificaciones */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 mt-2.5">
                  {notificacionesMostradas.length > 0 ? (
                    notificacionesMostradas.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleAbrirDetalle(item)}
                        className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer group hover:scale-[1.01] ${
                          item.leida
                            ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                            : 'bg-brand-secondary/80 border-brand-primary/40 text-brand-dark shadow-xs hover:bg-brand-secondary'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <div className="flex items-center gap-1.5">
                            {getIconoTipo(item.tipo)}
                            <span className="font-bold text-[11px] text-brand-dark group-hover:text-brand-primary transition-colors line-clamp-1">
                              {item.titulo}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-text/80 leading-relaxed mb-2 line-clamp-2">
                          {item.mensaje}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-brand-accent/20 text-[10px]">
                          <span className="text-slate-400 font-medium">Clic para ver bitácora completa</span>
                          <span className="inline-flex items-center gap-1 font-bold text-brand-primary group-hover:translate-x-0.5 transition-transform">
                            Detalles <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No hay notificaciones en esta categoría.
                    </div>
                  )}
                </div>

                {/* Pie del Panel */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400">{notificaciones.length} eventos guardados</span>
                  <button
                    onClick={limpiarLeidas}
                    className="text-slate-500 hover:text-red-500 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Limpiar leídas
                  </button>
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
                  <p className="text-xs font-bold text-brand-dark truncate">
                    {user?.nombres} {user?.apellidos}
                  </p>
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

      {/* Modal Interactivo de Detalle de Auditoría */}
      <DetalleNotificacionModal
        notificacion={notificacionSeleccionada}
        onClose={() => setNotificacionSeleccionada(null)}
      />
    </>
  );
}
