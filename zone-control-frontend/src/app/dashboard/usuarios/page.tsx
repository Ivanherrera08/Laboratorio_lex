'use client';

import React, { useState } from 'react';
import { UsuarioAuth, RolUsuario } from '@/types';
import {
  UserCog,
  Plus,
  Search,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  CreditCard,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  X,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { getUsuariosSistema, saveUsuariosSistema } from '@/lib/usuariosStore';

const mockUsuariosSistema: UsuarioAuth[] = [
  {
    id: 1,
    documento: '10001234',
    nombres: 'Dr. Roberto',
    apellidos: 'Gómez',
    correo: 'admin@laboratorioxyz.com',
    rol: 'ADMINISTRADOR',
    estado: 'ACTIVO',
  },
  {
    id: 2,
    documento: '10002345',
    nombres: 'María Fernanda',
    apellidos: 'Londoño',
    correo: 'gestor@laboratorioxyz.com',
    rol: 'GESTOR_PERSONAL',
    estado: 'ACTIVO',
  },
  {
    id: 3,
    documento: '10003456',
    nombres: 'Ing. Alejandro',
    apellidos: 'Torres',
    correo: 'supervisor@laboratorioxyz.com',
    rol: 'SUPERVISOR_ACCESOS',
    estado: 'ACTIVO',
  },
];

export default function UsuariosSistemaPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAuth[]>(() => getUsuariosSistema());
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

  // Errores de validación en tiempo real
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [alertaExito, setAlertaExito] = useState('');

  const [usuarioCreado, setUsuarioCreado] = useState<UsuarioAuth | null>(null);
  const [showExitoModal, setShowExitoModal] = useState(false);

  const { agregarNotificacion } = useNotifications();

  // Validación de Nombres: Solo letras, espacios, tildes y ñ (Sin números ni signos)
  const handleNombresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    // Permite únicamente letras del alfabeto español y espacios
    const sanitized = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setNombres(sanitized);

    if (valor !== sanitized) {
      setErrores((prev) => ({ ...prev, nombres: 'El nombre solo debe contener letras (sin números ni signos de puntuación).' }));
    } else {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia.nombres;
        return copia;
      });
    }
  };

  // Validación de Apellidos: Solo letras, espacios, tildes y ñ (Sin números ni signos)
  const handleApellidosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const sanitized = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setApellidos(sanitized);

    if (valor !== sanitized) {
      setErrores((prev) => ({ ...prev, apellidos: 'El apellido solo debe contener letras (sin números ni signos de puntuación).' }));
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
    const valor = e.target.value.replace(/\D/g, ''); // solo dígitos
    if (valor.length <= 12) {
      setDoc(valor);
      if (valor.length < 6 && valor.length > 0) {
        setErrores((prev) => ({ ...prev, doc: 'El documento debe tener al menos 6 dígitos (máx. 12).' }));
      } else {
        setErrores((prev) => {
          const copia = { ...prev };
          delete copia.doc;
          return copia;
        });
      }
    }
  };

  // Validación de Teléfono / Celular: solo números, máximo 10 dígitos
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, ''); // solo dígitos
    if (valor.length <= 10) {
      setTelefono(valor);
      if (valor.length !== 10 && valor.length > 0) {
        setErrores((prev) => ({ ...prev, telefono: 'El número celular debe tener exactamente 10 dígitos.' }));
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
      setErrores((prev) => ({ ...prev, correo: 'Formato de correo electrónico institucional inválido.' }));
    } else {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia.correo;
        return copia;
      });
    }
  };

  const handleCrearUsuario = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevosErrores: Record<string, string> = {};

    if (!nombres.trim()) {
      nuevosErrores.nombres = 'Ingrese los nombres (solo letras).';
    }
    if (!apellidos.trim()) {
      nuevosErrores.apellidos = 'Ingrese los apellidos (solo letras).';
    }
    if (doc.length < 4 || doc.length > 12) {
      nuevosErrores.doc = 'La cédula debe contener entre 4 y 12 dígitos.';
    }
    if (telefono.length > 0 && telefono.length !== 10) {
      nuevosErrores.telefono = 'El celular debe contener exactamente 10 dígitos.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      nuevosErrores.correo = 'Ingrese un correo electrónico válido (ejemplo: usuario@laboratorioxyz.com).';
    }
    if (password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener mínimo 6 caracteres.';
    }
    if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden.';
    }

    const existe = usuarios.some((u) => u.documento === doc.trim() || u.correo.toLowerCase() === correo.trim().toLowerCase());
    if (existe) {
      nuevosErrores.doc = 'Ya existe un usuario registrado con esta cédula o correo.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const nuevoUsuario: UsuarioAuth = {
      id: Date.now(),
      documento: doc.trim(),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      correo: correo.trim().toLowerCase(),
      rol,
      estado: 'ACTIVO',
    };

    const updatedList = [nuevoUsuario, ...usuarios];
    setUsuarios(updatedList);
    saveUsuariosSistema(updatedList);
    setUsuarioCreado(nuevoUsuario);

    agregarNotificacion({
      titulo: `👤 Nuevo Usuario Creado: ${nuevoUsuario.nombres} ${nuevoUsuario.apellidos}`,
      mensaje: `Se asignaron credenciales institucionales y rol [${nuevoUsuario.rol}] al documento ${nuevoUsuario.documento}.`,
      tipo: 'SISTEMA',
      rolesDestino: ['ADMINISTRADOR'],
      accionUrl: '/dashboard/usuarios',
    });

    // Reset Formulario y abrir Modal de Éxito
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

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.documento.includes(busqueda) ||
      `${u.nombres} ${u.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-brand-dark">Usuarios del Sistema y Credenciales</h1>
          <p className="text-xs text-brand-text/70 mt-1">
            Registro de operadores internos con autenticación, validación de formatos y asignación de roles RBAC.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Registrar Usuario Interno
        </button>
      </div>

      {/* Alerta de Éxito */}
      {alertaExito && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-3 animate-slide-down shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{alertaExito}</span>
        </div>
      )}

      {/* Barra de Búsqueda */}
      <div className="bg-white p-3.5 rounded-2xl border border-brand-accent/40 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-brand-text/50" />
        <input
          type="text"
          placeholder="Buscar por cédula, nombre, correo institucional o rol..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full text-xs outline-none bg-transparent font-medium"
        />
      </div>

      {/* Tabla de Usuarios del Sistema */}
      <div className="bg-white rounded-3xl border border-brand-accent/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-secondary/70 border-b border-brand-accent/30 text-brand-dark font-bold">
              <tr>
                <th className="p-4">Cédula / Documento (Máx 12)</th>
                <th className="p-4">Operador / Nombre Completo</th>
                <th className="p-4">Correo Institucional</th>
                <th className="p-4">Rol Asignado (RBAC)</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/20">
              {usuariosFiltrados.map((user) => (
                <tr key={user.id} className="hover:bg-brand-light/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-brand-dark">{user.documento}</td>
                  <td className="p-4 font-semibold text-brand-dark">
                    {user.nombres} {user.apellidos}
                  </td>
                  <td className="p-4 text-brand-text/80 font-mono text-[11px]">{user.correo}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        user.rol === 'ADMINISTRADOR'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : user.rol === 'GESTOR_PERSONAL'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {user.rol}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {user.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRO DE USUARIO CON CREDENCIALES Y REGLAS ESTRICTAS */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-brand-accent/40 animate-slide-down relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 mb-4 border-b border-brand-accent/30 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-secondary text-brand-primary">
                  <UserCog className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-brand-dark">
                    Crear Usuario con Credenciales
                  </h3>
                  <p className="text-xs text-brand-text/70">
                    Nombres/Apellidos (solo letras), Cédula (máx 12), Celular (máx 10)
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleCrearUsuario} className="space-y-3.5 overflow-y-auto pr-1 flex-1 min-h-0">
              {/* Nombres y Apellidos estrictamente solo letras */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-brand-text">
                      Nombres * <span className="text-gray-400 font-normal">(Solo letras)</span>
                    </label>
                    <span className="text-[10px] font-mono text-brand-primary">{nombres.length}/50</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={handleNombresChange}
                    placeholder="Ej. Roberto Carlos"
                    maxLength={50}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      errores.nombres ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                    }`}
                  />
                  {errores.nombres && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.nombres}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-brand-text">
                      Apellidos * <span className="text-gray-400 font-normal">(Solo letras)</span>
                    </label>
                    <span className="text-[10px] font-mono text-brand-primary">{apellidos.length}/50</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={apellidos}
                    onChange={handleApellidosChange}
                    placeholder="Ej. Gómez Pérez"
                    maxLength={50}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      errores.apellidos ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                    }`}
                  />
                  {errores.apellidos && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.apellidos}</p>}
                </div>
              </div>

              {/* Cédula con tope de 12 dígitos */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-brand-text">
                    Cédula de Ciudadanía (CC) * <span className="text-gray-400 font-normal">(Máximo 12 dígitos)</span>
                  </label>
                  <span className="text-[10px] font-mono text-brand-primary">{doc.length}/12</span>
                </div>
                <input
                  type="text"
                  required
                  value={doc}
                  onChange={handleDocChange}
                  placeholder="Ej. 1020304050"
                  maxLength={12}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 ${
                    errores.doc ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                  }`}
                />
                {errores.doc && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.doc}</p>}
              </div>

              {/* Correo y Celular */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-brand-text">Correo Institucional *</label>
                    <span className="text-[10px] font-mono text-brand-primary">{correo.length}/100</span>
                  </div>
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={handleCorreoChange}
                    placeholder="nombre@laboratorioxyz.com"
                    maxLength={100}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      errores.correo ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                    }`}
                  />
                  {errores.correo && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.correo}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-brand-text">
                      Celular * <span className="text-gray-400 font-normal">(10 dígitos)</span>
                    </label>
                    <span className="text-[10px] font-mono text-brand-primary">{telefono.length}/10</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={telefono}
                    onChange={handleTelefonoChange}
                    placeholder="3001234567"
                    maxLength={10}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 ${
                      errores.telefono ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                    }`}
                  />
                  {errores.telefono && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.telefono}</p>}
                </div>
              </div>

              {/* Rol Asignado */}
              <div>
                <label className="block text-[11px] font-bold text-brand-text mb-1">Rol en el Sistema (RBAC) *</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RolUsuario)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Control total del sistema)</option>
                  <option value="GESTOR_PERSONAL">GESTOR_PERSONAL (Personal, Carga CSV y Carnets)</option>
                  <option value="SUPERVISOR_ACCESOS">SUPERVISOR_ACCESOS (Historial, Bitácora y Socio)</option>
                </select>
              </div>

              {/* Contraseñas de Acceso */}
              <div className="p-3.5 bg-brand-light rounded-2xl border border-brand-accent/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark">
                  <KeyRound className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Credenciales de Acceso al Portal</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-brand-text">Contraseña (Mín 6 car.) *</label>
                      <span className="text-[9px] font-mono text-brand-primary">{password.length}/50</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      maxLength={50}
                      className={`w-full px-3 py-2 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 ${
                        errores.password ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                      }`}
                    />
                    {errores.password && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.password}</p>}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-brand-text">Confirmar Contraseña *</label>
                      <span className="text-[9px] font-mono text-brand-primary">{confirmPassword.length}/50</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      maxLength={50}
                      className={`w-full px-3 py-2 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 ${
                        errores.confirmPassword ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                      }`}
                    />
                    {errores.confirmPassword && <p className="text-[10px] text-red-600 font-semibold mt-1">{errores.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-accent/30">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Crear y Activar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dinámico de Registro Exitoso con Estilo y Animación */}
      {showExitoModal && usuarioCreado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-accent/40 relative overflow-hidden transform animate-scale-up">
            {/* Elementos visuales decorativos */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-brand-light rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-accent/30 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 text-center">
              {/* Icono con halo luminoso */}
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent/80 flex items-center justify-center shadow-lg shadow-brand-primary/30 text-white mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light border border-brand-accent/60 text-brand-dark text-[11px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-spin" />
                USUARIO CREADO CON ÉXITO
              </div>

              <h2 className="text-xl font-heading font-extrabold text-brand-dark mb-1">
                ¡Credenciales Asignadas!
              </h2>
              <p className="text-xs text-brand-text/75 mb-5">
                El usuario interno ya cuenta con autorización para autenticarse en el portal institucional de <strong className="text-brand-dark font-semibold">Laboratorio XYZ</strong>.
              </p>

              {/* Ficha Resumen del Usuario */}
              <div className="bg-brand-secondary/70 p-4 rounded-2xl border border-brand-accent/50 text-left space-y-2 mb-6">
                <div className="flex items-center justify-between pb-2 border-b border-brand-accent/30">
                  <span className="text-[11px] font-medium text-brand-text/70">Operador:</span>
                  <span className="text-xs font-bold text-brand-dark">{usuarioCreado.nombres} {usuarioCreado.apellidos}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-brand-accent/30">
                  <span className="text-[11px] font-medium text-brand-text/70">Documento / Cédula:</span>
                  <span className="text-xs font-mono font-bold text-brand-primary">{usuarioCreado.documento}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-brand-accent/30">
                  <span className="text-[11px] font-medium text-brand-text/70">Correo Institucional:</span>
                  <span className="text-xs font-medium text-brand-dark">{usuarioCreado.correo}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-brand-accent/30">
                  <span className="text-[11px] font-medium text-brand-text/70">Rol de Seguridad:</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                    {usuarioCreado.rol}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-brand-text/70">Estado de la Cuenta:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A9B8E]/15 text-[#2E6F64]">
                    <ShieldCheck className="w-3 h-3" />
                    ACTIVO
                  </span>
                </div>
              </div>

              {/* Botón de Aceptar con micro-interacción */}
              <button
                type="button"
                onClick={() => {
                  setShowExitoModal(false);
                  setUsuarioCreado(null);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
