'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { RolUsuario } from '@/types';
import { usePreventBackNavigation } from '@/hooks/usePreventBackNavigation';

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

// Pantalla de carga neutral — mismo contenido en SSR y CSR para evitar hydration mismatch
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-secondary flex items-center justify-center text-brand-primary animate-pulse border border-brand-accent/40 shadow-xs">
        <ShieldCheck className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold text-brand-dark animate-pulse">{message}</p>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ FIX HYDRATION: No renderizar contenido dependiente de sessionStorage hasta que
  // el componente esté montado en el cliente. El servidor y el cliente deben mostrar
  // exactamente el mismo HTML en el primer render.
  const [mounted, setMounted] = useState(false);
  const [accesoPermitido, setAccesoPermitido] = useState<boolean | null>(null);

  // Estados de control del Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Bloqueo estricto de navegación histórica (BFCache / Botones Atrás y Adelante)
  usePreventBackNavigation('/login?error=session_expired');

  // Marcar como montado en el cliente (primer efecto que corre solo en browser)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar sesión al montar y redirigir si no hay token
  useEffect(() => {
    if (!mounted) return;

    const storedToken = sessionStorage.getItem('zone_control_token');
    if (!storedToken) {
      window.location.replace('/login?error=session_expired');
    }
  }, [mounted]);

  // Verificación de autenticación y RBAC una vez montado
  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!isAuthenticated || !user) {
      window.location.replace('/login?error=session_expired');
      return;
    }

    // Verificación de RBAC para la ruta actual
    const rolesRequeridos = routePermissions[pathname];
    if (rolesRequeridos && !rolesRequeridos.includes(user.rol)) {
      setAccesoPermitido(false);
    } else {
      setAccesoPermitido(true);
    }
  }, [mounted, isAuthenticated, isLoading, user, pathname, router]);

  // ✅ Antes de montar: pantalla neutra idéntica en SSR y CSR → sin hydration mismatch
  if (!mounted) {
    return <LoadingScreen message="Iniciando Zone Control..." />;
  }

  // Cargando sesión o esperando verificación RBAC
  if (isLoading || accesoPermitido === null) {
    return <LoadingScreen message="Validando credenciales y permisos de acceso seguro..." />;
  }

  // Sin sesión válida → pantalla de redirección (evita flash de contenido protegido)
  if (!isAuthenticated || !user || !token) {
    return <LoadingScreen message="Redirigiendo a portal seguro..." />;
  }

  // Sin el rol requerido para la ruta (RBAC Guard)
  if (accesoPermitido === false) {
    return (
      <div className="flex min-h-screen bg-brand-light">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
          <main className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="max-w-md bg-white p-8 rounded-3xl border border-red-200 shadow-lg space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="font-heading font-extrabold text-xl text-brand-dark">
                Acceso Restringido por Nivel de Rol
              </h2>
              <p className="text-xs text-brand-text/70 leading-relaxed">
                Su rol actual (<strong className="text-brand-dark">{user?.rol}</strong>) no cuenta con las
                atribuciones de seguridad requeridas para operar en este módulo.
              </p>
              <button
                onClick={() => router.replace('/dashboard/simulador')}
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
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        {/* Contenido protegido */}
        <main className="p-4 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
