'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2,
  FileText,
  Mail,
  RefreshCw,
  CheckCircle2,
  List,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  ServerCrash
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { api } from '@/lib/api';
import { HistorialAcceso } from '@/types';

import { getHistorialLocal } from '@/lib/historialStore';

export default function SocioSyncPage() {
  const [forzando, setForzando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [pasoTexto, setPasoTexto] = useState('');
  const [alertaMsg, setAlertaMsg] = useState<{ tipo: 'EXITO' | 'ERROR'; texto: string } | null>(null);
  const [loteActual, setLoteActual] = useState<HistorialAcceso[]>([]);

  React.useEffect(() => {
    setLoteActual(getHistorialLocal());
  }, []);

  const { agregarNotificacion } = useNotifications();

  const exportarPDF = () => {
    window.print();
  };

  const enviarCorreo = () => {
    const textoReporte = loteActual.map((r, i) => 
      `📌 Registro #${i + 1}%0D%0A` +
      `👤 Persona: ${r.empleadoNombreCompleto}%0D%0A` +
      `🏢 Área: ${r.areaNombre}%0D%0A` +
      `⏱️ Fecha: ${new Date(r.timestamp).toLocaleString()}%0D%0A` +
      `📝 Resultado: ${r.resultadoAcceso}%0D%0A` +
      `----------------------------------------`
    ).join('%0D%0A%0D%0A');
    
    const body = `Estimado Socio Internacional,%0D%0A%0D%0AAdjunto enviamos el reporte de actividad de accesos registrados en nuestras instalaciones de alto riesgo:%0D%0A%0D%0A${textoReporte}%0D%0A%0D%0AAtentamente,%0D%0ADirección de Seguridad - Laboratorio XYZ`;
    
    window.location.href = `mailto:compliance@partner-international.com?subject=Reporte de Actividad de Accesos - Laboratorio XYZ&body=${body}`;
  };

  const handleForzarEnvio = async () => {
    setForzando(true);
    setAlertaMsg(null);
    setProgreso(20);
    setPasoTexto('Empaquetando registros de accesos...');

    try {
      // Configuramos el rango de fechas (ej. último mes)
      const ahora = new Date();
      const haceUnMes = new Date();
      haceUnMes.setMonth(ahora.getMonth() - 1);

      // Simulación de carga para mejor UX
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgreso(60);
      setPasoTexto('Conectando con servidor seguro y API Backend...');

      await new Promise(resolve => setTimeout(resolve, 800));
      setProgreso(90);
      setPasoTexto('Transmitiendo reporte de actividad...');

      // Llamada real al backend en Java (axios baseURL ya incluye /api)
      await api.post('/sincronizacion/socio', {
        periodoInicio: haceUnMes.toISOString(),
        periodoFin: ahora.toISOString()
      });

      setProgreso(100);
      setForzando(false);
      setPasoTexto('');

      setAlertaMsg({
        tipo: 'EXITO',
        texto: `¡Transmisión exitosa! La información ha sido recibida y confirmada por el sistema externo del socio internacional a través de la API.`,
      });

      agregarNotificacion({
        titulo: `🌐 Exportación B2B Exitosa`,
        mensaje: `La información de accesos fue reportada al socio internacional correctamente.`,
        tipo: 'SISTEMA',
        rolesDestino: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
        accionUrl: '/dashboard/socio-sync',
      });
    } catch (error) {
      setForzando(false);
      setProgreso(0);
      setPasoTexto('');
      setAlertaMsg({
        tipo: 'ERROR',
        texto: `Fallo al sincronizar con la API: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full text-emerald-600 mb-4 ring-8 ring-emerald-50">
          <Globe2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-heading font-extrabold text-slate-800">
          Reporte Internacional de Accesos
        </h1>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          Módulo dedicado a la visualización y exportación de la actividad de acceso registrada, 
          cumpliendo con la obligación de reportar periódicamente hacia sistemas externos.
        </p>
      </div>

      {/* Mecanismos de Exportación - Cards Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        {/* API Sync */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200/50 shadow-lg shadow-emerald-900/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <RefreshCw className={`w-6 h-6 ${forzando ? 'animate-spin' : ''}`} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">Transmisión B2B (API)</h3>
          <p className="text-xs text-slate-500 mb-6 flex-1">
            Envía la información directamente al sistema externo del socio de forma segura y automatizada.
          </p>
          <button
            onClick={handleForzarEnvio}
            disabled={forzando}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {forzando ? 'Transmitiendo...' : 'Iniciar Transmisión'}
            {!forzando && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        {/* PDF Export */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg shadow-slate-900/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">Exportar Documento (PDF)</h3>
          <p className="text-xs text-slate-500 mb-6 flex-1">
            Genera un documento formal con la actividad registrada listo para impresión o archivo físico.
          </p>
          <button
            onClick={exportarPDF}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Generar PDF
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Email Export */}
        <div className="bg-white rounded-3xl p-6 border border-blue-200/50 shadow-lg shadow-blue-900/5 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-2">Enviar por Correo</h3>
          <p className="text-xs text-slate-500 mb-6 flex-1">
            Redacta un correo electrónico automático con la información detallada para el auditor internacional.
          </p>
          <button
            onClick={enviarCorreo}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Abrir Cliente de Correo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {forzando && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-800 p-6 rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-100 mb-3">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                {pasoTexto}
              </span>
              <span className="font-mono text-emerald-300 text-sm">{progreso}%</span>
            </div>
            <div className="w-full bg-emerald-950/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerta de Éxito */}
      <AnimatePresence>
        {alertaMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 shadow-lg ${
              alertaMsg.tipo === 'EXITO' 
                ? 'bg-emerald-50 border-emerald-400 shadow-emerald-500/10' 
                : 'bg-red-50 border-red-400 shadow-red-500/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl text-white shadow-md ${
                alertaMsg.tipo === 'EXITO' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'
              }`}>
                {alertaMsg.tipo === 'EXITO' ? <CheckCircle2 className="w-6 h-6" /> : <ServerCrash className="w-6 h-6" />}
              </div>
              <div>
                <h4 className={`font-heading font-extrabold text-sm ${
                  alertaMsg.tipo === 'EXITO' ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  {alertaMsg.tipo === 'EXITO' ? 'Transmisión Completada' : 'Error de Transmisión'}
                </h4>
                <p className={`text-xs font-medium mt-1 ${
                  alertaMsg.tipo === 'EXITO' ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {alertaMsg.texto}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAlertaMsg(null)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                alertaMsg.tipo === 'EXITO' ? 'hover:bg-emerald-200/50 text-emerald-700' : 'hover:bg-red-200/50 text-red-700'
              }`}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Información a Exportar */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <List className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-800 text-base">Actividad de Acceso Registrada</h3>
              <p className="text-xs text-slate-500 mt-0.5">Esta es la información que será reportada hacia el sistema externo.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            {loteActual.length} Registros Nuevos
          </span>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400 font-bold tracking-wider">
              <tr>
                <th className="p-4 rounded-tl-xl">Persona Asociada</th>
                <th className="p-4">Área Restringida</th>
                <th className="p-4">Resultado</th>
                <th className="p-4 rounded-tr-xl">Marca de Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loteActual.map((item, idx) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {(item.empleadoNombreCompleto || '?').charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{item.empleadoNombreCompleto || 'Desconocido'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 font-medium text-xs flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {item.areaNombre}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        item.resultadoAcceso === 'AUTORIZADO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                          : 'bg-red-50 text-red-700 border border-red-200/50'
                      }`}
                    >
                      {item.resultadoAcceso === 'AUTORIZADO' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ServerCrash className="w-3.5 h-3.5" />}
                      {item.resultadoAcceso}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] font-semibold text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
