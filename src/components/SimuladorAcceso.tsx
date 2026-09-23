'use client';

import React, { useState, useEffect } from 'react';
import { ResultadoAcceso, Empleado } from '@/types';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { registrarAccesoLocal } from '@/lib/historialStore';
import { useNotifications } from '@/context/NotificationContext';
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';

export default function SimuladorAccesoPage() {
  const { agregarNotificacion } = useNotifications();
  const [identificador, setIdentificador] = useState('');
  const [tipoIdentificador, setTipoIdentificador] = useState<'DOCUMENTO' | 'RFID'>('DOCUMENTO');
  const [areaId, setAreaId] = useState('3');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import('@/lib/usuariosStore').then(({ getUsuariosSistema }) => getUsuariosSistema());
  }, []);

  const [resultado, setResultado] = useState<{
    estado: ResultadoAcceso;
    motivo?: string;
    timestamp: string;
    areaConsultada?: string;
    perfil?: Empleado;
  } | null>(null);

  const areasDemo = [
    { id: '3', nombre: 'Laboratorio de Síntesis Molecular (Área A)' },
    { id: '4', nombre: 'Sala Limpia de Liofilización (Área B)' },
    { id: '5', nombre: 'Almacén Central (Área C)' },
    { id: '6', nombre: 'Oficinas Administrativas (Área D)' },
    { id: '1', nombre: 'Laboratorio de Bioseguridad 1' },
    { id: '2', nombre: 'Zona de Empaque 1' },
  ];

  const [areas, setAreas] = useState<{ id: string; nombre: string }[]>(areasDemo);
  const [empleadosPadron, setEmpleadosPadron] = useState<Empleado[]>([]);

  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador.trim()) {
      toast.error('Por favor ingresa un número de documento o carnet RFID.');
      return;
    }

    setLoading(true);
    setResultado(null);
    
    toast.loading('Analizando credencial en el servidor biométrico...', { id: 'scan-toast' });

    const areaSeleccionada = areas.find((a) => a.id === areaId)?.nombre ?? 'Área General';

    // Función de resolución y fallback local
    const buscarEnLocal = async (doc: string, rfid: string | null, area: string) => {
      const { buscarPorDocumento, buscarPorRfid } = await import('@/lib/personalStore');
      const { buscarUsuarioPorDocumento } = await import('@/lib/usuariosStore');
      let empleado: Empleado | null = null;
      let esUsuarioSistema = false;
      let rolSistema = '';

      if (tipoIdentificador === 'DOCUMENTO') {
        const usuarioSistema = buscarUsuarioPorDocumento(doc.trim());
        if (usuarioSistema) {
          esUsuarioSistema = true;
          rolSistema = usuarioSistema.rol;
          const estadoMapeado = usuarioSistema.estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO';
          empleado = {
            id: usuarioSistema.id,
            departamentoId: 0,
            departamentoNombre: usuarioSistema.rol === 'ADMINISTRADOR' ? 'Dirección General' : 'Supervisión y Control',
            areaPrincipalNombre: 'Acceso Maestro (Todas las zonas)',
            areasAutorizadas: [
              'Laboratorio de Síntesis Molecular (Área A)',
              'Sala Limpia de Liofilización (Área B)',
              'Almacén Central (Área C)',
              'Oficinas Administrativas (Área D)',
              'Laboratorio de Bioseguridad 1',
              'Zona de Empaque 1'
            ],
            tipoDocumento: 'CC',
            numeroDocumento: usuarioSistema.documento,
            nombres: usuarioSistema.nombres,
            apellidos: usuarioSistema.apellidos,
            correo: usuarioSistema.correo,
            telefono: 'Oficina Central',
            estado: estadoMapeado as any,
          };
        } else {
          empleado =
            empleadosPadron.find((emp) => emp.numeroDocumento === doc.trim()) ??
            buscarPorDocumento(doc.trim());
        }
      } else if (rfid) {
        empleado =
          empleadosPadron.find((emp) => (emp.codigoTarjetaRfid || '').toLowerCase() === rfid.trim().toLowerCase()) ??
          buscarPorRfid(rfid.trim());
      }

      const timestampActual = new Date().toISOString();

      if (!empleado) {
        const estadoFinal: ResultadoAcceso = 'NO_REGISTRADO';
        const motivo = 'Credencial no registrada en el padrón del laboratorio.';
        toast.warning('Credencial Desconocida', { id: 'scan-toast' });
        
        setResultado({
          estado: estadoFinal,
          motivo,
          timestamp: timestampActual,
          areaConsultada: area,
        });

        registrarAccesoLocal({
          areaId: parseInt(areaId, 10),
          areaNombre: area,
          numeroDocumentoIngresado: identificador,
          codigoTarjetaIngresado: tipoIdentificador === 'RFID' ? identificador : undefined,
          resultadoAcceso: estadoFinal,
          motivoDenegacion: motivo,
          timestamp: timestampActual,
        });
        return;
      }

      if (empleado.estado === 'INACTIVO') {
        const estadoFinal: ResultadoAcceso = 'DENEGADO';
        const motivo = `Permisos de acceso inactivos.`;
        toast.error(`Acceso Denegado`, { id: 'scan-toast' });

        setResultado({
          estado: estadoFinal,
          perfil: empleado,
          areaConsultada: area,
          motivo,
          timestamp: timestampActual,
        });

        registrarAccesoLocal({
          areaId: parseInt(areaId, 10),
          areaNombre: area,
          numeroDocumentoIngresado: identificador,
          codigoTarjetaIngresado: tipoIdentificador === 'RFID' ? identificador : undefined,
          resultadoAcceso: estadoFinal,
          motivoDenegacion: motivo,
          empleadoNombreCompleto: `${empleado.nombres} ${empleado.apellidos}`,
          empleadoId: empleado.id,
          timestamp: timestampActual,
        });
        return;
      }


      // Validación de acceso por zona
      const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const areaActualNorm = normalizar(area);

      // Si es administrador o supervisor de accesos, posee acceso maestro
      const esAdmin = esUsuarioSistema && (rolSistema === 'ADMINISTRADOR' || rolSistema === 'SUPERVISOR_ACCESOS');

      const tieneAccesoZona = esAdmin || (empleado.areasAutorizadas?.some((a) => {
        const aNorm = normalizar(a);
        return aNorm === areaActualNorm || aNorm.includes(areaActualNorm) || areaActualNorm.includes(aNorm);
      }) ?? false);

      const estadoFinal: ResultadoAcceso = tieneAccesoZona ? 'AUTORIZADO' : 'DENEGADO';
      const motivo = tieneAccesoZona
        ? (esAdmin ? `Acceso maestro concedido como ${rolSistema}.` : `Autorización válida para ${area}.`)
        : `No posee permiso de ingreso autorizado para ${area}.`;

      if (tieneAccesoZona) toast.success('Acceso Permitido', { id: 'scan-toast' });
      else toast.error('Acceso Denegado', { id: 'scan-toast' });

      setResultado({
        estado: estadoFinal,
        perfil: empleado,
        areaConsultada: area,
        motivo,
        timestamp: timestampActual,
      });

      registrarAccesoLocal({
        areaId: parseInt(areaId, 10),
        areaNombre: area,
        numeroDocumentoIngresado: identificador,
        codigoTarjetaIngresado: tipoIdentificador === 'RFID' ? identificador : undefined,
        resultadoAcceso: estadoFinal,
        motivoDenegacion: tieneAccesoZona ? undefined : motivo,
        empleadoNombreCompleto: `${empleado.nombres} ${empleado.apellidos}`,
        empleadoId: empleado.id,
        timestamp: timestampActual,
      });
    };

    try {
      // Simulación de delay de lectura biométrica de torniquete
      await new Promise((resolve) => setTimeout(resolve, 800));

      const res = await api.post('/publico/accesos/molinete', {
        numeroDocumento: tipoIdentificador === 'DOCUMENTO' ? identificador.trim() : undefined,
        codigoTarjetaRfid: tipoIdentificador === 'RFID' ? identificador.trim() : undefined,
        areaId: parseInt(areaId, 10),
      });

      const estado = res.data.resultado as ResultadoAcceso;
      const timestampActual = new Date().toISOString();

      const nombreBackend = res.data.nombreEmpleado;
      const perfilReal =
        tipoIdentificador === 'DOCUMENTO'
          ? empleadosPadron.find((emp) => emp.numeroDocumento === identificador.trim())
          : empleadosPadron.find((emp) => (emp.codigoTarjetaRfid || '').toLowerCase() === identificador.trim().toLowerCase());

      setResultado({
        estado,
        motivo: res.data.motivo || res.data.mensaje,
        timestamp: timestampActual,
        areaConsultada: res.data.nombreArea && res.data.nombreArea !== 'N/A' ? res.data.nombreArea : areaSeleccionada,
        perfil:
          perfilReal
            ? { ...perfilReal, areaPrincipalNombre: perfilReal.areaPrincipalNombre || res.data.nombreArea || areaSeleccionada }
            : (nombreBackend && nombreBackend !== 'DESCONOCIDO'
                ? {
                    id: 0,
                    departamentoId: 0,
                    tipoDocumento: 'CC',
                    numeroDocumento: identificador,
                    nombres: nombreBackend.split(' ')[0] || nombreBackend,
                    apellidos: nombreBackend.split(' ').slice(1).join(' ') || '',
                    correo: 'personal@laboratorioxyz.com',
                    telefono: 'Registrado en Servidor',
                    estado: res.data.estadoEmpleado || 'ACTIVO',
                    areaPrincipalNombre: res.data.nombreArea && res.data.nombreArea !== 'N/A' ? res.data.nombreArea : areaSeleccionada,
                  }
                : undefined),
      });

      if (estado === 'AUTORIZADO') {
        toast.success('Acceso Permitido', { id: 'scan-toast' });
      } else if (estado === 'DENEGADO') {
        toast.error('Acceso Denegado', { id: 'scan-toast' });
      } else {
        toast.warning('Credencial Desconocida', { id: 'scan-toast' });
      }

      // Guardar en el store local para que el Administrador lo vea en tiempo real
      registrarAccesoLocal({
        areaId: parseInt(areaId, 10),
        areaNombre: res.data.nombreArea && res.data.nombreArea !== 'N/A' ? res.data.nombreArea : areaSeleccionada,
        numeroDocumentoIngresado: tipoIdentificador === 'DOCUMENTO' ? identificador.trim() : '',
        codigoTarjetaIngresado: tipoIdentificador === 'RFID' ? identificador.trim() : undefined,
        resultadoAcceso: estado,
        motivoDenegacion: res.data.motivo || res.data.mensaje,
        empleadoNombreCompleto: nombreBackend && nombreBackend !== 'DESCONOCIDO' ? nombreBackend : undefined,
      });

    } catch (error) {
      // Fallback a lógica local si no hay backend (o si la API falla)
      await buscarEnLocal(
        tipoIdentificador === 'DOCUMENTO' ? identificador : '',
        tipoIdentificador === 'RFID' ? identificador : null,
        areaSeleccionada
      );
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    AUTORIZADO: {
      bg: 'bg-emerald-50/90 backdrop-blur-md',
      border: 'border-emerald-300',
      text: 'text-emerald-950',
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]',
      icon: 'text-emerald-600',
      iconBg: 'bg-emerald-100 border-emerald-300',
      alertBg: 'bg-emerald-100/90 border-emerald-300 text-emerald-900',
      AlertIcon: ShieldCheck,
    },
    DENEGADO: {
      bg: 'bg-red-50/90 backdrop-blur-md',
      border: 'border-red-300',
      text: 'text-red-950',
      glow: 'shadow-[0_0_40px_rgba(244,63,94,0.2)]',
      icon: 'text-red-600',
      iconBg: 'bg-red-100 border-red-300',
      alertBg: 'bg-red-100/90 border-red-300 text-red-900',
      AlertIcon: ShieldAlert,
    },
    NO_REGISTRADO: {
      bg: 'bg-amber-50/90 backdrop-blur-md',
      border: 'border-amber-300',
      text: 'text-amber-950',
      glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]',
      icon: 'text-amber-600',
      iconBg: 'bg-amber-100 border-amber-300',
      alertBg: 'bg-amber-100/90 border-amber-300 text-amber-900',
      AlertIcon: AlertCircle,
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-slate-800">Simulador de Esclusa y Control de Acceso</h1>
        <p className="text-xs text-slate-500/70 mt-1">
          Validación biométrica e inspección de credenciales RFID en tiempo real con registro inmutable en bitácora.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panel de Configuración del Escaneo - Light/Modern Design */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-emerald-200/40 shadow-xs relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />
          
          <form onSubmit={handleSimular} className="space-y-6 relative z-10 mt-2">

            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-500/70 uppercase tracking-wider">
                Método de Identificación
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['DOCUMENTO', 'RFID'].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setTipoIdentificador(tipo as any)}
                    className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                      tipoIdentificador === tipo 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
                        : 'bg-emerald-50/40 text-slate-500 border-emerald-200/40 hover:border-emerald-600/50 hover:bg-emerald-50'
                    }`}
                  >
                    {tipo === 'DOCUMENTO' ? 'Documento ID' : 'Tarjeta RFID'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-500/70 uppercase tracking-wider">
                  Credencial / Identificador
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {identificador.length}/{tipoIdentificador === 'DOCUMENTO' ? 10 : 15}
                </span>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={identificador}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (tipoIdentificador === 'DOCUMENTO') {
                      val = val.replace(/\D/g, '').slice(0, 10);
                    } else {
                      val = val.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 15);
                    }
                    setIdentificador(val);
                  }}
                  maxLength={tipoIdentificador === 'DOCUMENTO' ? 10 : 15}
                  placeholder={
                    tipoIdentificador === 'DOCUMENTO'
                      ? 'Ej. 1012345678'
                      : 'Ej. crn-cnj-857'
                  }
                  className="w-full px-5 py-4 rounded-xl bg-white border border-emerald-200/60 text-slate-800 font-mono text-base tracking-widest focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400/50 shadow-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity">
                  <Fingerprint className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500/70 flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Sistema Biométrico y RFID en línea.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
              <ScanLine className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'ANALIZANDO CREDENCIAL...' : 'ESCANEAR EN TORNIQUETE'}
            </button>
          </form>
        </div>

        {/* Panel de Resultado Animado */}
        <div className="lg:col-span-7 flex flex-col justify-center min-h-[480px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full h-full min-h-[450px] rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-emerald-200/40 flex flex-col items-center justify-center p-12 relative overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                    className="w-32 h-32 rounded-full border-2 border-emerald-600/40 absolute"
                  />
                  <motion.div
                    animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                    transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
                    className="w-32 h-32 rounded-full border-2 border-emerald-600/20 absolute"
                  />
                </div>
                <ScanLine className="w-16 h-16 text-emerald-600 relative z-10 animate-bounce" />
                <h3 className="text-emerald-600 font-mono font-bold mt-6 relative z-10 tracking-widest animate-pulse text-sm">
                  VALIDANDO PERMISOS Y BIOMETRÍA...
                </h3>
              </motion.div>
            ) : resultado ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className={`rounded-[2.5rem] overflow-hidden ${colors[resultado.estado].bg} border ${colors[resultado.estado].border} ${colors[resultado.estado].glow} p-8 relative`}
              >
                <div className="text-center mb-6 relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.15 }}
                    className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${colors[resultado.estado].iconBg} border`}
                  >
                    {resultado.estado === 'AUTORIZADO' && <CheckCircle2 className={`w-10 h-10 ${colors[resultado.estado].icon}`} />}
                    {resultado.estado === 'DENEGADO' && <XCircle className={`w-10 h-10 ${colors[resultado.estado].icon}`} />}
                    {resultado.estado === 'NO_REGISTRADO' && <AlertCircle className={`w-10 h-10 ${colors[resultado.estado].icon}`} />}
                  </motion.div>
                  <h2 className={`text-3xl font-heading font-black tracking-tight ${colors[resultado.estado].text}`}>
                    {resultado.estado === 'AUTORIZADO' ? 'ACCESO OTORGADO' : resultado.estado === 'DENEGADO' ? 'ACCESO DENEGADO' : 'NO REGISTRADO'}
                  </h2>
                </div>

                {resultado.perfil && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-black/5 shadow-xs"
                  >
                    <div className="flex items-center gap-5 border-b border-gray-200/60 pb-5 mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50/40 border border-emerald-200/40 flex items-center justify-center text-3xl">
                        {resultado.perfil.fotoPerfil ? (
                          <img src={resultado.perfil.fotoPerfil} alt="Perfil" className="w-full h-full rounded-2xl object-cover" />
                        ) : '👤'}
                      </div>
                      <div>
                        <p className={`text-lg font-heading font-bold ${colors[resultado.estado].text}`}>
                          {resultado.perfil.nombres} {resultado.perfil.apellidos}
                        </p>
                        <p className="text-xs text-slate-500/70">{resultado.perfil.departamentoNombre || 'Personal Autorizado'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500/80">
                      <div>
                        <span className="text-slate-500/50 block mb-1">Documento Identidad</span>
                        <span className="font-mono font-bold text-slate-800">{resultado.perfil.tipoDocumento} {resultado.perfil.numeroDocumento}</span>
                      </div>
                      <div>
                        <span className="text-slate-500/50 block mb-1">Estado de Credencial</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-emerald-200/40 font-bold">
                          {resultado.perfil.estado}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500/50 block mb-1">Área Principal</span>
                        <span className="font-semibold text-slate-800">{resultado.perfil.areaPrincipalNombre || 'Laboratorio Central'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mensaje de Resultado con el color EXACTO según el estado */}
                {resultado.motivo && (
                  <div className={`mt-5 p-4 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 shadow-xs ${colors[resultado.estado].alertBg}`}>
                    {resultado.estado === 'AUTORIZADO' ? (
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{resultado.motivo}</span>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500/50 font-mono">
                  <span>LOG: {new Date(resultado.timestamp).toLocaleTimeString()}</span>
                  <span>ZONA: {resultado.areaConsultada}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full min-h-[450px] rounded-[2.5rem] bg-emerald-50/20 border border-emerald-200/40 border-dashed flex flex-col items-center justify-center p-12 text-slate-500/40"
              >
                <ScanLine className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-heading font-bold">ESCLUSAS EN ESPERA DE LECTURA</p>
                <p className="text-xs text-slate-500/50 mt-1">Ingresa una credencial a la izquierda para simular el paso</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
