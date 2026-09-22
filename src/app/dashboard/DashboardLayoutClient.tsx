'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { RolUsuario } from '@/types';
import { usePreventBackNavigation } from '@/hooks/usePreventBackNavigation';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 animate-pulse border border-emerald-200/40 shadow-xs">
        <ShieldCheck className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold text-slate-800 animate-pulse">{message}</p>
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
    const rolesRequeridos = pathname ? routePermissions[pathname] : undefined;
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
      <div className="flex min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
        {/* Fondo animado */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-emerald-100/20 mix-blend-multiply filter blur-[60px]" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>
        
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
          <main className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/50 shadow-2xl space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="font-heading font-black text-2xl text-slate-800 tracking-tight">
                Acceso Restringido
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Su rol actual (<strong className="text-emerald-600">{user?.rol}</strong>) no cuenta con las
                atribuciones de seguridad requeridas para operar en este módulo.
              </p>
              <button
                onClick={() => router.replace('/dashboard/simulador')}
                className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer w-full"
              >
                Volver al Simulador de Acceso
              </button>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Global Animated Background para toda la aplicación se maneja en globals.css */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-300/10 mix-blend-multiply filter blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-300/10 mix-blend-multiply filter blur-[80px]" />
      </div>

      {/* Z-10 Context for Interactive Elements */}
      <div className="relative z-20 flex min-h-screen w-full">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen relative">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
          {/* Contenido protegido con transiciones rápidas */}
          <main className="p-4 sm:p-8 flex-1 relative">
            <AnimatePresence>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
