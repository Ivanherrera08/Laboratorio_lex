'use client';

import React, { useState } from 'react';
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
  ArrowRight,
} from 'lucide-react';

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
      areaInvolucrada: 'Laboratorio de Síntesis Molecular (Zona A - Nivel de Riesgo ALTO)',
      condicionPrevia: 'Estado ACTIVO con autorización plena en esclusas de presión negativa.',
      condicionNueva: 'Estado REVOCADO con bloqueo en torniquetes y credencial RFID-002 inhabilitada.',
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
  const [logs] = useState<RegistroAuditoriaHumano[]>(mockBitacoraFormal);
  const [busqueda, setBusqueda] = useState('');
  const [logSeleccionado, setLogSeleccionado] = useState<RegistroAuditoriaHumano>(mockBitacoraFormal[0]);

  const logsFiltrados = logs.filter(
    (l) =>
      l.evento.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.modulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.responsable.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.id.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-brand-dark">Bitácora Oficial de Auditoría Farmacéutica</h1>
          <p className="text-xs text-brand-text/70 mt-1">
            Registro documental y trazabilidad de eventos críticos bajo estándares FDA 21 CFR Part 11 e ISO/IEC 27001.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-secondary border border-brand-accent/60 text-brand-primary text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          Registros Inmutables Auditados
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Eventos Documentados */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-brand-accent/40 shadow-xs flex items-center gap-2.5">
            <Search className="w-4 h-4 text-brand-text/50" />
            <input
              type="text"
              placeholder="Buscar por ID, evento, módulo o responsable..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full text-xs outline-none bg-transparent font-medium"
            />
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {logsFiltrados.map((item) => (
              <div
                key={item.id}
                onClick={() => setLogSeleccionado(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  logSeleccionado?.id === item.id
                    ? 'bg-brand-secondary/90 border-brand-primary shadow-sm ring-1 ring-brand-primary/30'
                    : 'bg-white border-brand-accent/40 hover:bg-brand-light'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-brand-primary bg-white px-2 py-0.5 rounded-md border border-brand-accent/40">
                    {item.id}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brand-primary" />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-sm text-brand-dark mb-1 leading-snug">
                  {item.evento}
                </h4>

                <p className="text-[11px] text-brand-text/70 mb-2">
                  <strong>Módulo:</strong> {item.modulo}
                </p>

                <div className="flex items-center justify-between text-[11px] border-t border-brand-accent/20 pt-2 text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-brand-primary" />
                    {item.responsable}
                  </span>
                  <span className="font-bold text-[10px] text-brand-primary uppercase">
                    {item.rolResponsable}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de Documentación Detallada del Evento */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-brand-accent/40 shadow-xs flex flex-col space-y-5">
          <div className="border-b border-brand-accent/30 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-brand-primary bg-brand-secondary px-2.5 py-1 rounded-md">
                Acta de Auditoría #{logSeleccionado.id}
              </span>
              <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                ✓ Registro Validado
              </span>
            </div>
            <h3 className="font-heading font-extrabold text-lg text-brand-dark mt-2">
              {logSeleccionado.evento}
            </h3>
            <p className="text-xs text-brand-text/70 mt-1">
              <strong>Fecha y Hora Oficial:</strong> {new Date(logSeleccionado.timestamp).toUTCString()} ({logSeleccionado.ip})
            </p>
          </div>

          {/* Justificación y Norma */}
          <div className="p-4 bg-brand-light rounded-2xl border border-brand-accent/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-dark">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              <span>Marco Legal y Normativo de la Acción</span>
            </div>
            <p className="text-xs text-brand-text/80 leading-relaxed">
              {logSeleccionado.justificacionNormativa}
            </p>
            <span className="inline-block text-[11px] font-bold text-brand-primary bg-white px-2 py-0.5 rounded border border-brand-accent/40">
              Cumplimiento: {logSeleccionado.detalleDocumentado.normaCumplida}
            </span>
          </div>

          {/* Detalle Técnico de la Modificación */}
          <div className="space-y-3.5 text-xs">
            <div>
              <span className="font-bold text-brand-dark block mb-1">Sujeto / Personal Afectado:</span>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 font-medium text-brand-text">
                {logSeleccionado.detalleDocumentado.sujetoAfectado}
              </div>
            </div>

            {logSeleccionado.detalleDocumentado.areaInvolucrada && (
              <div>
                <span className="font-bold text-brand-dark block mb-1">Área o Zona Biosegura:</span>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 font-medium text-brand-text flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-brand-primary" />
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
              <span className="font-bold text-brand-dark block mb-1">Dictamen Técnico y Observaciones:</span>
              <div className="p-3 bg-white rounded-xl border border-brand-accent/50 text-brand-text leading-relaxed">
                {logSeleccionado.detalleDocumentado.observacionesTecnicas}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
