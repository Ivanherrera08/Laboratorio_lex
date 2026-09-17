'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, Variants } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Building2,
  ArrowRight,
  Microscope,
  FileCheck2,
  Activity,
  CheckCircle2,
  KeyRound,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

export default function PortalPublicoPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  // Si el usuario regresa al inicio por cualquier motivo, cerramos su sesión inmediatamente por seguridad estricta
  // Validamos pathname === '/' para evitar que caché de Next.js ejecute esto mientras estamos en otra página
  useEffect(() => {
    if (isAuthenticated && pathname === '/') {
      logout();
    }
  }, [isAuthenticated, logout, pathname]);

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      {/* 1. Header / Navbar Institucional con Glassmorphism */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="border-b border-brand-accent/20 bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-primary to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-primary/30">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl text-brand-dark tracking-tight">Zone Control</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wide border border-emerald-200">
                  v2.0 TOP
                </span>
              </div>
              <span className="block text-xs font-semibold text-brand-primary">
                Laboratorio Farmacéutico XYZ • Sistema Central
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Conexión Encriptada</span>
            </div>

            {/* Al aplicar logout estricto, este bloque 'if' ya no será visible mucho tiempo, pero lo dejamos limpiamente */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 text-brand-primary font-bold text-xs">
                Cerrando sesión segura...
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-xs transition-all shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <KeyRound className="w-4 h-4" />
                Portal Operativo
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* 2. Hero Section Principal con Animaciones */}
        <section className="relative overflow-hidden pt-20 pb-24">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <motion.div 
                className="lg:col-span-7 space-y-8"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-brand-primary/20 text-brand-primary text-xs font-extrabold shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                  Auditoría 21 CFR Part 11 & GMP
                </motion.div>

                <motion.h1 variants={fadeIn} className="text-5xl sm:text-6xl font-heading font-black text-brand-dark leading-[1.1] tracking-tight">
                  Control de Acceso Perimetral y <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-emerald-500">Trazabilidad en Vivo</span>
                </motion.h1>

                <motion.p variants={fadeIn} className="text-lg text-slate-600 leading-relaxed max-w-2xl font-light">
                  Plataforma unificada para la autenticación biométrica, asignación de permisos por niveles de bioseguridad y gestión de esclusas estériles en el <strong>Laboratorio XYZ</strong>.
                </motion.p>

                <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4 pt-4">
                  {isAuthenticated && user ? (
                    <div className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-300 text-slate-500 font-bold text-sm shadow-xl transition-all">
                      Cerrando sesión...
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-primary text-white font-bold text-sm shadow-xl shadow-brand-primary/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-brand-primary/40 active:scale-95 cursor-pointer btn-glow-effect"
                    >
                      <Lock className="w-5 h-5" />
                      Identificación de Personal
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                </motion.div>
              </motion.div>

              {/* Tarjeta Institucional 3D */}
              <motion.div 
                className="lg:col-span-5"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              >
                <div className="glass-panel p-8 rounded-[2rem] border border-white/60 shadow-2xl space-y-6 relative overflow-hidden card-hover-dynamic">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-primary/20 to-transparent rounded-bl-full" />
                  
                  <div className="flex items-center gap-4 border-b border-slate-200/50 pb-5 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/50 shadow-inner">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-base text-brand-dark">Laboratorio XYZ</h3>
                      <p className="text-xs text-slate-500 font-medium">Investigación y Producción Estéril</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-slate-700 relative z-10">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-lg bg-emerald-100/50 text-emerald-700 shrink-0 mt-0.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p><strong className="text-brand-dark font-bold">Airlocks System:</strong> Bloqueo electromagnético automático.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-lg bg-emerald-100/50 text-emerald-700 shrink-0 mt-0.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p><strong className="text-brand-dark font-bold">21 CFR Part 11:</strong> Firmas digitales y trazabilidad inmutable.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-lg bg-emerald-100/50 text-emerald-700 shrink-0 mt-0.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p><strong className="text-brand-dark font-bold">Niveles de Bioseguridad:</strong> Segmentación dinámica de áreas.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Módulos con scroll reveal */}
        <section className="bg-white py-24 relative z-20 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto px-6 space-y-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-2xl mx-auto space-y-4"
            >
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-brand-dark">
                Módulos de Arquitectura Core
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Diseñados para garantizar el cumplimiento regulatorio en plantas operativas ISO 14644.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Activity, title: 'Consola Perimetral', desc: 'Monitoreo de interbloqueo de puertas y validación RFID en vivo con feedback visual inmediato.' },
                { icon: Microscope, title: 'Gestión de Credenciales', desc: 'Control absoluto del padrón operativo, con suspensiones instantáneas y asignación de niveles.' },
                { icon: FileCheck2, title: 'Exportación Internacional', desc: 'Sincronización automatizada de bitácoras encriptadas para auditorías de casas matrices.' }
              ].map((mod, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-brand-primary/30 transition-colors group card-hover-dynamic"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <mod.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-black text-lg text-brand-dark mb-3">{mod.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {mod.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer Institucional */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>© 2026 Laboratorio Farmacéutico XYZ S.A. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="text-white">Soporte Operativo:</span>
            <span>+57 (601) 555-0199</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
