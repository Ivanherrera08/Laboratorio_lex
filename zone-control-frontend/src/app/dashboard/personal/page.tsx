'use client';

import React, { useState } from 'react';
import { Empleado, EstadoEmpleado } from '@/types';
import {
  Users,
  Search,
  Plus,
  Filter,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  CreditCard,
} from 'lucide-react';

const mockEmpleados: Empleado[] = [
  {
    id: 1,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    tipoDocumento: 'CC',
    numeroDocumento: '1012345678',
    nombres: 'Carlos Andrés',
    apellidos: 'Mendoza Pérez',
    correo: 'carlos.mendoza@laboratorioxyz.com',
    telefono: '+57 310 998 8776',
    codigoTarjetaRfid: 'RFID-001',
    estado: 'ACTIVO',
  },
  {
    id: 2,
    departamentoId: 2,
    departamentoNombre: 'Control de Calidad',
    tipoDocumento: 'CC',
    numeroDocumento: '1087654321',
    nombres: 'Laura Sofía',
    apellidos: 'Restrepo Villa',
    correo: 'laura.restrepo@laboratorioxyz.com',
    telefono: '+57 320 112 3344',
    codigoTarjetaRfid: 'RFID-002',
    estado: 'REVOCADO',
    motivoCambioEstado: 'Finalización de contrato temporal y auditoría de seguridad.',
  },
  {
    id: 3,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    tipoDocumento: 'CE',
    numeroDocumento: '98765432',
    nombres: 'Guillermo',
    apellidos: 'Von Hassen',
    correo: 'guillermo.von@laboratorioxyz.com',
    telefono: '+57 315 443 2211',
    codigoTarjetaRfid: 'RFID-003',
    estado: 'SUSPENDIDO',
    motivoCambioEstado: 'Incumplimiento de protocolo de esterilidad en esclusa.',
  },
];

