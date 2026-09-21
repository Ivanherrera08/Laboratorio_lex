'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Lock, Mail, AlertTriangle, KeyRound, ArrowLeft, ShieldAlert, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams?.get('error');

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [isBloqueado, setIsBloqueado] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    errorParam === 'unauthorized'
      ? 'Acceso denegado: Debe autenticarse con credenciales válidas para ingresar a esta URL restringida.'
      : errorParam === 'session_expired'
      ? 'Su sesión ha expirado por políticas de seguridad farmacéutica.'
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Modal recuperación
  const [showRecuperar, setShowRecuperar] = useState(false);
  const [recuperarCorreo, setRecuperarCorreo] = useState('');
  const [recuperarMsg, setRecuperarMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Si el usuario ya está autenticado, redirigir al simulador
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard/simulador');
    }
  }, [isAuthenticated, router]);

  // Usuarios Demo
  const usuariosDemo: Record<string, { pass: string; user: any }> = {
    'admin@laboratorioxyz.com': {
      pass: 'Admin123!',
      user: { id: 1, documento: '10001234', nombres: 'Dr. Roberto', apellidos: 'Gomez', correo: 'admin@laboratorioxyz.com', rol: 'ADMINISTRADOR', estado: 'ACTIVO' },
    },
    'gestor@laboratorioxyz.com': {
      pass: 'Admin123!',
      user: { id: 2, documento: '10002345', nombres: 'Maria Fernanda', apellidos: 'Londono', correo: 'gestor@laboratorioxyz.com', rol: 'GESTOR_PERSONAL', estado: 'ACTIVO' },
    },
    'supervisor@laboratorioxyz.com': {
      pass: 'Admin123!',
      user: { id: 3, documento: '10003456', nombres: 'Ing. Alejandro', apellidos: 'Torres', correo: 'supervisor@laboratorioxyz.com', rol: 'SUPERVISOR_ACCESOS', estado: 'ACTIVO' },
    },
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBloqueado) {
      triggerShake();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Intentar con el backend real (Spring Boot)
      const res = await api.post('/auth/login', { correo, password });
      const usuarioBackend = {
        id: res.data.usuario.id,
        documento: res.data.usuario.documento,
        nombres: res.data.usuario.nombres,
        apellidos: res.data.usuario.apellidos,
        correo: res.data.usuario.correo,
        rol: res.data.usuario.rol,
        estado: res.data.usuario.estado,
      };
      login(res.data.token, usuarioBackend);
      router.replace('/dashboard/simulador');
    } catch (err: any) {
      // Fallback demo cuando el backend no está disponible
      const demoAccount = usuariosDemo[correo.toLowerCase()];

      if (demoAccount && password === demoAccount.pass) {
        login(`mock_jwt_${demoAccount.user.rol.toLowerCase()}`, demoAccount.user);
        router.replace('/dashboard/simulador');
        return;
      }

      // Conteo de intentos fallidos
      const nuevosIntentos = intentosFallidos + 1;
      setIntentosFallidos(nuevosIntentos);
      triggerShake();

      if (nuevosIntentos >= 3) {
        setIsBloqueado(true);
        setErrorMsg('Cuenta BLOQUEADA por seguridad tras 3 intentos fallidos consecutivos. Contacte a Soporte.');
      } else {
        setErrorMsg(`Credenciales incorrectas. Intento ${nuevosIntentos} de 3 permitidos.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Efecto de máquina de escribir para autocompletar
  const autoCompletar = async (correoDemo: string, pass: string) => {
    if (loading) return;
    setErrorMsg('');
    setIsBloqueado(false);

    setCorreo('');
    setPassword('');
    
    // Animación de tecleo simulada
    for (let i = 0; i < correoDemo.length; i++) {
      await new Promise(r => setTimeout(r, 20));
      setCorreo(prev => prev + correoDemo[i]);
    }
    
    for (let i = 0; i < pass.length; i++) {
      await new Promise(r => setTimeout(r, 20));
      setPassword(prev => prev + pass[i]);
    }
  };

  const handleRecuperarClave = (e: React.FormEvent) => {
    e.preventDefault();
    setRecuperarMsg(`Se ha enviado un enlace seguro y un código OTP al correo ${recuperarCorreo}. El enlace expira en 5 minutos.`);
    setTimeout(() => {
      setShowRecuperar(false);
      setRecuperarMsg('');
      setRecuperarCorreo('');
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Mesh Gradient Background Líquido - Tono Claro */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-200/40 mix-blend-multiply filter blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-200/30 mix-blend-multiply filter blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            x: [0, 30, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-green-200/30 mix-blend-multiply filter blur-[100px]"
        />
        
        {/* Patrón de puntos sutil */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      {/* Contenedor Principal Animado */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-md relative z-10"
      >
        
        {/* Tarjeta Glassmorphism Blanca */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)] border border-white">
          
          {/* Logo y Encabezado */}
          <div className="text-center mb-10 relative">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30 relative group cursor-pointer"
            >
              <span className="text-white font-extrabold text-3xl font-heading absolute z-10">Z</span>
              {/* Glow logo */}
              <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
            <h2 className="text-3xl font-heading font-black text-slate-800 tracking-tight">Zone Control</h2>
            <p className="text-xs font-bold text-emerald-600 mt-2 uppercase tracking-widest">Autenticación Biométrica</p>
          </div>

          {/* Chips de Demo - Más dinámicos */}
          <div className="mb-8">
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mb-3">Credenciales de Simulación</p>
            <div className="flex justify-center gap-2">
              {[
                { label: 'Admin', email: 'admin@laboratorioxyz.com' },
                { label: 'Gestor', email: 'gestor@laboratorioxyz.com' },
                { label: 'Auditor', email: 'supervisor@laboratorioxyz.com' }
              ].map((btn, i) => (
                <motion.button
                  key={btn.label}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  onClick={() => autoCompletar(btn.email, 'Admin123!')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-100 transition-all"
                >
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Alertas con animaciones ricas */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                className="overflow-hidden mb-6"
              >
                <div className={`p-4 rounded-2xl flex items-start gap-3 border shadow-sm ${
                  isBloqueado 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isBloqueado ? (
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-500 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                  )}
                  <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulario */}
          <form onSubmit={handleLogin} className={`space-y-5 ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            
            <div className="relative group">
              <input
                id="correo"
                type="email"
                required
                disabled={isBloqueado || loading}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder=" "
                className="peer w-full px-4 pt-6 pb-2 pr-12 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all disabled:opacity-50 font-medium placeholder-shown:tracking-normal"
              />
              <label
                htmlFor="correo"
                className="absolute left-4 top-2 text-[10px] uppercase tracking-wider text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-emerald-600 font-bold pointer-events-none"
              >
                Correo Institucional
              </label>
              <div className="absolute right-4 top-4 text-slate-300 peer-focus:text-emerald-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
            </div>

            <div className="relative group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isBloqueado || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                maxLength={18}
                className="peer w-full px-4 pt-6 pb-2 pr-12 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all disabled:opacity-50 font-mono text-lg tracking-widest placeholder-shown:tracking-normal"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-[10px] uppercase tracking-wider text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-emerald-600 font-bold pointer-events-none"
              >
                Código de Acceso
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowRecuperar(true)}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={isBloqueado || loading}
              whileHover={{ scale: isBloqueado ? 1 : 1.02 }}
              whileTap={{ scale: isBloqueado ? 1 : 0.98 }}
              className="relative w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group mt-2"
            >
              {/* Efecto de brillo (shine) */}
              <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
              
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validando Credenciales...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Ingresar al Sistema
                  </>
                )}
              </div>
            </motion.button>
          </form>

        </div>

        {/* Link Volver */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors group bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al Portal Institucional
          </Link>
        </div>
      </motion.div>

      {/* Modal de Recuperación Glassmorphism - Light */}
      <AnimatePresence>
        {showRecuperar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white max-w-md w-full rounded-[2rem] p-8 border border-slate-100 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">Recuperar Acceso</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Token de un solo uso (OTP)</p>
                </div>
              </div>

              {recuperarMsg ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-bold border border-emerald-200 text-center leading-relaxed"
                >
                  {recuperarMsg}
                </motion.div>
              ) : (
                <form onSubmit={handleRecuperarClave} className="space-y-5">
                  <div className="relative group">
                    <input
                      id="recuperarCorreo"
                      type="email"
                      required
                      value={recuperarCorreo}
                      onChange={(e) => setRecuperarCorreo(e.target.value)}
                      placeholder=" "
                      maxLength={100}
                      className="peer w-full px-4 pt-6 pb-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    <label
                      htmlFor="recuperarCorreo"
                      className="absolute left-4 top-2 text-[10px] uppercase tracking-wider text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-emerald-600 font-bold pointer-events-none"
                    >
                      Correo Institucional
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRecuperar(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all"
                    >
                      Enviar Token
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
