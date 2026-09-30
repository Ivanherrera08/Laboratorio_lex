'use client';

import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface DetalleNotificacionModalProps {
  notificacion: NotificacionSistema | null;
  onClose: () => void;
}

export default function DetalleNotificacionModal({
  notificacion,
  onClose,
}: DetalleNotificacionModalProps) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  if (!notificacion) return null;

  const getTipoConfig = (tipo: NotificacionSistema['tipo']) => {
    switch (tipo) {
      case 'SEGURIDAD':
        return {
          icon: ShieldAlert,
          bg: 'bg-red-50 text-red-700 border-red-200',
          badgeBg: 'bg-red-100 text-red-800',
          iconColor: 'text-red-600',
          headerBg: 'bg-gradient-to-r from-red-600 to-rose-500',
          label: 'Alerta de Seguridad / Bioseguridad',
        };
      case 'PERSONAL':
        return {
          icon: Users,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          badgeBg: 'bg-blue-100 text-blue-800',
          iconColor: 'text-blue-600',
          headerBg: 'bg-gradient-to-r from-blue-600 to-indigo-500',
          label: 'Gestión de Personal Farmacéutico',
        };
      case 'SISTEMA':
        return {
          icon: Cpu,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800',
          iconColor: 'text-amber-600',
          headerBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
          label: 'Evento de Sistema y Sincronización',
        };
      case 'AUDITORIA':
        return {
          icon: FileCheck,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          iconColor: 'text-emerald-600',
          headerBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          label: 'Bitácora Regulatoria GxP (21 CFR Part 11)',
        };
    }
  };

  const config = getTipoConfig(notificacion.tipo);
  const Icon = config.icon;
  const audit = notificacion.detallesAuditoria;

  const handleIrAlModulo = () => {
    if (notificacion.accionUrl) {
      if (window.location.pathname === notificacion.accionUrl) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        router.push(notificacion.accionUrl);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const renderJsonPretty = (val: string | null | undefined, isNuevo: boolean = false) => {
    if (!val) return <span className="text-slate-400 italic text-[11px] block mt-2 px-2">Sin datos previos</span>;
    try {
      const obj = JSON.parse(val);
      return (
        <div className="space-y-2.5 mt-3">
          {Object.entries(obj).map(([k, v]) => (
            <div key={k} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${isNuevo ? 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-300 shadow-emerald-500/5' : 'bg-slate-50 border-slate-100 hover:border-slate-300 shadow-slate-500/5'}`}>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${isNuevo ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-slate-400 shadow-slate-400/50'}`} />
                {k.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border shadow-sm truncate max-w-full sm:max-w-[220px] mt-2 sm:mt-0 ${isNuevo ? 'bg-white border-emerald-200 text-emerald-700 shadow-emerald-500/10' : 'bg-white border-slate-200 text-slate-700 shadow-slate-500/10'}`}>
                {String(v)}
              </span>
            </div>
          ))}
        </div>
      );
    } catch {
      return (
        <div className={`p-3.5 mt-3 rounded-xl border text-[11px] font-mono shadow-sm ${isNuevo ? 'bg-emerald-50/40 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-700'}`}>
          {val}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-modal-pop flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence>
          {showToast && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm rounded-3xl pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="flex flex-col items-center justify-center gap-2 px-6 py-5 bg-slate-800 text-white rounded-2xl shadow-2xl border border-slate-700 w-auto min-w-[280px] max-w-sm text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1 ring-4 ring-emerald-500/10">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Módulo Actual</p>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Ya te encuentras visualizando<br />la pantalla afectada.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Cabecera del Modal con Gradiente */}
        <div className={`relative px-7 py-6 overflow-hidden ${config.headerBg}`}>
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          
          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner shrink-0">
                <Icon className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-white/30 bg-white/20 backdrop-blur-md text-white tracking-wider">
                    {config.label}
                  </span>
                  <span className="text-[11px] text-white/70 font-mono font-medium bg-black/10 px-2 py-0.5 rounded-md">
                    ID: {notificacion.id}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-black text-white drop-shadow-sm leading-tight pr-8">
                  {notificacion.titulo}
                </h3>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-0 right-0 sm:relative w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/10 hover:rotate-90 duration-300"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-7 overflow-y-auto space-y-7 bg-slate-50/30">
          {/* Mensaje principal */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm text-sm text-slate-800 leading-relaxed relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${config.headerBg} opacity-80 group-hover:opacity-100 transition-opacity`} />
            <p className="font-semibold text-slate-700 pl-2">{notificacion.mensaje}</p>
            <div className="flex items-center gap-5 mt-4 text-[11px] text-slate-500 pt-3 border-t border-slate-100 pl-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-slate-400" />
                {notificacion.timestamp}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(notificacion.fechaHoraIso).toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Desglose de Bitácora / Auditoría */}
          {audit ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
              {/* Pattern bg for audit card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-60 -z-10 translate-x-20 -translate-y-20 pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner">
                    <Fingerprint className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-heading font-black text-sm text-slate-800 uppercase tracking-widest">
                    Registro Formal de Auditoría GxP
                  </h4>
                </div>
                {audit.operacion && (
                  <span className="text-[10px] font-mono font-black bg-slate-800 text-emerald-400 px-3 py-1 rounded-lg tracking-wider shadow-md">
                    {audit.operacion}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-400 block text-[10px] uppercase font-black tracking-widest mb-1.5">Módulo Afectado</span>
                  <span className="font-bold text-slate-700 flex items-center gap-2 text-xs">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    {audit.modulo}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-400 block text-[10px] uppercase font-black tracking-widest mb-1.5">Usuario / Emisor</span>
                  <span className="font-bold text-slate-700 flex items-center gap-2 text-xs">
                    <User className="w-4 h-4 text-emerald-500" />
                    {audit.usuarioResponsable || 'Sistema Automatizado'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-400 block text-[10px] uppercase font-black tracking-widest mb-1.5">Entidad / Recurso</span>
                  <span className="font-bold text-slate-700 flex items-center gap-2 text-xs truncate">
                    <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{audit.entidadInvolucrada || 'N/A'}</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-400 block text-[10px] uppercase font-black tracking-widest mb-1.5">IP de Origen</span>
                  <span className="font-mono font-bold text-slate-700 flex items-center gap-2 text-xs">
                    <ExternalLink className="w-4 h-4 text-emerald-500" />
                    {audit.direccionIp || '127.0.0.1'}
                  </span>
                </div>
              </div>

              {/* Valores Modificados / Payload */}
              {(audit.valorAnterior || audit.valorNuevo) && (
                <div className="pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                      Comparativa de Modificaciones (Inmutable)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-slate-50 rounded-2xl -z-10" />
                      <span className="text-[10px] text-slate-500 block mb-2 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Estado Previo
                      </span>
                      {renderJsonPretty(audit.valorAnterior, false)}
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -inset-2 bg-emerald-50/30 rounded-2xl -z-10 border border-emerald-100/50" />
                      <span className="text-[10px] text-emerald-700 block mb-2 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
                        Estado Resultante
                      </span>
                      {renderJsonPretty(audit.valorNuevo, true)}
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
        <div className="px-7 py-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
          >
            Cerrar Detalles
          </button>

          <div className="flex items-center gap-2">
            {notificacion.accionUrl && (
              <button
                onClick={handleIrAlModulo}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Ir al Módulo Afectado
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
