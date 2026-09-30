'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/context/NotificationContext';
import {
  ShieldCheck,
  Search,
  FileText,
  Clock,
  User,
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Lock,
  Download,
  ArrowRight,
  Star,
  Save
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface RegistroAuditoriaHumano {
  id: string;
  evento: string;
  modulo: string;
  responsable: string;
  rolResponsable: string;
  ip: string;
  tipoAccion: 'MODIFICACION_ESTADO' | 'AUTORIZACION_ZONA' | 'SEGURIDAD_ACCESO' | 'CREACION_EMPLEADO' | 'CARGA_MASIVA';
  timestamp: string;
  justificacionNormativa: string;
  detalleDocumentado: {
    sujetoAfectado: string;
    areaInvolucrada?: string;
    condicionPrevia: string;
    condicionNueva: string;
    normaCumplida: string;
    observacionesTecnicas: string;
  };
}

const mockBitacoraFormal: RegistroAuditoriaHumano[] = [
  {
    id: 'AUD-2026-0091',
    evento: 'Revocación Inmediata de Acceso a Sala Estéril A',
    modulo: 'Gestión de Personal / Zonas Bioseguras',
    responsable: 'Dr. Roberto Gómez',
    rolResponsable: 'ADMINISTRADOR DE SEGURIDAD',
    ip: '192.168.10.45 (Red Interna Laboratorio)',
    tipoAccion: 'MODIFICACION_ESTADO',
    timestamp: '2026-09-16T08:10:00Z',
    justificacionNormativa: 'Protocolo de Contención Biológica y Control de Contaminación Cruzada (FDA 21 CFR 211.113).',
    detalleDocumentado: {
      sujetoAfectado: 'Ing. Laura Sofía Restrepo Villa (Doc: 1087654321)',
      areaInvolucrada: 'Laboratorio de Síntesis Molecular (Área A)',
      condicionPrevia: 'Estado ACTIVO con autorización plena en esclusas de presión negativa.',
      condicionNueva: 'Estado INACTIVO con bloqueo en torniquetes y credencial RFID-002 inhabilitada.',
      normaCumplida: 'ISO 14644-1 (Salas Limpias) e Informe 32 OMS sobre Buenas Prácticas de Manufactura (BPM).',
      observacionesTecnicas: 'Se detectó apertura indebida de puerta de esclusa sin completar ciclo de despresurización de 30 segundos. Se genera orden de reentrenamiento de bioseguridad.',
    },
  },
  {
    id: 'AUD-2026-0090',
    evento: 'Asignación de Credencial RFID y Permiso a Liofilización',
    modulo: 'Catálogos y Asignación de Credenciales',
    responsable: 'María Fernanda Londoño',
    rolResponsable: 'GESTOR DE PERSONAL',
    ip: '192.168.10.60 (Estación de Control Humano)',
    tipoAccion: 'AUTORIZACION_ZONA',
    timestamp: '2026-09-16T07:45:12Z',
    justificacionNormativa: 'Incorporación formal de especialista con certificación de asepsia vigente.',
    detalleDocumentado: {
      sujetoAfectado: 'Dr. Carlos Andrés Mendoza Pérez (Doc: 1012345678)',
      areaInvolucrada: 'Sala Limpia de Liofilización (Zona B - Nivel de Riesgo ALTO)',
      condicionPrevia: 'Sin credencial física asignada.',
      condicionNueva: 'Credencial RFID-001 vinculada con vigencia permanente hasta revisión semestral.',
      normaCumplida: 'Anexo 1 GMP Europeo (Fabricación de Medicamentos Estériles).',
      observacionesTecnicas: 'Verificación satisfactoria de carné de vacunación y pruebas microbiológicas de ingreso.',
    },
  },
  {
    id: 'AUD-2026-0089',
    evento: 'Alerta de Seguridad: Múltiples Intentos Fallidos en Portal',
    modulo: 'Seguridad Perimetral y Autenticación',
    responsable: 'Sistema de Defensa Automatizado Zone Control',
    rolResponsable: 'MONITOR AUTÓNOMO DE INTEGRIDAD',
    ip: '190.24.110.12 (Acceso Externo No Autorizado)',
    tipoAccion: 'SEGURIDAD_ACCESO',
    timestamp: '2026-09-16T06:30:15Z',
    justificacionNormativa: 'Protección contra ataques de fuerza bruta y acceso no autorizado (ISO/IEC 27001 / NIST SP 800-63B).',
    detalleDocumentado: {
      sujetoAfectado: 'Cuenta de acceso: auditor_investigacion',
      areaInvolucrada: 'Módulo Central de Consultas y Reportes',
      condicionPrevia: 'Cuenta habilitada para consulta de auditorías externas.',
      condicionNueva: 'Cuenta BLOQUEADA preventivamente tras 3 intentos fallidos con contraseña errónea.',
      normaCumplida: 'FDA 21 CFR Part 11.300 (Controles para Códigos de Identificación y Contraseñas).',
      observacionesTecnicas: 'Se notificó por correo cifrado al oficial de seguridad de la información para validación de identidad antes de reactivar.',
    },
  },
  {
    id: 'AUD-2026-0088',
    evento: 'Ejecución de Carga Masiva de Personal por Lote CSV',
    modulo: 'Ingesta Masiva de Datos',
    responsable: 'María Fernanda Londoño',
    rolResponsable: 'GESTOR DE PERSONAL',
    ip: '192.168.10.60 (Estación de RRHH)',
    tipoAccion: 'CARGA_MASIVA',
    timestamp: '2026-09-15T16:20:00Z',
    justificacionNormativa: 'Actualización masiva mensual de plantilla técnica de producción.',
    detalleDocumentado: {
      sujetoAfectado: 'Lote de 48 registros de personal',
      areaInvolucrada: 'Departamentos de Producción, Calidad y Mantenimiento',
      condicionPrevia: 'Archivo plano recibido por canal interno firmado.',
      condicionNueva: '45 registros procesados con éxito; 3 registros rechazados por duplicidad e inconsistencia en código de área.',
      normaCumplida: 'Principio ALCOA+ de Integridad de Datos Farmacéuticos (Exactitud y Trazabilidad).',
      observacionesTecnicas: 'Se generó informe de rechazo descargable con las filas específicas para corrección por el área solicitante.',
    },
  },
];

export default function BitacoraAuditoriaPage() {
  const { notificaciones } = useNotifications();
  
  // Estado para las evaluaciones de rendimiento persistidas localmente
  const [evaluaciones, setEvaluaciones] = useState<Record<string, { subject: string, score: number }[]>>({});
  const [isEditingEval, setIsEditingEval] = useState(false);
  const [tempEval, setTempEval] = useState<{subject: string, score: number}[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bitacora_evaluaciones');
      if (saved) {
        try {
          setEvaluaciones(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const saveEvaluacion = (id: string) => {
    const updated = { ...evaluaciones, [id]: tempEval };
    setEvaluaciones(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bitacora_evaluaciones', JSON.stringify(updated));
    }
    setIsEditingEval(false);
  };

  const handleStartEval = (id: string) => {
    if (evaluaciones[id]) {
      setTempEval(evaluaciones[id]);
    } else {
      setTempEval([
        { subject: 'Bioseguridad', score: 85 },
        { subject: 'Eficiencia', score: 90 },
        { subject: 'Calidad', score: 80 },
        { subject: 'Protocolo', score: 95 },
        { subject: 'T. Equipo', score: 88 }
      ]);
    }
    setIsEditingEval(true);
  };
  
  // Transformar las notificaciones globales en registros de bitácora
  const logsDinamicos: RegistroAuditoriaHumano[] = notificaciones
    .filter((n) => n.tipo === 'AUDITORIA' || n.detallesAuditoria)
    .map((n) => {
      let motivoExtraido = n.mensaje;
      
      const vAnterior = n.detallesAuditoria?.valorAnterior || n.valorAnterior || 'N/A';
      const vNuevoRaw = n.detallesAuditoria?.valorNuevo || n.valorNuevo || 'N/A';
      
      let estadoAnterior = vAnterior;
      let estadoNuevo = vNuevoRaw;

      try {
        if (vNuevoRaw.includes('{')) {
          const parsedNuevo = JSON.parse(vNuevoRaw);
          if (parsedNuevo.motivo) motivoExtraido = parsedNuevo.motivo;
          if (parsedNuevo.estado) estadoNuevo = parsedNuevo.estado;
        }
        if (vAnterior.includes('{')) {
          const parsedAnterior = JSON.parse(vAnterior);
          if (parsedAnterior.estado) estadoAnterior = parsedAnterior.estado;
        }
      } catch (e) {
        // Ignorar error de parseo
      }

      return {
        id: `AUD-${n.id.replace('NOTIF-', '').toUpperCase()}`,
        evento: n.detallesAuditoria?.evento || n.titulo,
        modulo: n.detallesAuditoria?.modulo || n.entidadAuditoria || 'Gestión General',
        responsable: n.detallesAuditoria?.usuarioResponsable || 'Operador Actual',
        rolResponsable: n.detallesAuditoria?.usuarioRol || 'SISTEMA',
        ip: n.detallesAuditoria?.direccionIp || '127.0.0.1 (Local)',
        tipoAccion: (n.detallesAuditoria?.operacion || n.accionAuditoria || 'SEGURIDAD_ACCESO') as "MODIFICACION_ESTADO" | "AUTORIZACION_ZONA" | "SEGURIDAD_ACCESO" | "CREACION_EMPLEADO" | "CARGA_MASIVA",
        timestamp: n.fechaHoraIso || new Date().toISOString(),
        justificacionNormativa: 'Registro Automático del Sistema de Trazabilidad',
        detalleDocumentado: {
          sujetoAfectado: n.detallesAuditoria?.entidadInvolucrada || `Referencia: ${n.codigoRef || 'N/A'}`,
          condicionPrevia: `Estado Anterior: ${estadoAnterior}`,
          condicionNueva: `Nuevo Estado: ${estadoNuevo}`,
          normaCumplida: 'Registro en Cumplimiento (ALCOA+)',
          observacionesTecnicas: motivoExtraido,
        },
      };
    });

  const todosLosLogs = [...logsDinamicos, ...mockBitacoraFormal];

  const [busqueda, setBusqueda] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('TODOS');
  
  // Filtros Avanzados
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [busquedaLugar, setBusquedaLugar] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [logSeleccionado, setLogSeleccionado] = useState<RegistroAuditoriaHumano>(todosLosLogs[0] || mockBitacoraFormal[0]);

  // Actualizar el log seleccionado si los logs dinámicos cambian
  useEffect(() => {
    if (logsDinamicos.length > 0 && !logsDinamicos.find(l => l.id === logSeleccionado?.id) && !mockBitacoraFormal.find(l => l.id === logSeleccionado?.id)) {
      setLogSeleccionado(todosLosLogs[0]);
    }
    setIsEditingEval(false);
  }, [notificaciones, logSeleccionado?.id]);

  const modulosUnicos = Array.from(new Set(todosLosLogs.map(l => l.modulo)));

  const logsFiltrados = todosLosLogs.filter((l) => {
    const searchableText = [
      l.evento,
      l.modulo,
      l.responsable,
      l.rolResponsable,
      l.id,
      l.justificacionNormativa,
      l.detalleDocumentado.sujetoAfectado,
      l.detalleDocumentado.areaInvolucrada,
      l.detalleDocumentado.condicionPrevia,
      l.detalleDocumentado.condicionNueva,
      l.detalleDocumentado.normaCumplida,
      l.detalleDocumentado.observacionesTecnicas,
      "marco legal y normativo"
    ].join(' ').toLowerCase();

    const cumpleBusqueda = !busqueda || searchableText.includes(busqueda.toLowerCase());
    
    const cumpleModulo = filtroModulo === 'TODOS' || l.modulo === filtroModulo;
    
    const cumpleNombre = !busquedaNombre || 
      l.responsable.toLowerCase().includes(busquedaNombre.toLowerCase()) || 
      l.detalleDocumentado.sujetoAfectado.toLowerCase().includes(busquedaNombre.toLowerCase());
      
    const cumpleLugar = !busquedaLugar || 
      l.modulo.toLowerCase().includes(busquedaLugar.toLowerCase()) ||
      l.detalleDocumentado.observacionesTecnicas.toLowerCase().includes(busquedaLugar.toLowerCase());
      
    let cumpleFecha = true;
    if (fechaInicio || fechaFin) {
      const logDate = new Date(l.timestamp);
      if (fechaInicio && logDate < new Date(fechaInicio + 'T00:00:00')) cumpleFecha = false;
      if (fechaFin && logDate > new Date(fechaFin + 'T23:59:59')) cumpleFecha = false;
    }
    
    return cumpleBusqueda && cumpleModulo && cumpleNombre && cumpleLugar && cumpleFecha;
  });

  const handleImprimirActa = () => {
    window.print();
  };

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
          <h1 className="text-2xl font-heading font-extrabold text-slate-800">Bitácora Oficial de Auditoría Farmacéutica</h1>
          <p className="text-xs text-slate-500/70 mt-1">
            Registro documental y trazabilidad de eventos críticos bajo estándares FDA 21 CFR Part 11 e ISO/IEC 27001.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-600 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          Registros Inmutables Auditados
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* Lista de Eventos Documentados */}
        <div className="lg:col-span-6 space-y-3 print:hidden">
          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/40 shadow-xs flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-emerald-100">
                <Search className="w-4 h-4 text-slate-500/50" />
                <input
                  type="text"
                  placeholder="Buscar por ID, evento, módulo o responsable..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full text-xs outline-none bg-transparent font-medium"
                />
              </div>
              <button 
                onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  showFiltrosAvanzados 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-slate-50 text-slate-600 border-emerald-100 hover:bg-emerald-50'
                }`}
              >
                Filtros
              </button>
            </div>

            {/* Filtros Avanzados Expandibles */}
            <AnimatePresence>
              {showFiltrosAvanzados && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-100 mt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nombre o Responsable</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez..."
                        value={busquedaNombre}
                        onChange={(e) => setBusquedaNombre(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-emerald-100 rounded-xl px-3 py-2 outline-none font-medium focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Laboratorio o Lugar</label>
                      <select
                        value={filtroModulo}
                        onChange={(e) => setFiltroModulo(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-emerald-100 rounded-xl px-3 py-2 outline-none font-medium text-slate-600"
                      >
                        <option value="TODOS">Todas las áreas</option>
                        {modulosUnicos.map(mod => (
                          <option key={mod} value={mod}>{mod}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Desde Fecha</label>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-emerald-100 rounded-xl px-3 py-2 outline-none font-medium text-slate-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Hasta Fecha</label>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-emerald-100 rounded-xl px-3 py-2 outline-none font-medium text-slate-600"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            <AnimatePresence>
              {logsFiltrados.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  onClick={() => setLogSeleccionado(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    logSeleccionado?.id === item.id
                      ? 'bg-emerald-50/90 border-emerald-600 shadow-sm ring-1 ring-emerald-600/30'
                      : 'bg-white border-emerald-200/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-emerald-600 bg-white px-2 py-0.5 rounded-md border border-emerald-200/40 shadow-sm">
                      {item.id}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-sm text-slate-800 mb-1 leading-snug">
                    {item.evento}
                  </h4>

                  <p className="text-[11px] text-slate-500/70 mb-2">
                    <strong>Módulo:</strong> {item.modulo}
                  </p>

                  <div className="flex items-center justify-between text-[11px] border-t border-emerald-200/20 pt-2 text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-600" />
                      {item.responsable}
                    </span>
                    <span className="font-bold text-[10px] text-emerald-600 uppercase">
                      {item.rolResponsable}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Panel de Documentación Detallada del Evento */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-emerald-200/40 shadow-xs flex flex-col space-y-5 print:w-full print:block print:p-0 print:border-none print:shadow-none print:m-0 print:bg-transparent">
          <div className="border-b border-emerald-200/30 pb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/40">
                  Acta de Auditoría #{logSeleccionado.id}
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200 shadow-sm print:hidden">
                  ✓ Registro Validado
                </span>
              </div>
              <button
                onClick={handleImprimirActa}
                className="print:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar Acta (PDF)
              </button>
            </div>
            <h3 className="font-heading font-extrabold text-lg text-slate-800 mt-2">
              {logSeleccionado.evento}
            </h3>
            <p className="text-xs text-slate-500/70 mt-1">
              <strong>Fecha y Hora Oficial:</strong> {new Date(logSeleccionado.timestamp).toUTCString()} ({logSeleccionado.ip})
            </p>
          </div>

          {/* Justificación y Norma */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-emerald-200/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Marco Legal y Normativo de la Acción</span>
            </div>
            <p className="text-xs text-slate-500/80 leading-relaxed">
              {logSeleccionado.justificacionNormativa}
            </p>
            <span className="inline-block text-[11px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-200/40">
              Cumplimiento: {logSeleccionado.detalleDocumentado.normaCumplida}
            </span>
          </div>

          {/* Detalle Técnico de la Modificación */}
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-slate-800 block mb-1">Autor / Responsable de la Acción:</span>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 leading-none mb-1">
                      {logSeleccionado.responsable}
                    </p>
                    <p className="text-[10px] font-bold uppercase text-blue-600">
                      {logSeleccionado.rolResponsable}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <span className="font-bold text-slate-800 block mb-1">Sujeto / Personal Afectado:</span>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-lg text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <p className="font-medium text-slate-600 leading-snug">
                    {logSeleccionado.detalleDocumentado.sujetoAfectado}
                  </p>
                </div>
              </div>
            </div>

            {logSeleccionado.detalleDocumentado.areaInvolucrada && (
              <div>
                <span className="font-bold text-slate-800 block mb-1">Área o Zona Biosegura:</span>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 font-medium text-slate-500 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  {logSeleccionado.detalleDocumentado.areaInvolucrada}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="font-bold text-amber-900 block mb-1 text-[11px] uppercase tracking-wider">
                  Condición Previa
                </span>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  {logSeleccionado.detalleDocumentado.condicionPrevia}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1 text-[11px] uppercase tracking-wider">
                  Condición Nueva / Aplicada
                </span>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  {logSeleccionado.detalleDocumentado.condicionNueva}
                </p>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">Dictamen Técnico y Observaciones:</span>
              <div className="p-3 bg-white rounded-xl border border-emerald-200/50 text-slate-500 leading-relaxed">
                {logSeleccionado.detalleDocumentado.observacionesTecnicas}
              </div>
            </div>

            {/* Evaluación de Rendimiento */}
            <div className="mt-6 pt-5 border-t border-emerald-200/40">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Rendimiento / Desempeño del Involucrado
                </h4>
                {evaluaciones[logSeleccionado.id] && !isEditingEval && (
                  <button 
                    onClick={() => handleStartEval(logSeleccionado.id)}
                    className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/50 transition-colors"
                  >
                    Modificar Calificación
                  </button>
                )}
              </div>
              
              {isEditingEval ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-emerald-200/60 shadow-inner">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {tempEval.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>{item.subject}</span>
                          <span className="text-emerald-700">{item.score}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={item.score}
                          onChange={(e) => {
                            const newVals = [...tempEval];
                            newVals[idx].score = parseInt(e.target.value);
                            setTempEval(newVals);
                          }}
                          className="w-full accent-emerald-600"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setIsEditingEval(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => saveEvaluacion(logSeleccionado.id)}
                      className="px-4 py-2 flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Guardar Calificación
                    </button>
                  </div>
                </div>
              ) : evaluaciones[logSeleccionado.id] ? (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-[260px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={evaluaciones[logSeleccionado.id]} margin={{ top: 15, right: 15, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value}%`, 'Puntuación']}
                      />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1000}>
                        {evaluaciones[logSeleccionado.id].map((entry, index) => {
                          const colors = ['#16a34a', '#14b8a6', '#9333ea', '#ef4444', '#f97316'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-emerald-200 text-center space-y-4">
                  <div className="mx-auto w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Sin Calificación de Rendimiento</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Como administrador, puedes evaluar el desempeño de este operario en base a esta actuación.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleStartEval(logSeleccionado.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Calificar Rendimiento
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
