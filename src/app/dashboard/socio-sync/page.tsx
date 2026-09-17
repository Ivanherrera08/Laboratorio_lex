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
  Send,
  Sparkles,
  Server,
  Zap,
  Mail,
  List
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { HistorialAcceso } from '@/types';

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

const mockLoteActual: HistorialAcceso[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    empleadoId: 1,
    empleadoNombreCompleto: 'Dr. Carlos Mendoza',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    numeroDocumentoIngresado: '1012345678',
    codigoTarjetaIngresado: 'RFID-001',
    resultadoAcceso: 'AUTORIZADO',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    empleadoId: 2,
    empleadoNombreCompleto: 'Ing. Laura Restrepo',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    numeroDocumentoIngresado: '1087654321',
    codigoTarjetaIngresado: 'RFID-002',
    resultadoAcceso: 'DENEGADO',
    motivoDenegacion: 'Permiso REVOCADO en área de alto riesgo',
    timestamp: new Date().toISOString(),
  }
];

export default function SocioSyncPage() {
  const [sincronizaciones, setSincronizaciones] = useState<SincronizacionSocio[]>(mockSincronizaciones);
  const [forzando, setForzando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [pasoTexto, setPasoTexto] = useState('');
  const [alertaMsg, setAlertaMsg] = useState<{ tipo: 'EXITO' | 'ERROR'; texto: string } | null>(null);

  const { agregarNotificacion } = useNotifications();

  const handleForzarEnvio = () => {
    setForzando(true);
    setAlertaMsg(null);
    setProgreso(20);
    setPasoTexto('1/3: Empaquetando registros de accesos y firmas digitales...');

    setTimeout(() => {
      setProgreso(60);
      setPasoTexto('2/3: Conectando con servidor B2B seguro (partner-api.pharma-cloud.org)...');
    }, 600);

    setTimeout(() => {
      setProgreso(90);
      setPasoTexto('3/3: Transmitiendo payload cifrado y esperando ACK (HTTP 200)...');
    }, 1200);

    setTimeout(() => {
      setProgreso(100);
      setForzando(false);
      setPasoTexto('');

      const nuevoLoteId = Math.floor(Math.random() * 900) + 103;
      const nuevoRegistro: SincronizacionSocio = {
        id: nuevoLoteId,
        departamentoId: 1,
        periodoInicio: '2026-09-15T00:00:00Z',
        periodoFin: new Date().toISOString(),
        estado: 'EXITOSO',
        intentosRealizados: 1,
        codigoRespuestaHttp: 200,
        fechaEnvio: new Date().toISOString(),
      };

      setSincronizaciones((prev) => [nuevoRegistro, ...prev]);

      setAlertaMsg({
        tipo: 'EXITO',
        texto: `¡Transmisión forzada con éxito! El lote #SYNC-${nuevoLoteId} fue recibido y confirmado por el socio internacional con código HTTP 200 OK.`,
      });

      // Disparar notificación al sistema en tiempo real
      agregarNotificacion({
        titulo: `🌐 Sincronización Manual #SYNC-${nuevoLoteId}`,
        mensaje: `Lote de trazabilidad transmitido exitosamente al socio internacional con código 200 OK.`,
        tipo: 'SISTEMA',
        rolesDestino: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
        accionUrl: '/dashboard/socio-sync',
      });
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const textoReporte = mockLoteActual.map((r, i) => 
                `📌 Registro #${i + 1}%0D%0A` +
                `👤 Persona: ${r.empleadoNombreCompleto}%0D%0A` +
                `🏢 Área: ${r.areaNombre}%0D%0A` +
                `⏱️ Fecha: ${new Date(r.timestamp).toLocaleString()}%0D%0A` +
                `📝 Resultado: ${r.resultadoAcceso}%0D%0A` +
                `----------------------------------------`
              ).join('%0D%0A%0D%0A');
              
              const body = `Estimado Auditor,%0D%0A%0D%0AA continuación enviamos el registro de accesos correspondiente al lote actual generado por el sistema Zone Control:%0D%0A%0D%0A${textoReporte}%0D%0A%0D%0AAtentamente,%0D%0ASistema Automatizado Zone Control`;
              
              window.location.href = `mailto:auditor@partner.com?subject=Reporte de Trazabilidad B2B - Zone Control&body=${body}`;
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-brand-accent/60 text-brand-dark font-semibold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Mail className="w-4 h-4 text-brand-primary" />
            <span>Abrir en Gmail / Correo</span>
          </button>
          
          <button
            onClick={handleForzarEnvio}
            disabled={forzando}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${forzando ? 'animate-spin' : ''}`} />
            <span>{forzando ? 'Transmitiendo al Socio...' : 'Forzar Sincronización Manual'}</span>
          </button>
        </div>
      </div>

      {/* Alerta de Resultado de Sincronización */}
      {alertaMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start justify-between gap-3 shadow-xs animate-slide-down">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-200 text-emerald-800 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-emerald-900">
                Transmisión B2B Completada
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                {alertaMsg.texto}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlertaMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra de Progreso en Vivo cuando se pulsa Forzar */}
      {forzando && (
        <div className="bg-white p-6 rounded-3xl border border-brand-accent/40 shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
            <span className="flex items-center gap-2 text-brand-primary">
              <Sparkles className="w-4 h-4 animate-spin" />
              {pasoTexto}
            </span>
            <span className="font-mono text-brand-primary font-extrabold">{progreso}%</span>
          </div>
          <div className="w-full bg-brand-secondary/70 rounded-full h-3 overflow-hidden p-0.5 border border-brand-accent/30">
            <div
              className="bg-brand-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tarjetas de Estado del Enlace */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-brand-accent/40 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-text/70">Estado del Endpoint</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <p className="text-lg font-heading font-bold text-emerald-800 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Conectado (HTTP 200)
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block font-mono">partner-api.pharma-cloud.org</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-accent/40 shadow-xs hover:shadow-sm transition-all">
          <span className="text-xs font-bold text-brand-text/70">Frecuencia Automática</span>
          <p className="text-lg font-heading font-bold text-brand-dark mt-2 flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-brand-primary" />
            Cada 24 Horas (02:00 UTC)
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">Próxima ejecución programada hoy</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-accent/40 shadow-xs hover:shadow-sm transition-all">
          <span className="text-xs font-bold text-brand-text/70">Reintentos Exponenciales</span>
          <p className="text-lg font-heading font-bold text-brand-dark mt-2 flex items-center gap-1.5">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Máximo 3 Intentos
          </p>
          <span className="text-[11px] text-gray-500 mt-1 block">Backoff con alerta a administradores</span>
        </div>
      </div>

      {/* Previsualización del Lote Actual (La "Información Real") */}
      <div className="bg-white rounded-3xl border border-brand-accent/40 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-accent/30 bg-brand-secondary/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-brand-primary" />
            <h3 className="font-heading font-bold text-sm text-brand-dark">Registros Actuales Pendientes de Envío (Vista Previa)</h3>
          </div>
          <span className="text-xs text-brand-text/60 font-semibold">{mockLoteActual.length} Registros Nuevos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-light border-b border-brand-accent/30 text-brand-dark font-bold">
              <tr>
                <th className="p-3">Persona Asociada</th>
                <th className="p-3">Área Restringida</th>
                <th className="p-3">Resultado</th>
                <th className="p-3">Marca de Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/20">
              {mockLoteActual.map((item) => (
                <tr key={item.id} className="hover:bg-brand-light/60 transition-colors">
                  <td className="p-3 font-semibold text-brand-dark">{item.empleadoNombreCompleto}</td>
                  <td className="p-3 text-brand-text font-medium">{item.areaNombre}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        item.resultadoAcceso === 'AUTORIZADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.resultadoAcceso}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-brand-text/80">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de Lotes Sincronizados */}
      <div className="bg-white rounded-3xl border border-brand-accent/40 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-brand-accent/30 bg-brand-secondary/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-brand-primary" />
            <h3 className="font-heading font-bold text-sm text-brand-dark">Historial de Transmisiones de Lotes</h3>
          </div>
          <span className="text-xs text-brand-text/60 font-semibold">Trazabilidad Internacional</span>
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
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
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
                      {sync.estado === 'EXITOSO' && <CheckCircle2 className="w-3 h-3" />}
                      {sync.estado === 'REINTENTANDO' && <Clock className="w-3 h-3" />}
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
