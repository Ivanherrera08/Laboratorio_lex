'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UsuarioAuth, RolUsuario } from '@/types';
import {
  UserCog,
  Plus,
  Search,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  X,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { getUsuariosSistema, saveUsuariosSistema } from '@/lib/usuariosStore';
import { api, extraerMensajeError } from '@/lib/api';

export default function UsuariosSistemaPage() {
  const { user } = useAuth();
  const { agregarNotificacion } = useNotifications();

  const [usuarios, setUsuarios] = useState<UsuarioAuth[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Formulario con validaciones estrictas requeridas
  const [doc, setDoc] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<RolUsuario>('GESTOR_PERSONAL');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errores de validación en tiempo real y alertas
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [alertaExito, setAlertaExito] = useState('');
  const [alertaError, setAlertaError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [usuarioCreado, setUsuarioCreado] = useState<UsuarioAuth | null>(null);
  const [showExitoModal, setShowExitoModal] = useState(false);

  // Cargar usuarios desde el Backend al montar el componente
  const cargarUsuariosBackend = async (localesFallbacks: UsuarioAuth[]) => {
    setCargando(true);
    try {
      const res = await api.get<any[]>('/auth/usuarios');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const mapeados: UsuarioAuth[] = res.data.map((u) => ({
          id: u.id,
          documento: u.documento,
          nombres: u.nombres,
          apellidos: u.apellidos,
          correo: u.correo,
          rol: (typeof u.rol === 'object' && u.rol ? u.rol.nombre : u.rol) as RolUsuario,
          estado: u.estado || 'ACTIVO',
        }));
        setUsuarios(mapeados);
        saveUsuariosSistema(mapeados);
      }
    } catch {
      // Si falla o está offline, mantiene los del almacenamiento local
      setUsuarios(localesFallbacks);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const locales = getUsuariosSistema();
    cargarUsuariosBackend(locales);
  }, []);

  if (!isClient) return null; // Prevenir Hydration Mismatch

  // Validación de Nombres: Solo letras, espacios y tildes
  const handleNombresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const sanitized = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setNombres(sanitized);

    if (valor !== sanitized) {
      setErrores((prev) => ({
        ...prev,
        nombres: 'El nombre solo debe contener letras (sin números ni símbolos).',
      }));
    } else {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia.nombres;
        return copia;
      });
    }
  };

  // Validación de Apellidos: Solo letras, espacios y tildes
  const handleApellidosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const sanitized = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setApellidos(sanitized);

    if (valor !== sanitized) {
      setErrores((prev) => ({
        ...prev,
        apellidos: 'El apellido solo debe contener letras (sin números ni símbolos).',
      }));
    } else {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia.apellidos;
        return copia;
      });
    }
  };

  // Validación de Documento: solo números, máximo 12 dígitos
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 12) {
      setDoc(valor);
      if (valor.length < 4 && valor.length > 0) {
        setErrores((prev) => ({
          ...prev,
          doc: 'El documento debe tener entre 4 y 12 dígitos numéricos.',
        }));
      } else {
        setErrores((prev) => {
          const copia = { ...prev };
          delete copia.doc;
          return copia;
        });
      }
    }
  };

  // Validación de Teléfono: solo números, máximo 10 dígitos
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 10) {
      setTelefono(valor);
      if (valor.length !== 10 && valor.length > 0) {
        setErrores((prev) => ({
          ...prev,
          telefono: 'El número celular debe tener exactamente 10 dígitos.',
        }));
      } else {
        setErrores((prev) => {
          const copia = { ...prev };
          delete copia.telefono;
          return copia;
        });
      }
    }
  };

  // Validación de Correo Electrónico
  const handleCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setCorreo(valor);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (valor && !emailRegex.test(valor)) {
      setErrores((prev) => ({
        ...prev,
        correo: 'Formato de correo institucional inválido (ej. usuario@laboratorioxyz.com).',
      }));
    } else {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia.correo;
        return copia;
      });
    }
  };

  // Validación de Contraseña en tiempo real
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setPassword(valor);
    if (valor.length > 0) {
      if (valor.length < 8) {
        setErrores((prev) => ({ ...prev, password: 'Debe contener al menos 8 caracteres.' }));
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(valor)) {
        setErrores((prev) => ({
          ...prev,
          password: 'Debe incluir al menos 1 mayúscula, 1 minúscula y 1 número.',
        }));
      } else {
        setErrores((prev) => {
          const copia = { ...prev };
          delete copia.password;
          return copia;
        });
      }
    } else {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia.password;
        return copia;
      });
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertaError('');

    const nuevosErrores: Record<string, string> = {};

    if (!nombres.trim() || nombres.trim().length < 2) {
      nuevosErrores.nombres = 'Ingrese al menos 2 caracteres en el nombre.';
    }
    if (!apellidos.trim() || apellidos.trim().length < 2) {
      nuevosErrores.apellidos = 'Ingrese al menos 2 caracteres en el apellido.';
    }
    if (doc.length < 4 || doc.length > 12) {
      nuevosErrores.doc = 'La cédula debe contener entre 4 y 12 dígitos.';
    }
    if (telefono.length > 0 && telefono.length !== 10) {
      nuevosErrores.telefono = 'El celular debe tener exactamente 10 dígitos.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      nuevosErrores.correo = 'Ingrese un correo electrónico válido.';
    }
    if (password.length < 8 || password.length > 30) {
      nuevosErrores.password = 'La contraseña debe tener entre 8 y 30 caracteres.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      nuevosErrores.password = 'Debe incluir mayúscula, minúscula y número.';
    }
    if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden.';
    }

    const existeLocal = usuarios.some(
      (u) =>
        u.documento === doc.trim() ||
        u.correo.toLowerCase() === correo.trim().toLowerCase()
    );
    if (existeLocal) {
      nuevosErrores.doc = 'Ya existe un usuario con este documento o correo.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setGuardando(true);

    const rolIdMap: Record<RolUsuario, number> = {
      ADMINISTRADOR: 1,
      GESTOR_PERSONAL: 2,
      SUPERVISOR_ACCESOS: 3,
    };

    let idGenerado = Date.now();

    try {
      // 1. Intento de persistencia real en Backend PostgreSQL
      const res = await api.post('/auth/usuarios', {
        documento: doc.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim().toLowerCase(),
        password: password,
        rolId: rolIdMap[rol],
      });

      if (res.data?.id) {
        idGenerado = res.data.id;
      }
    } catch (err) {
      console.warn('Backend offline o aviso de creación:', err);
      const msg = extraerMensajeError(err);
      if (msg.includes('duplicad') || msg.includes('existe')) {
        setAlertaError(msg);
        setGuardando(false);
        return;
      }
    }

    const nuevoUsuario: UsuarioAuth = {
      id: idGenerado,
      documento: doc.trim(),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      correo: correo.trim().toLowerCase(),
      rol,
      estado: 'ACTIVO',
      mockPass: password, // Almacenar contraseña para simulación local
    };

    const listaActualizada = [nuevoUsuario, ...usuarios.filter((u) => u.documento !== nuevoUsuario.documento)];
    setUsuarios(listaActualizada);
    saveUsuariosSistema(listaActualizada);
    setUsuarioCreado(nuevoUsuario);

    // Registro persistente en el Centro de Notificaciones y Auditoría
    agregarNotificacion({
      titulo: `👤 Operador Creado: ${nuevoUsuario.nombres} ${nuevoUsuario.apellidos}`,
      mensaje: `Se asignaron credenciales institucionales y rol [${nuevoUsuario.rol}] a la cédula ${nuevoUsuario.documento}.`,
      tipo: 'SISTEMA',
      rolesDestino: ['ADMINISTRADOR'],
      accionUrl: '/dashboard/usuarios',
      detallesAuditoria: {
        evento: 'Registro de Operador Interno',
        modulo: 'Usuarios y Credenciales',
        operacion: 'CREACION_USUARIO',
        usuarioResponsable: user ? `${user.nombres} (${user.rol})` : 'Administrador',
        entidadInvolucrada: `CC: ${nuevoUsuario.documento} - ${nuevoUsuario.correo}`,
        valorAnterior: null,
        valorNuevo: JSON.stringify({
          documento: nuevoUsuario.documento,
          nombreCompleto: `${nuevoUsuario.nombres} ${nuevoUsuario.apellidos}`,
          correo: nuevoUsuario.correo,
          rol: nuevoUsuario.rol,
          estado: nuevoUsuario.estado,
        }),
        direccionIp: '127.0.0.1',
        resultado: 'USUARIO CREADO Y ACTIVADO',
      },
    });

    setGuardando(false);
    setDoc('');
    setNombres('');
    setApellidos('');
    setCorreo('');
    setTelefono('');
    setPassword('');
    setConfirmPassword('');
    setErrores({});
    setShowModal(false);
    setShowExitoModal(true);
  };

  const handleAlternarEstado = async (u: UsuarioAuth) => {
    const nuevoEstado = u.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';

    // Guard: nadie puede suspenderse a sí mismo (también lo valida el backend)
    if (esCuentaPropia(u)) {
      alert('No puedes suspender tu propia cuenta desde tu sesión.');
      return;
    }

    try {
      await api.patch(`/auth/usuarios/${u.id}/estado?nuevoEstado=${nuevoEstado}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'No se pudo actualizar el estado en el servidor.';
      alert(msg);
      return;
    }

    const listaActualizada = usuarios.map((item) =>
      item.id === u.id ? { ...item, estado: nuevoEstado as any } : item
    );
    setUsuarios(listaActualizada);
    saveUsuariosSistema(listaActualizada);

    setAlertaExito(`Estado de ${u.nombres} actualizado a [${nuevoEstado}].`);
    setTimeout(() => setAlertaExito(''), 4000);

    // Notificación persistente con auditoría
    agregarNotificacion({
      titulo: `🛡️ Estado de Operador Modificado: ${u.nombres}`,
      mensaje: `El usuario con cédula ${u.documento} pasó de ${u.estado} a ${nuevoEstado}.`,
      tipo: 'SEGURIDAD',
      rolesDestino: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
      accionUrl: '/dashboard/usuarios',
      detallesAuditoria: {
        evento: 'Cambio de Estado de Acceso de Usuario',
        modulo: 'Seguridad y Control de Cuentas',
        operacion: nuevoEstado === 'BLOQUEADO' ? 'BLOQUEO_CUENTA' : 'DESBLOQUEO_CUENTA',
        usuarioResponsable: user ? `${user.nombres} (${user.rol})` : 'Administrador',
        entidadInvolucrada: `${u.documento} (${u.correo})`,
        valorAnterior: JSON.stringify({ estado: u.estado }),
        valorNuevo: JSON.stringify({ estado: nuevoEstado }),
        direccionIp: '127.0.0.1',
        resultado: `ESTADO CAMBIADO A ${nuevoEstado}`,
      },
    });
  };

  const esCuentaPropia = (u: UsuarioAuth) =>
    !!user && (u.id === user.id || (!!user.documento && u.documento === user.documento));

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.documento.includes(busqueda) ||
      `${u.nombres} ${u.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-800">Usuarios del Sistema y Credenciales</h1>
          <p className="text-xs text-slate-500/70 mt-1">
            Gestión de operadores internos con autenticación, validación Bean Validation y asignación de roles RBAC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => cargarUsuariosBackend(usuarios)}
            disabled={cargando}
            className="p-2.5 rounded-xl border border-emerald-200/40 bg-white hover:bg-emerald-50 text-slate-800 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Sincronizar con PostgreSQL"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${cargando ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-600/90 text-white font-semibold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Registrar Usuario Interno
          </button>
        </div>
      </div>

      {/* Alertas */}
      {alertaExito && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-3 animate-slide-down shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{alertaExito}</span>
        </div>
      )}

      {alertaError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-semibold flex items-center gap-3 animate-slide-down shadow-xs">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <span>{alertaError}</span>
        </div>
      )}

      {/* Barra de Búsqueda */}
      <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/40 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500/50" />
        <input
          type="text"
          placeholder="Buscar por cédula, nombre, correo institucional o rol..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full text-xs outline-none bg-transparent font-medium"
        />
      </div>

      {/* Grid de Usuarios (Tarjetas Premium) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cargando && usuarios.length === 0 ? (
          // Skeletons de Carga
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="glass-panel rounded-3xl p-6 h-48 relative overflow-hidden animate-pulse">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-slate-200 skeleton-shimmer shrink-0" />
                <div className="space-y-3 w-full">
                  <div className="h-5 w-3/4 rounded bg-slate-200 skeleton-shimmer" />
                  <div className="h-4 w-1/2 rounded bg-slate-200 skeleton-shimmer" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pt-4 border-t border-slate-100">
                 <div className="h-6 w-24 rounded-full bg-slate-200 skeleton-shimmer" />
                 <div className="h-8 w-24 rounded-xl bg-slate-200 skeleton-shimmer" />
              </div>
            </div>
          ))
        ) : usuariosFiltrados.length > 0 ? (
          usuariosFiltrados.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-panel card-hover-dynamic rounded-3xl p-6 relative flex flex-col justify-between group overflow-hidden"
            >
              {/* Decoración de fondo en la tarjeta */}
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-200/40 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div>
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-4">
                    {/* Avatar generado */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 flex items-center justify-center border border-emerald-200/50 shadow-sm text-emerald-700 font-heading font-bold text-lg">
                      {item.nombres.charAt(0)}{item.apellidos.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-slate-800 text-[15px] leading-tight group-hover:text-emerald-700 transition-colors">
                        {item.nombres} {item.apellidos}
                      </h3>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5 flex items-center gap-1.5">
                         <span className="text-slate-400">CC</span> {item.documento}
                      </p>
                    </div>
                  </div>
                  {/* Estado Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm ${
                      item.estado === 'ACTIVO'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 badge-glow-authorized'
                        : 'bg-red-50 text-red-700 border-red-200 badge-glow-denied'
                    }`}
                  >
                    {item.estado === 'ACTIVO' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Ban className="w-3 h-3" />
                    )}
                    {item.estado}
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate" title={item.correo}>{item.correo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-bold ${
                        item.rol === 'ADMINISTRADOR'
                          ? 'text-purple-700 bg-purple-100/50'
                          : item.rol === 'GESTOR_PERSONAL'
                          ? 'text-emerald-700 bg-emerald-100/50'
                          : 'text-blue-700 bg-blue-100/50'
                      }`}
                    >
                      {item.rol.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100/60 flex items-center justify-end relative z-10">
                {esCuentaPropia(item) ? (
                  <span className="px-4 py-2 rounded-xl text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Tu cuenta actual
                  </span>
                ) : item.documento !== '0000000001' && (
                  <button
                    onClick={() => handleAlternarEstado(item)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-sm btn-glow-effect flex items-center gap-1.5 ${
                      item.estado === 'ACTIVO'
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 border border-amber-200'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/30'
                    }`}
                  >
                    {item.estado === 'ACTIVO' ? 'Suspender Acceso' : 'Reactivar Cuenta'}
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
             <UserCog className="w-12 h-12 text-slate-300 mb-3" />
             <h3 className="text-sm font-bold text-slate-700 mb-1">Sin resultados</h3>
             <p className="text-xs text-slate-500">No se encontraron usuarios que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>

      {/* MODAL: REGISTRO DE USUARIO CON CREDENCIALES */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-800/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-emerald-200/40 animate-modal-pop relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 mb-4 border-b border-emerald-200/30 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <UserCog className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-slate-800">
                    Crear Usuario con Credenciales
                  </h3>
                  <p className="text-xs text-slate-500/70">
                    Validación estricta de formatos institucionales y roles RBAC.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleCrearUsuario} className="space-y-3.5 overflow-y-auto pr-1 flex-1 min-h-0">
              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-500">
                      Nombres * <span className="text-gray-400 font-normal">(Solo letras)</span>
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600">{nombres.length}/50</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={handleNombresChange}
                    placeholder="Ej. Roberto Carlos"
                    maxLength={50}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      errores.nombres
                        ? 'border-red-400 focus:ring-red-200 bg-red-50/40'
                        : 'border-emerald-200/60 focus:ring-emerald-600/40'
                    }`}
                  />
                  {errores.nombres && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.nombres}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-500">
                      Apellidos * <span className="text-gray-400 font-normal">(Solo letras)</span>
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600">{apellidos.length}/50</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={apellidos}
                    onChange={handleApellidosChange}
                    placeholder="Ej. Gómez Pérez"
                    maxLength={50}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      errores.apellidos
                        ? 'border-red-400 focus:ring-red-200 bg-red-50/40'
                        : 'border-emerald-200/60 focus:ring-emerald-600/40'
                    }`}
                  />
                  {errores.apellidos && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.apellidos}</p>}
                </div>
              </div>

              {/* Cédula */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-500">
                    Cédula de Ciudadanía (CC) * <span className="text-gray-400 font-normal">(4 - 12 dígitos)</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600">{doc.length}/12</span>
                </div>
                <input
                  type="text"
                  required
                  value={doc}
                  onChange={handleDocChange}
                  placeholder="Ej. 1020304050"
                  maxLength={12}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 ${
                    errores.doc
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/40'
                      : 'border-emerald-200/60 focus:ring-emerald-600/40'
                  }`}
                />
                {errores.doc && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.doc}</p>}
              </div>

              {/* Correo y Celular */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-500">Correo Institucional *</label>
                    <span className="text-[10px] font-mono text-emerald-600">{correo.length}/100</span>
                  </div>
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={handleCorreoChange}
                    placeholder="nombre@laboratorioxyz.com"
                    maxLength={100}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      errores.correo
                        ? 'border-red-400 focus:ring-red-200 bg-red-50/40'
                        : 'border-emerald-200/60 focus:ring-emerald-600/40'
                    }`}
                  />
                  {errores.correo && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.correo}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-500">
                      Celular <span className="text-gray-400 font-normal">(10 dígitos)</span>
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600">{telefono.length}/10</span>
                  </div>
                  <input
                    type="text"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    placeholder="3001234567"
                    maxLength={10}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 ${
                      errores.telefono
                        ? 'border-red-400 focus:ring-red-200 bg-red-50/40'
                        : 'border-emerald-200/60 focus:ring-emerald-600/40'
                    }`}
                  />
                  {errores.telefono && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.telefono}</p>}
                </div>
              </div>

              {/* Rol Asignado */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Rol en el Sistema (RBAC) *</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RolUsuario)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200/60 text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                >
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Control total del sistema)</option>
                  <option value="GESTOR_PERSONAL">GESTOR_PERSONAL (Personal, Carga CSV y Carnets)</option>
                  <option value="SUPERVISOR_ACCESOS">SUPERVISOR_ACCESOS (Historial, Bitácora y Socio)</option>
                </select>
              </div>

              {/* Contraseñas de Acceso */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-emerald-200/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Credenciales de Acceso al Portal (Bean Validation)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-slate-500">Contraseña (Mín 8 car.) *</label>
                      <span className="text-[9px] font-mono text-emerald-600">{password.length}/30</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        maxLength={30}
                        className={`w-full px-3 py-2 pr-9 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 ${
                          errores.password
                            ? 'border-red-400 focus:ring-red-200 bg-red-50/40'
                            : 'border-emerald-200/60 focus:ring-emerald-600/40'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errores.password && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.password}</p>}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-slate-500">Confirmar Contraseña *</label>
                      <span className="text-[9px] font-mono text-emerald-600">{confirmPassword.length}/30</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        maxLength={30}
                        className={`w-full px-3 py-2 pr-9 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 ${
                          errores.confirmPassword
                            ? 'border-red-400 focus:ring-red-200 bg-red-50/40'
                            : 'border-emerald-200/60 focus:ring-emerald-600/40'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errores.confirmPassword && (
                      <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.confirmPassword}</p>
                    )}
                  </div>
                </div>
                <p className="text-[9px] text-slate-500">
                  Regla de seguridad: Al menos una mayúscula, una minúscula y un número.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-emerald-200/30">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-600/90 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Crear y Activar Usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dinámico de Registro Exitoso */}
      {showExitoModal && usuarioCreado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200/40 relative overflow-hidden animate-modal-pop">
            <div className="relative z-10 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-200/80 flex items-center justify-center shadow-lg shadow-emerald-600/30 text-white mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-emerald-200/60 text-slate-800 text-[11px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                USUARIO CREADO CON ÉXITO
              </div>

              <h2 className="text-xl font-heading font-extrabold text-slate-800 mb-1">
                ¡Credenciales Asignadas!
              </h2>
              <p className="text-xs text-slate-500/75 mb-5">
                El usuario interno ya cuenta con autorización para autenticarse en el portal de <strong className="text-slate-800 font-semibold">Laboratorio Lex</strong>.
              </p>

              {/* Ficha Resumen del Usuario */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/50 text-left space-y-2 mb-6">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/30">
                  <span className="text-[11px] font-medium text-slate-500/70">Operador:</span>
                  <span className="text-xs font-bold text-slate-800">
                    {usuarioCreado.nombres} {usuarioCreado.apellidos}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/30">
                  <span className="text-[11px] font-medium text-slate-500/70">Documento / Cédula:</span>
                  <span className="text-xs font-mono font-bold text-emerald-600">{usuarioCreado.documento}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/30">
                  <span className="text-[11px] font-medium text-slate-500/70">Correo Institucional:</span>
                  <span className="text-xs font-medium text-slate-800">{usuarioCreado.correo}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/30">
                  <span className="text-[11px] font-medium text-slate-500/70">Rol de Seguridad:</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-600/10 text-emerald-600 border border-emerald-600/20">
                    {usuarioCreado.rol}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-slate-500/70">Estado de la Cuenta:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A9B8E]/15 text-[#2E6F64]">
                    <ShieldCheck className="w-3 h-3" />
                    ACTIVO
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowExitoModal(false);
                  setUsuarioCreado(null);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
