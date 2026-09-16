'use client';

import React, { useState } from 'react';
import { SincronizacionSocio } from '@/types';
import {
  Globe2,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

const mockSincronizaciones: SincronizacionSocio[] = [
  {
    id: 101,
    departamentoId: 1,
    periodoInicio: '2026-09-01T00:00:00Z',
    periodoFin: '2026-09-07T23:59:59Z',
    estado: 'EXITOSO',
    intentosRealizados: 1,
    codigoRespuestaHttp: 200,
    fechaEnvio: '2026-09-08T02:00:15Z',
  },
  {
    id: 102,
    departamentoId: 2,
    periodoInicio: '2026-09-08T00:00:00Z',
    periodoFin: '2026-09-14T23:59:59Z',
    estado: 'REINTENTANDO',
    intentosRealizados: 2,
    codigoRespuestaHttp: 504,
    fechaEnvio: '2026-09-15T02:00:00Z',
    fechaProximoReintento: '2026-09-16T10:00:00Z',
  },
];

export default function SocioSyncPage() {
  const [sincronizaciones, setSincronizaciones] = useState<SincronizacionSocio[]>(mockSincronizaciones);
  const [forzando, setForzando] = useState(false);

  const handleForzarEnvio = () => {
    setForzando(true);
    setTimeout(() => {
      setForzando(false);
      const nueva: SincronizacionSocio = {
        id: Math.floor(Math.random() * 1000) + 200,
        periodoInicio: '2026-09-15T00:00:00Z',
        periodoFin: new Date().toISOString(),
        estado: 'EXITOSO',
        intentosRealizados: 1,
        codigoRespuestaHttp: 200,
        fechaEnvio: new Date().toISOString(),
      };
      setSincronizaciones([nueva, ...sincronizaciones]);
      alert('Lote sincronizado satisfactoriamente con el servidor B2B del socio internacional.');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-brand-dark">Integración y Sincronización B2B</h1>
          <p className="text-xs text-brand-text/70 mt-1">
            Monitoreo y exportación periódica de trazabilidad hacia el socio internacional (RF F-26 a F-30).
          </p>
        </div>

        <button
          onClick={handleForzarEnvio}
          disabled={forzando}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs shadow-md transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${forzando ? 'animate-spin' : ''}`} />
          {forzando ? 'Transmitiendo datos...' : 'Forzar Sincronización Manual'}
        </button>
      </div>

      {/* Tarjetas de Estado del Enlace */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-accent/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-text/70">Estado del Endpoint</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <p className="text-lg font-heading font-bold text-emerald-800 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Conectado (HTTP 200)
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">partner-api.pharma-cloud.org</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-accent/40 shadow-xs">
          <span className="text-xs font-bold text-brand-text/70">Frecuencia Automática</span>
          <p className="text-lg font-heading font-bold text-brand-dark mt-2 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-brand-primary" />
            Cada 24 Horas (02:00 UTC)
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">Próxima ejecución programada hoy</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-accent/40 shadow-xs">
          <span className="text-xs font-bold text-brand-text/70">Reintentos Exponenciales</span>
          <p className="text-lg font-heading font-bold text-brand-dark mt-2 flex items-center gap-1.5">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Máximo 3 Intentos
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">Backoff con alerta a administradores</span>
        </div>
      </div>

      {/* Tabla de Lotes Sincronizados */}
      <div className="bg-white rounded-2xl border border-brand-accent/40 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-accent/30 bg-brand-secondary/40 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-brand-dark">Historial de Transmisiones de Lotes</h3>
          <span className="text-xs text-brand-text/60">Trazabilidad por Departamento</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-secondary/70 border-b border-brand-accent/30 text-brand-dark font-bold">
              <tr>
                <th className="p-4">ID Lote</th>
                <th className="p-4">Período Auditado</th>
                <th className="p-4">Fecha de Envío</th>
                <th className="p-4">Intentos</th>
                <th className="p-4">Código HTTP</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/20">
              {sincronizaciones.map((sync) => (
                <tr key={sync.id} className="hover:bg-brand-light/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-brand-dark">#SYNC-{sync.id}</td>
                  <td className="p-4 text-brand-text font-medium">
                    {new Date(sync.periodoInicio).toLocaleDateString()} —{' '}
                    {new Date(sync.periodoFin).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-brand-text/70">
                    {sync.fechaEnvio ? new Date(sync.fechaEnvio).toLocaleString() : 'Pendiente'}
                  </td>
                  <td className="p-4 font-semibold text-brand-dark">{sync.intentosRealizados} / 3</td>
                  <td className="p-4 font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        sync.codigoRespuestaHttp === 200
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sync.codigoRespuestaHttp || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        sync.estado === 'EXITOSO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sync.estado === 'REINTENTANDO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sync.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
