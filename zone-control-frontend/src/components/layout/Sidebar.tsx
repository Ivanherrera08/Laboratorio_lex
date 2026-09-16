'use client';

import React, { useState } from 'react';
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
  Menu,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, solicitarConfirmacionSalir, hasRole } = useAuth();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const navigation = [
    {
      name: 'Simulador de Acceso',
      href: '/dashboard/simulador',
      icon: ScanLine,
      badge: 'RFID Activo',
      roles: ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'],
    },
    {
      name: 'Gestión de Personal',
      href: '/dashboard/personal',
      icon: Users,
      badge: 'Multi-Área',
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
      badge: '21 CFR 11',
      roles: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
    },
  ];

  // Determinar si el menú está visualmente expandido (por hover o en móvil)
  const isExpanded = isHovered || isOpen;

  return (
    <>
      {/* Backdrop suave para móviles */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-fade-in transition-opacity"
        />
      )}

      {/* 
        Contenedor Lateral:
        - En desktop: Base compacta (w-[72px]) que al pasar el ratón (onMouseEnter) se expande dinámicamente a w-72 con animación y sombra flotante premium.
      */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-50
          bg-gradient-to-b from-[#EBF5EE] via-[#F4FAF6] to-[#E5F2E9]
          border-r border-brand-accent/40
          flex flex-col justify-between min-h-screen
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          shadow-md
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isHovered ? 'lg:w-72 lg:shadow-2xl' : 'lg:w-[76px]'}
        `}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header del Menú con Icono de Hamburguesa Dinámico */}
          <div className="p-3.5 border-b border-brand-accent/40 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Botón/Logo Hamburguesa con Animación de Giro y Escala al Hover */}
              <div
                className={`w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0 transition-all duration-300 ${
                  isHovered ? 'scale-105 rotate-3 shadow-brand-primary/30' : ''
                }`}
              >
                {isHovered ? (
                  <Sparkles className="w-5 h-5 animate-pulse" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Título animado al desplegarse por hover */}
              <div
                className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  isExpanded ? 'opacity-100 translate-x-0 max-w-[200px]' : 'opacity-0 -translate-x-4 max-w-0 pointer-events-none'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-base text-brand-dark tracking-tight">
                    Zone Control
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">
                  Laboratorio XYZ
                </span>
              </div>
            </div>

            {/* Botón cerrar para vista móvil */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-brand-accent/30 lg:hidden cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tarjeta de Usuario Compacta/Desplegada */}
          {user && (
            <div
              className={`mx-2.5 my-3 p-2.5 rounded-2xl bg-white/90 border border-brand-accent/50 shadow-xs transition-all duration-300 ${
                isHovered ? 'shadow-md border-brand-primary/40 bg-white' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-brand-secondary text-brand-primary flex items-center justify-center shrink-0 border border-brand-accent/30">
                  <UserCheck className="w-4 h-4" />
                </div>
                
                <div
                  className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    isExpanded ? 'opacity-100 translate-x-0 max-w-[180px]' : 'opacity-0 -translate-x-4 max-w-0 pointer-events-none'
                  }`}
                >
                  <p className="text-xs font-bold text-brand-dark truncate leading-tight">
                    {user.nombres} {user.apellidos}
                  </p>
                  <span className="inline-block px-2 py-0.2 mt-0.5 text-[9px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 truncate">
                    {user.rol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Menú de Navegación con Micro-Animaciones */}
          <nav className="p-2.5 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden">
            {navigation.map((item, index) => {
              const isAllowed = hasRole(item.roles as any);
              if (!isAllowed) return null;

              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  style={{
                    transitionDelay: isHovered ? `${index * 20}ms` : '0ms',
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-primary to-emerald-700 text-white shadow-md shadow-brand-primary/20 scale-[1.02]'
                      : 'text-slate-700 hover:bg-white hover:text-brand-dark hover:shadow-xs hover:scale-[1.02]'
                  }`}
                >
                  {/* Icono con Efecto de Brillo/Glow */}
                  <div className={`shrink-0 p-1 rounded-lg transition-transform duration-200 ${
                    isActive ? 'text-white' : 'text-brand-primary group-hover:scale-110 group-hover:text-emerald-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Nombre y Badge con transición suave */}
                  <div
                    className={`flex items-center justify-between flex-1 overflow-hidden transition-all duration-300 whitespace-nowrap ${
                      isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'
                    }`}
                  >
                    <span className="truncate font-semibold">{item.name}</span>
                    {item.badge && (
                      <span className={`text-[8.5px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-tight ml-1 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Indicador de flecha en hover */}
                  {isExpanded && !isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Botón de Cerrar Sesión con Animación */}
        <div className="p-2.5 border-t border-brand-accent/40 bg-white/40">
          <button
            onClick={solicitarConfirmacionSalir}
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50/80 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 transition-all duration-200 cursor-pointer shadow-2xs group hover:scale-[1.02]`}
          >
            <div className="shrink-0 p-1">
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            
            <div
              className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none'
              }`}
            >
              <span>Cerrar Sesión</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Espaciador invisible para no tapar el contenido en Desktop */}
      <div className="hidden lg:block w-[76px] shrink-0 pointer-events-none" />
    </>
  );
}
