'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Users,
  Building2,
  ScanLine,
  FileSpreadsheet,
  Globe2,
  FileText,
  LogOut,
  UserCheck,
} from 'lucide-react';

export default function Sidebar() {
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
    <aside className="w-64 bg-brand-secondary border-r border-brand-accent/30 flex flex-col justify-between min-h-screen shrink-0">
      <div>
        {/* Header Wordmark */}
        <div className="p-6 border-b border-brand-accent/30">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
              Z
            </div>
            <div>
              <span className="font-heading font-bold text-lg text-brand-dark tracking-tight">Zone Control</span>
              <span className="block text-[10px] font-bold text-brand-primary uppercase tracking-wider">Laboratorio XYZ</span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-4 my-3 bg-white/90 rounded-2xl border border-brand-accent/40 shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-secondary text-brand-primary">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-brand-dark truncate">{user.nombres} {user.apellidos}</p>
                <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-extrabold rounded-full bg-brand-primary/15 text-brand-primary">
                  {user.rol}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const isAllowed = hasRole(item.roles as any);
            if (!isAllowed) return null;

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm translate-x-1'
                    : 'text-brand-text hover:bg-brand-accent/25 hover:text-brand-dark hover:translate-x-1'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white scale-110' : 'text-brand-primary'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout con confirmación */}
      <div className="p-4 border-t border-brand-accent/30">
        <button
          onClick={solicitarConfirmacionSalir}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer hover:translate-x-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
