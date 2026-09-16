'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { ShieldAlert, ShieldCheck, Lock } from 'lucide-react';
import { RolUsuario } from '@/types';

// Matriz estricta de permisos por ruta (RBAC)
const routePermissions: Record<string, RolUsuario[]> = {
  '/dashboard/simulador': ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'],
  '/dashboard/personal': ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
  '/dashboard/usuarios': ['ADMINISTRADOR'],
  '/dashboard/carga-masiva': ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
  '/dashboard/catalogos': ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
  '/dashboard/historial': ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'],
  '/dashboard/socio-sync': ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
  '/dashboard/auditoria': ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accesoPermitido, setAccesoPermitido] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/login?error=unauthorized');
        return;
      }

      // Verificación de RBAC para la ruta actual
      const rolesRequeridos = routePermissions[pathname];
      if (rolesRequeridos && !rolesRequeridos.includes(user.rol)) {
        setAccesoPermitido(false);
      } else {
        setAccesoPermitido(true);
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  // Pantalla de carga mientras valida la sesión criptográfica
  if (isLoading || accesoPermitido === null) {
    return (
      <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-secondary flex items-center justify-center text-brand-primary animate-pulse border border-brand-accent/40 shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-brand-dark animate-pulse">
          Validando credenciales y permisos de acceso seguro...
        </p>
      </div>
    );
  }

  // Pantalla de bloqueo si no tiene el rol correspondiente (RBAC Guard)
  if (accesoPermitido === false) {
    return (
      <div className="flex min-h-screen bg-brand-light">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="p-8 flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="max-w-md bg-white p-8 rounded-3xl border border-red-200 shadow-lg space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="font-heading font-extrabold text-xl text-brand-dark">
                Acceso Restringido por Nivel de Rol
              </h2>
              <p className="text-xs text-brand-text/70 leading-relaxed">
                Su rol actual (<strong className="text-brand-dark">{user?.rol}</strong>) no cuenta con las atribuciones de seguridad requeridas para operar en este módulo.
              </p>
              <button
                onClick={() => router.push('/dashboard/simulador')}
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/90 shadow-md transition-all cursor-pointer"
              >
                Volver al Simulador de Acceso
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-light">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        <Header />
        {/* Contenido protegido */}
        <main className="p-8 flex-1 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
