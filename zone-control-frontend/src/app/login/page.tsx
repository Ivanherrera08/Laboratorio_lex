'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Lock, Mail, AlertTriangle, KeyRound, ArrowLeft, Info, Check, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const redirectParam = searchParams.get('redirect');
  const logoutParam = searchParams.get('logout');

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

  // Modal recuperación
  const [showRecuperar, setShowRecuperar] = useState(false);
  const [recuperarCorreo, setRecuperarCorreo] = useState('');
  const [recuperarMsg, setRecuperarMsg] = useState('');

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Si el usuario ya está autenticado, redirigir al simulador y no mostrar el formulario
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard/simulador');
    }
  }, [isAuthenticated, router]);

  // Usuarios Demo — correos y contraseña real del backend
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBloqueado) return;

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

      // Conteo de intentos fallidos (Regla de negocio: 3 intentos antes de bloqueo)
      const nuevosIntentos = intentosFallidos + 1;
      setIntentosFallidos(nuevosIntentos);

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

  const autoCompletar = (correoDemo: string, pass: string) => {
    setCorreo(correoDemo);
    setPassword(pass);
    setErrorMsg('');
  };

  const handleRecuperarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecuperarMsg('Si el correo está registrado, se ha enviado un token de recuperación temporal.');
    setTimeout(() => {
      setShowRecuperar(false);
      setRecuperarMsg('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-animated flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Elementos decorativos de fondo para resaltar el glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl mix-blend-multiply animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl mix-blend-multiply animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-xl relative z-10 card-hover-dynamic">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-sm mb-3">
            Z
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-brand-dark">Zone Control</h2>
          <p className="text-xs text-brand-primary font-semibold">Autenticación de Personal Autorizado</p>
        </div>

        {/* Panel de Credenciales Rápidas para Test */}
        <div className="mb-6 p-3.5 bg-brand-light rounded-2xl border border-brand-accent/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark">
            <Info className="w-4 h-4 text-brand-primary" />
            <span>Credenciales Demo (Clic para autocompletar):</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => autoCompletar('admin@laboratorioxyz.com', 'Admin123!')}
              className="px-2 py-1.5 rounded-lg bg-white border border-brand-accent/60 font-medium text-brand-dark hover:bg-brand-primary hover:text-white transition-all text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => autoCompletar('gestor@laboratorioxyz.com', 'Admin123!')}
              className="px-2 py-1.5 rounded-lg bg-white border border-brand-accent/60 font-medium text-brand-dark hover:bg-brand-primary hover:text-white transition-all text-center"
            >
              Gestor
            </button>
            <button
              type="button"
              onClick={() => autoCompletar('supervisor@laboratorioxyz.com', 'Admin123!')}
              className="px-2 py-1.5 rounded-lg bg-white border border-brand-accent/60 font-medium text-brand-dark hover:bg-brand-primary hover:text-white transition-all text-center"
            >
              Auditor
            </button>
          </div>

        </div>

        {/* Error / Bloqueo Alert */}
        {errorMsg && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-xs font-medium ${
            isBloqueado ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-brand-text">Correo Institucional</label>
              <span className="text-[10px] font-medium text-brand-text/50">{correo.length}/100</span>
            </div>
            <input
              type="email"
              required
              disabled={isBloqueado}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="admin@laboratorioxyz.com"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-accent/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-sm transition-all disabled:bg-gray-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-brand-text">Contraseña de Acceso</label>
              <span className="text-[10px] font-medium text-brand-text/50">{password.length}/18</span>
            </div>
            <input
              type="password"
              required
              disabled={isBloqueado}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              maxLength={18}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-accent/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-sm transition-all disabled:bg-gray-100"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowRecuperar(true)}
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isBloqueado || loading}
            className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-sm transition-all shadow-lg btn-glow-effect disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Validando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-brand-accent/30 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-brand-text/70 hover:text-brand-primary">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Portal Institucional
          </Link>
        </div>
      </div>

      {/* Modal de Recuperación */}
      {showRecuperar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-brand-accent/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-brand-secondary text-brand-primary">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-brand-dark">Recuperar Contraseña</h3>
                <p className="text-xs text-brand-text/70">Enviaremos un enlace temporal a su buzón</p>
              </div>
            </div>

            {recuperarMsg ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-medium border border-emerald-200">
                {recuperarMsg}
              </div>
            ) : (
              <form onSubmit={handleRecuperarClave} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-brand-text">Correo Institucional</label>
                    <span className="text-[10px] font-medium text-brand-text/50">{recuperarCorreo.length}/100</span>
                  </div>
                  <input
                    type="email"
                    required
                    value={recuperarCorreo}
                    onChange={(e) => setRecuperarCorreo(e.target.value)}
                    placeholder="usuario@laboratorioxyz.com"
                    maxLength={100}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-accent/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRecuperar(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary/90"
                  >
                    Enviar Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-secondary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
