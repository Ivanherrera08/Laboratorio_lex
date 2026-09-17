'use client';

import React, { useState, useEffect } from 'react';
import { ResultadoAcceso, Empleado } from '@/types';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  User,
  Clock,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

export default function SimuladorAccesoPage() {
  const [identificador, setIdentificador] = useState('');
  const [tipoIdentificador, setTipoIdentificador] = useState<'DOCUMENTO' | 'RFID'>('DOCUMENTO');
  const [areaId, setAreaId] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import('@/lib/usuariosStore').then(({ getUsuariosSistema }) => getUsuariosSistema());
    import('@/lib/personalStore').then(({ getEmpleados }) => getEmpleados());
  }, []);

  const [resultado, setResultado] = useState<{
    estado: ResultadoAcceso;
    motivo?: string;
    timestamp: string;
    areaConsultada?: string;
    perfil?: Empleado;
  } | null>(null);

  const areasDemo = [
    { id: '1', nombre: 'Laboratorio de Síntesis Molecular (Área A)' },
    { id: '2', nombre: 'Sala Limpia de Liofilización (Área B)' },
    { id: '3', nombre: 'Almacén Central (Área C)' },
    { id: '4', nombre: 'Oficinas Administrativas (Área D)' },
  ];

  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);
    
    toast.loading('Analizando credencial en el servidor biométrico...', { id: 'scan-toast' });

    const areaSeleccionada = areasDemo.find((a) => a.id === areaId)?.nombre ?? '';

    try {
      // Simulate network delay for scanning effect
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await api.post('/accesos/verificar', {
        documento: identificador,
        areaId: parseInt(areaId, 10),
      });

      const estado = res.data.resultado;
      setResultado({
        estado,
        motivo: res.data.mensaje,
        timestamp: new Date().toISOString(),
        areaConsultada: areaSeleccionada,
        perfil: res.data.empleadoNombre ? { nombres: res.data.empleadoNombre } : null
      });

      if (estado === 'AUTORIZADO') toast.success('Acceso Permitido', { id: 'scan-toast' });
      else if (estado === 'DENEGADO') toast.error('Acceso Denegado', { id: 'scan-toast' });
      else toast.warning('Credencial Desconocida', { id: 'scan-toast' });

    } catch {
      const { buscarPorDocumento, buscarPorRfid } = await import('@/lib/personalStore');
      const { buscarUsuarioPorDocumento } = await import('@/lib/usuariosStore');
      let empleado = null;

      if (tipoIdentificador === 'DOCUMENTO') {
        const usuarioSistema = buscarUsuarioPorDocumento(identificador.trim());
        if (usuarioSistema) {
          const estadoMapeado = usuarioSistema.estado === 'ACTIVO' ? 'ACTIVO' : usuarioSistema.estado === 'BLOQUEADO' ? 'REVOCADO' : 'SUSPENDIDO';
          empleado = {
            id: usuarioSistema.id,
            departamentoId: 0,
            departamentoNombre: usuarioSistema.rol,
            areaPrincipalNombre: usuarioSistema.rol === 'ADMINISTRADOR' ? 'Acceso Maestro (Todas las zonas)' : 'Administración',
            areasAutorizadas: usuarioSistema.rol === 'ADMINISTRADOR' 
              ? ['Laboratorio', 'Sala', 'Almacén', 'Oficinas'] 
              : ['Oficinas'],
            tipoDocumento: 'CC',
            numeroDocumento: usuarioSistema.documento,
            nombres: usuarioSistema.nombres,
            apellidos: usuarioSistema.apellidos,
            correo: usuarioSistema.correo,
            telefono: '—',
            estado: estadoMapeado as any,
          };
        } else {
          empleado = buscarPorDocumento(identificador.trim());
        }
      } else {
        empleado = buscarPorRfid(identificador.trim());
      }

      if (!empleado) {
        toast.warning('Credencial Desconocida', { id: 'scan-toast' });
        setResultado({ estado: 'NO_REGISTRADO', motivo: 'No existe en base de datos.', timestamp: new Date().toISOString(), areaConsultada: areaSeleccionada });
      } else if (empleado.estado === 'REVOCADO' || empleado.estado === 'SUSPENDIDO') {
        toast.error(`Acceso ${empleado.estado}`, { id: 'scan-toast' });
        setResultado({ estado: 'DENEGADO', perfil: empleado, areaConsultada: areaSeleccionada, motivo: `Credencial ${empleado.estado}`, timestamp: new Date().toISOString() });
      } else {
        const tieneAcceso = !areaSeleccionada || (empleado.areasAutorizadas?.some((a) => a.toLowerCase().includes(areaSeleccionada.split(' ')[0].toLowerCase())) ?? true);
        if (tieneAcceso) toast.success('Acceso Permitido', { id: 'scan-toast' });
        else toast.error('Acceso Denegado', { id: 'scan-toast' });
        
        setResultado({
          estado: tieneAcceso ? 'AUTORIZADO' : 'DENEGADO',
          perfil: empleado,
          areaConsultada: areaSeleccionada,
          motivo: tieneAcceso ? undefined : 'Sin autorización para esta zona.',
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Light theme colors adjusted to corporate palette
  const colors = {
    AUTORIZADO: { bg: 'bg-emerald-50/80 backdrop-blur-md', border: 'border-emerald-200', text: 'text-emerald-900', glow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]', icon: 'text-emerald-600', iconBg: 'bg-emerald-100 border-emerald-200' },
    DENEGADO: { bg: 'bg-red-50/80 backdrop-blur-md', border: 'border-red-200', text: 'text-red-900', glow: 'shadow-[0_0_40px_rgba(244,63,94,0.15)]', icon: 'text-red-600', iconBg: 'bg-red-100 border-red-200' },
    NO_REGISTRADO: { bg: 'bg-amber-50/80 backdrop-blur-md', border: 'border-amber-200', text: 'text-amber-900', glow: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]', icon: 'text-amber-600', iconBg: 'bg-amber-100 border-amber-200' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-brand-dark">Consola Industrial de Accesos</h1>
        <p className="text-xs text-brand-text/70 mt-1">Simulación en tiempo real de Airlocks y validación biométrica.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Terminal de Ingreso */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-brand-accent/60 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-primary/10 to-transparent rounded-bl-full" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 rounded-2xl bg-brand-secondary/40 text-brand-primary border border-brand-accent/40 shadow-inner">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-brand-dark uppercase tracking-widest">Lector Terminal</h2>
              <p className="text-[11px] text-brand-text/60">Panel de Control de Seguridad</p>
            </div>
          </div>

          <form onSubmit={handleSimular} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-brand-text/70 uppercase tracking-wider">Zona de Acceso</label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-brand-accent/60 text-brand-dark text-sm font-medium focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-xs"
              >
                {areasDemo.map((area) => (
                  <option key={area.id} value={area.id}>{area.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-brand-text/70 uppercase tracking-wider">Método de Escaneo</label>
              <div className="grid grid-cols-2 gap-3">
                {['DOCUMENTO', 'RFID'].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setTipoIdentificador(tipo as any)}
                    className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                      tipoIdentificador === tipo 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
                        : 'bg-brand-secondary/40 text-brand-text border-brand-accent/40 hover:border-brand-primary/50'
                    }`}
                  >
                    {tipo === 'DOCUMENTO' ? 'Documento ID' : 'Tarjeta RFID'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-brand-text/70 uppercase tracking-wider">
                  Credencial de Seguridad
                </label>
                <span className="text-[10px] font-medium text-brand-text/50">{identificador.length}/12</span>
              </div>
              <input
                type="text"
                required
                value={identificador}
                onChange={(e) => {
                  const valorNumerico = e.target.value.replace(/\D/g, '');
                  setIdentificador(valorNumerico);
                }}
                maxLength={12}
                placeholder="Ej. 1012345678"
                className="w-full px-5 py-4 rounded-xl bg-white border border-brand-accent/60 text-brand-dark font-mono text-lg focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-brand-text/30 shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <ScanLine className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'PROCESANDO ESCANEO...' : 'INICIAR ESCANEO'}
            </button>
          </form>
        </div>

        {/* Panel de Resultado Animado */}
        <div className="lg:col-span-7 flex flex-col justify-center min-h-[500px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="w-full h-full rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-brand-accent/40 flex flex-col items-center justify-center p-12 relative overflow-hidden"
              >
                {/* Radar effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    className="w-32 h-32 rounded-full border-2 border-brand-primary/40 absolute"
                  />
                  <motion.div
                    animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                    transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: "easeOut" }}
                    className="w-32 h-32 rounded-full border-2 border-brand-primary/20 absolute"
                  />
                </div>
                <ScanLine className="w-16 h-16 text-brand-primary relative z-10" />
                <h3 className="text-brand-primary font-mono font-bold mt-6 relative z-10 tracking-widest animate-pulse">VALIDANDO CREDENCIAL...</h3>
              </motion.div>
            ) : resultado ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className={`rounded-[2.5rem] overflow-hidden ${colors[resultado.estado].bg} border ${colors[resultado.estado].border} ${colors[resultado.estado].glow} p-8 relative`}
              >
                <div className="text-center mb-8 relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${colors[resultado.estado].iconBg} border`}
                  >
                    {resultado.estado === 'AUTORIZADO' && <CheckCircle2 className={`w-10 h-10 ${colors[resultado.estado].icon}`} />}
                    {resultado.estado === 'DENEGADO' && <XCircle className={`w-10 h-10 ${colors[resultado.estado].icon}`} />}
                    {resultado.estado === 'NO_REGISTRADO' && <AlertCircle className={`w-10 h-10 ${colors[resultado.estado].icon}`} />}
                  </motion.div>
                  <h2 className={`text-3xl font-heading font-black tracking-tight ${colors[resultado.estado].text}`}>
                    {resultado.estado === 'AUTORIZADO' ? 'ACCESO OTORGADO' : resultado.estado === 'DENEGADO' ? 'ACCESO DENEGADO' : 'NO IDENTIFICADO'}
                  </h2>
                </div>

                {resultado.perfil && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-black/5 shadow-xs"
                  >
                    <div className="flex items-center gap-5 border-b border-gray-200/60 pb-5 mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-brand-secondary/30 border border-brand-accent/40 flex items-center justify-center text-3xl">
                        {resultado.perfil.fotoPerfil ? <img src={resultado.perfil.fotoPerfil} className="w-full h-full rounded-2xl object-cover" /> : '👤'}
                      </div>
                      <div>
                        <p className={`text-lg font-heading font-bold ${colors[resultado.estado].text}`}>{resultado.perfil.nombres} {resultado.perfil.apellidos}</p>
                        <p className="text-xs text-brand-text/70">{resultado.perfil.departamentoNombre}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-brand-text/80">
                      <div>
                        <span className="text-brand-text/50 block mb-1">Documento</span>
                        {resultado.perfil.tipoDocumento} {resultado.perfil.numeroDocumento}
                      </div>
                      <div>
                        <span className="text-brand-text/50 block mb-1">Estado de Credencial</span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-brand-accent/40 font-bold">{resultado.perfil.estado}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-brand-text/50 block mb-1">Área Asignada</span>
                        {resultado.perfil.areaPrincipalNombre}
                      </div>
                    </div>

                    {resultado.motivo && (
                      <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2 shadow-sm">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                        {resultado.motivo}
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="mt-6 flex items-center justify-between text-[10px] text-brand-text/40 font-mono">
                  <span>LOG: {new Date(resultado.timestamp).toISOString()}</span>
                  <span>ZONA: {resultado.areaConsultada}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full rounded-[2.5rem] bg-brand-secondary/20 border border-brand-accent/40 border-dashed flex flex-col items-center justify-center p-12 text-brand-text/40"
              >
                <ScanLine className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-heading font-bold">SISTEMA EN ESPERA</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
