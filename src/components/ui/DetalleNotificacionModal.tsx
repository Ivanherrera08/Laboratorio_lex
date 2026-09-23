'use client';

import React from 'react';
import { NotificacionSistema } from '@/context/NotificationContext';
import {
  X,
  ShieldAlert,
  Users,
  Cpu,
  FileCheck,
  Calendar,
  Clock,
  User,
  ExternalLink,
  Layers,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DetalleNotificacionModalProps {
  notificacion: NotificacionSistema | null;
  onClose: () => void;
}

export default function DetalleNotificacionModal({
  notificacion,
  onClose,
}: DetalleNotificacionModalProps) {
  const router = useRouter();

  if (!notificacion) return null;

  const getTipoConfig = (tipo: NotificacionSistema['tipo']) => {
    switch (tipo) {
      case 'SEGURIDAD':
        return {
          icon: ShieldAlert,
          bg: 'bg-red-50 text-red-700 border-red-200',
          badgeBg: 'bg-red-100 text-red-800',
          iconColor: 'text-red-600',
          headerBg: 'bg-red-500',
          label: 'Alerta de Seguridad / Bioseguridad',
        };
      case 'PERSONAL':
        return {
          icon: Users,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          badgeBg: 'bg-blue-100 text-blue-800',
          iconColor: 'text-blue-600',
          headerBg: 'bg-blue-600',
          label: 'Gestión de Personal Farmacéutico',
        };
      case 'SISTEMA':
        return {
          icon: Cpu,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800',
          iconColor: 'text-amber-600',
          headerBg: 'bg-amber-500',
          label: 'Evento de Sistema y Sincronización',
        };
      case 'AUDITORIA':
        return {
          icon: FileCheck,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          iconColor: 'text-emerald-600',
          headerBg: 'bg-emerald-600',
          label: 'Bitácora Regulatoria GxP (21 CFR Part 11)',
        };
    }
  };

  const config = getTipoConfig(notificacion.tipo);
  const Icon = config.icon;
  const audit = notificacion.detallesAuditoria;

  const handleIrAlModulo = () => {
    onClose();
    if (notificacion.accionUrl) {
      router.push(notificacion.accionUrl);
    }
  };

  const renderJsonPretty = (val: string | null | undefined) => {
    if (!val) return <span className="text-slate-400 italic text-[11px]">Sin datos previos</span>;
    try {
      const obj = JSON.parse(val);
      return (
        <div className="space-y-1.5 mt-1">
          {Object.entries(obj).map(([k, v]) => (
            <div key={k} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-white border border-slate-100 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {k.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-[11px] font-semibold text-slate-800 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200 shadow-xs truncate max-w-full sm:max-w-[150px]">
                {String(v)}
              </span>
            </div>
          ))}
        </div>
      );
    } catch {
      return (
        <div className="p-2 rounded-lg bg-white border border-slate-100 text-[11px] font-medium text-slate-700 shadow-xs">
          {val}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-modal-pop flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${config.badgeBg}`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${config.bg}`}>
                  {config.label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {notificacion.id}
                </span>
              </div>
              <h3 className="text-base font-heading font-extrabold text-slate-800 mt-0.5 line-clamp-1">
                {notificacion.titulo}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Mensaje principal */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/40 text-sm text-slate-800 leading-relaxed">
            <p className="font-medium">{notificacion.mensaje}</p>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500 pt-2 border-t border-emerald-200/20">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                {notificacion.timestamp}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {new Date(notificacion.fechaHoraIso).toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Desglose de Bitácora / Auditoría */}
          {audit ? (
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wide">
                    Registro Formal de Auditoría GxP
                  </h4>
                </div>
                {audit.operacion && (
                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    {audit.operacion}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Módulo Afectado</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    {audit.modulo}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Usuario / Emisor</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {audit.usuarioResponsable || 'Sistema Automatizado'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Entidad / Recurso</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                    {audit.entidadInvolucrada || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">IP de Origen</span>
                  <span className="font-mono text-slate-700 mt-0.5 block">
                    {audit.direccionIp || '127.0.0.1'}
                  </span>
                </div>
              </div>

              {/* Valores Modificados / Payload */}
              {(audit.valorAnterior || audit.valorNuevo) && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Comparativa de Modificaciones (Payload Inmutable):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Estado Previo</span>
                      {renderJsonPretty(audit.valorAnterior)}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1 font-semibold">Estado Resultante</span>
                      {renderJsonPretty(audit.valorNuevo)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
              Este evento corresponde a una notificación directa del sistema con trazabilidad estándar.
            </div>
          )}
        </div>

        {/* Pie del Modal con Acciones */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            {notificacion.accionUrl && (
              <button
                onClick={handleIrAlModulo}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-600/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 cursor-pointer"
              >
                Ir al Módulo Afectado
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
