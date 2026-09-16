'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Users,
  UserCog,
  Building2,
  ScanLine,
  FileSpreadsheet,
  Globe2,
  FileText,
  LogOut,
  UserCheck,
  ChevronLeft,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, solicitarConfirmacionSalir, hasRole } = useAuth();

  const navigation = [
    {
      name: 'Simulador de Acceso',
      href: '/dashboard/simulador',
      icon: ScanLine,
      roles: ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'],
    },
    {
      name: 'Gestión de Personal',
      href: '/dashboard/personal',
      icon: Users,
      roles: ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
    },
    {
      name: 'Usuarios y Credenciales',
      href: '/dashboard/usuarios',
      icon: UserCog,
      roles: ['ADMINISTRADOR'],
    },
    {
      name: 'Carga Masiva',
      href: '/dashboard/carga-masiva',
      icon: FileSpreadsheet,
      roles: ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
    },
    {
      name: 'Catálogos y Zonas',
      href: '/dashboard/catalogos',
      icon: Building2,
      roles: ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
    },
    {
      name: 'Historial de Accesos',
      href: '/dashboard/historial',
      icon: FileText,
      roles: ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'],
    },
    {
      name: 'Socio Internacional',
      href: '/dashboard/socio-sync',
      icon: Globe2,
      roles: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
    },
    {
      name: 'Bitácora Auditoría',
      href: '/dashboard/auditoria',
      icon: ShieldCheck,
      roles: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
    },
  ];

  return (
    <>
      {/* Backdrop para móviles o cuando se abre en pantalla pequeña */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in transition-opacity"
        />
      )}

      {/* Barra Lateral / Sidebar con Transiciones y Animación Fluida */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-brand-secondary border-r border-brand-accent/30
          flex flex-col justify-between min-h-screen
          transition-all duration-300 ease-in-out shadow-lg lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        <div>
          {/* Header del Sidebar con Logo y Botón de Colapso */}
          <div className="p-4 border-b border-brand-accent/30 flex items-center justify-between">
            <Link
              href="/dashboard/simulador"
              className={`flex items-center gap-2.5 overflow-hidden transition-all ${
                isCollapsed ? 'lg:justify-center lg:w-full' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 hover:scale-105 transition-transform">
                Z
              </div>
              {!isCollapsed && (
                <div className="animate-fade-in truncate">
                  <span className="font-heading font-extrabold text-base text-brand-dark tracking-tight block leading-tight">
                    Zone Control
                  </span>
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">
                    Laboratorio XYZ
                  </span>
                </div>
              )}
            </Link>

            {/* Botón de cerrar en móvil */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-brand-accent/30 lg:hidden cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Botón para colapsar en Desktop */}
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex p-1.5 rounded-xl hover:bg-brand-accent/30 text-brand-text/70 hover:text-brand-dark transition-all cursor-pointer ${
                isCollapsed ? 'rotate-180 mx-auto mt-2' : ''
              }`}
              title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              <ChevronLeft className="w-4 h-4 transition-transform duration-300" />
            </button>
          </div>

          {/* User Card Compacta / Expandida */}
          {user && (
            <div
              className={`mx-3 my-3 p-3 bg-white/95 rounded-2xl border border-brand-accent/40 shadow-xs transition-all ${
                isCollapsed ? 'lg:p-2 lg:mx-2 lg:flex lg:justify-center' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="p-2 rounded-xl bg-brand-secondary text-brand-primary shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="overflow-hidden truncate animate-fade-in">
                    <p className="text-xs font-bold text-brand-dark truncate leading-tight">
                      {user.nombres} {user.apellidos}
                    </p>
                    <span className="inline-block px-2 py-0.2 mt-0.5 text-[9.5px] font-extrabold rounded-full bg-brand-primary/15 text-brand-primary truncate max-w-full">
                      {user.rol}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1.5">
            {navigation.map((item) => {
              const isAllowed = hasRole(item.roles as any);
              if (!isAllowed) return null;

              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    // Cerrar sidebar al navegar en pantallas móviles
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-sm translate-x-0.5'
                      : 'text-brand-text hover:bg-brand-accent/25 hover:text-brand-dark hover:translate-x-0.5'
                  } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-white scale-110' : 'text-brand-primary group-hover:scale-110'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate animate-fade-in">{item.name}</span>
                  )}

                  {/* Tooltip flotante al estar colapsado */}
                  {isCollapsed && (
                    <div className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1.5 bg-brand-dark text-white text-[11px] font-semibold rounded-xl shadow-xl whitespace-nowrap z-50 animate-slide-down pointer-events-none">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-brand-accent/30">
          <button
            onClick={solicitarConfirmacionSalir}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50/60 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer group relative ${
              isCollapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="animate-fade-in">Cerrar Sesión</span>}

            {isCollapsed && (
              <div className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1.5 bg-red-700 text-white text-[11px] font-bold rounded-xl shadow-xl whitespace-nowrap z-50 animate-slide-down pointer-events-none">
                Cerrar Sesión
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