export default function GestionPersonalPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>(mockEmpleados);
  const [busqueda, setBusqueda] = useState('');
  const [deptoFiltro, setDeptoFiltro] = useState('TODOS');

  // Modales
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);

  // Formulario de Registro de Nuevo Empleado
  const [nuevoDoc, setNuevoDoc] = useState('');
  const [nuevoTipoDoc, setNuevoTipoDoc] = useState('CC');
  const [nuevosNombres, setNuevosNombres] = useState('');
  const [nuevosApellidos, setNuevosApellidos] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoDepto, setNuevoDepto] = useState('Producción y Síntesis');
  const [nuevoRfid, setNuevoRfid] = useState('');

  // Formulario de estado
  const [nuevoEstado, setNuevoEstado] = useState<EstadoEmpleado>('ACTIVO');
  const [motivoEstado, setMotivoEstado] = useState('');

  const empleadosFiltrados = empleados.filter((emp) => {
    const coincideTexto =
      emp.numeroDocumento.includes(busqueda) ||
      `${emp.nombres} ${emp.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.correo.toLowerCase().includes(busqueda.toLowerCase());

    const coincideDepto = deptoFiltro === 'TODOS' || emp.departamentoNombre === deptoFiltro;

    return coincideTexto && coincideDepto;
  });

  const handleRegistrarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevoDoc || !nuevosNombres || !nuevosApellidos || !nuevoCorreo) {
      alert('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    const existe = empleados.some((emp) => emp.numeroDocumento === nuevoDoc);
    if (existe) {
      alert('Error: Ya existe un empleado registrado con este número de documento.');
      return;
    }

    const nuevo: Empleado = {
      id: Date.now(),
      departamentoId: nuevoDepto === 'Producción y Síntesis' ? 1 : nuevoDepto === 'Control de Calidad' ? 2 : 3,
      departamentoNombre: nuevoDepto,
      tipoDocumento: nuevoTipoDoc,
      numeroDocumento: nuevoDoc,
      nombres: nuevosNombres,
      apellidos: nuevosApellidos,
      correo: nuevoCorreo,
      telefono: nuevoTelefono || '+57 300 000 0000',
      codigoTarjetaRfid: nuevoRfid.trim() ? nuevoRfid.trim() : `RFID-${Math.floor(100 + Math.random() * 900)}`,
      estado: 'ACTIVO',
    };

    setEmpleados([nuevo, ...empleados]);
    alert(`¡Empleado ${nuevo.nombres} ${nuevo.apellidos} registrado exitosamente con credencial ${nuevo.codigoTarjetaRfid}!`);

    // Limpiar formulario y cerrar modal
    setNuevoDoc('');
    setNuevosNombres('');
    setNuevosApellidos('');
    setNuevoCorreo('');
    setNuevoTelefono('');
    setNuevoRfid('');
    setShowRegistrarModal(false);
  };

  const handleAbrirCambioEstado = (emp: Empleado) => {
    setEmpleadoSeleccionado(emp);
    setNuevoEstado(emp.estado);
    setMotivoEstado(emp.motivoCambioEstado || '');
    setShowEstadoModal(true);
  };

  const handleGuardarEstado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleadoSeleccionado) return;

    if ((nuevoEstado === 'REVOCADO' || nuevoEstado === 'SUSPENDIDO') && !motivoEstado.trim()) {
      alert('Es obligatorio ingresar el motivo técnico/administrativo del cambio de estado.');
      return;
    }

    setEmpleados((prev) =>
      prev.map((emp) =>
        emp.id === empleadoSeleccionado.id
          ? { ...emp, estado: nuevoEstado, motivoCambioEstado: motivoEstado }
          : emp
      )
    );

    alert(`Estado de ${empleadoSeleccionado.nombres} actualizado a ${nuevoEstado} y registrado en auditoría.`);
    setShowEstadoModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-brand-dark">Gestión del Personal Autorizado</h1>
          <p className="text-xs text-brand-text/70 mt-1">
            Administración de empleados, asignación de biometría y control de estados (RF F-11 a F-17).
          </p>
        </div>

        <button
          onClick={() => setShowRegistrarModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Empleado
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-brand-accent/40 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-text/50 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por documento, nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-accent/60 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brand-primary" />
          <select
            value={deptoFiltro}
            onChange={(e) => setDeptoFiltro(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-accent/60 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          >
            <option value="TODOS">Todos los Departamentos</option>
            <option value="Producción y Síntesis">Producción y Síntesis</option>
            <option value="Control de Calidad">Control de Calidad</option>
            <option value="Bioseguridad y Mantenimiento">Bioseguridad y Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-2xl border border-brand-accent/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-secondary/70 border-b border-brand-accent/30 text-brand-dark font-bold">
              <tr>
                <th className="p-4">Documento / Tipo</th>
                <th className="p-4">Nombres y Apellidos</th>
                <th className="p-4">Departamento</th>
                <th className="p-4">Credencial RFID</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/20">
              {empleadosFiltrados.map((emp) => (
                <tr key={emp.id} className="hover:bg-brand-light/60 transition-colors">
                  <td className="p-4 font-semibold text-brand-dark">
                    {emp.numeroDocumento}{' '}
                    <span className="text-[10px] text-gray-500 font-normal">({emp.tipoDocumento})</span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-brand-dark">{emp.nombres} {emp.apellidos}</p>
                    <p className="text-[11px] text-brand-text/60">{emp.correo}</p>
                  </td>
                  <td className="p-4 font-medium text-brand-text">{emp.departamentoNombre}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md bg-brand-secondary font-mono text-[11px] text-brand-primary font-bold border border-brand-accent/40">
                      {emp.codigoTarjetaRfid || 'SIN_VINCULAR'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        emp.estado === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : emp.estado === 'REVOCADO'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {emp.estado === 'ACTIVO' && <CheckCircle className="w-3 h-3" />}
                      {emp.estado === 'REVOCADO' && <XCircle className="w-3 h-3" />}
                      {emp.estado === 'SUSPENDIDO' && <Clock className="w-3 h-3" />}
                      {emp.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleAbrirCambioEstado(emp)}
                      className="px-3 py-1.5 rounded-lg bg-brand-secondary hover:bg-brand-accent/30 text-brand-dark font-semibold text-[11px] transition-all cursor-pointer"
                    >
                      Cambiar Estado / Permisos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTRAR NUEVO EMPLEADO */}
      {showRegistrarModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-brand-accent/40">
            <div className="flex items-center gap-3 mb-5 border-b border-brand-accent/30 pb-3">
              <div className="p-2.5 rounded-xl bg-brand-secondary text-brand-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-heading font-bold text-brand-dark">Registrar Nuevo Empleado Autorizado</h3>
                <p className="text-xs text-brand-text/70">Padrón de control de acceso físico — Laboratorio XYZ</p>
              </div>
            </div>

            <form onSubmit={handleRegistrarEmpleado} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Tipo Doc.</label>
                  <select
                    value={nuevoTipoDoc}
                    onChange={(e) => setNuevoTipoDoc(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-brand-accent/60 text-xs bg-white font-medium"
                  >
                    <option value="CC">CC (Cédula)</option>
                    <option value="CE">CE (Extranjería)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Número de Documento *</label>
                  <input
                    type="text"
                    required
                    value={nuevoDoc}
                    onChange={(e) => setNuevoDoc(e.target.value)}
                    placeholder="Ej. 1020304050"
                    className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={nuevosNombres}
                    onChange={(e) => setNuevosNombres(e.target.value)}
                    placeholder="Ej. Roberto"
                    className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={nuevosApellidos}
                    onChange={(e) => setNuevosApellidos(e.target.value)}
                    placeholder="Ej. Gómez"
                    className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Correo Institucional *</label>
                  <input
                    type="email"
                    required
                    value={nuevoCorreo}
                    onChange={(e) => setNuevoCorreo(e.target.value)}
                    placeholder="r.gomez@laboratorioxyz.com"
                    className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Departamento</label>
                  <select
                    value={nuevoDepto}
                    onChange={(e) => setNuevoDepto(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs bg-white"
                  >
                    <option value="Producción y Síntesis">Producción y Síntesis</option>
                    <option value="Control de Calidad">Control de Calidad</option>
                    <option value="Bioseguridad y Mantenimiento">Bioseguridad y Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Código RFID / Chip (Opcional)</label>
                  <input
                    type="text"
                    value={nuevoRfid}
                    onChange={(e) => setNuevoRfid(e.target.value)}
                    placeholder="Ej. RFID-990"
                    className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-accent/30">
                <button
                  type="button"
                  onClick={() => setShowRegistrarModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm cursor-pointer"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CAMBIO DE ESTADO OBLIGATORIO CON MOTIVO */}
      {showEstadoModal && empleadoSeleccionado && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-brand-accent/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-brand-secondary text-brand-primary">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-heading font-bold text-brand-dark">
                  Modificar Estado de {empleadoSeleccionado.nombres}
                </h3>
                <p className="text-xs text-brand-text/70">Documento: {empleadoSeleccionado.numeroDocumento}</p>
              </div>
            </div>

            <form onSubmit={handleGuardarEstado} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5">Nuevo Estado</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as EstadoEmpleado)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  <option value="ACTIVO">ACTIVO (Autorización Vigente)</option>
                  <option value="SUSPENDIDO">SUSPENDIDO (Temporal)</option>
                  <option value="REVOCADO">REVOCADO (Acceso Bloqueado Definitivo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5">
                  Motivo de Cambio de Estado <span className="text-red-500">* (Obligatorio)</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoEstado}
                  onChange={(e) => setMotivoEstado(e.target.value)}
                  placeholder="Describa la justificación médica, de seguridad o auditoría..."
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-accent/60 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEstadoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm cursor-pointer"
                >
                  Guardar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
