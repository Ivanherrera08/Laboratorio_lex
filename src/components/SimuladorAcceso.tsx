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
      const data = res.data;

      // Construir perfil directamente desde los campos del backend
      // Buscar también en padrón local por si hay foto guardada
      const perfilLocal =
        tipoIdentificador === 'DOCUMENTO'
          ? empleadosPadron.find((emp) => emp.numeroDocumento === identificador.trim())
          : empleadosPadron.find((emp) => (emp.codigoTarjetaRfid || '').toLowerCase() === identificador.trim().toLowerCase());

      const perfilCompleto =
        nombreBackend && nombreBackend !== 'DESCONOCIDO'
          ? {
              id: perfilLocal?.id ?? 0,
              departamentoId: perfilLocal?.departamentoId ?? 0,
              tipoDocumento: data.tipoDocumento || perfilLocal?.tipoDocumento || 'CC',
              numeroDocumento: data.numeroDocumentoIngresado || identificador,
              nombres: perfilLocal?.nombres || nombreBackend.split(' ')[0] || nombreBackend,
              apellidos: perfilLocal?.apellidos || nombreBackend.split(' ').slice(1).join(' ') || '',
              correo: data.correo || perfilLocal?.correo || '',
              telefono: data.telefono || perfilLocal?.telefono || '',
              estado: data.estadoEmpleado || perfilLocal?.estado || 'ACTIVO',
              departamentoNombre: data.departamentoNombre || perfilLocal?.departamentoNombre || '',
              areaPrincipalNombre: data.nombreArea && data.nombreArea !== 'N/A' ? data.nombreArea : areaSeleccionada,
              fotoPerfil: perfilLocal?.fotoPerfil || undefined,
              codigoTarjetaRfid: data.codigoTarjetaRfid || perfilLocal?.codigoTarjetaRfid,
            }
          : undefined;

      setResultado({
        estado,
        motivo: data.motivo || data.mensaje,
        timestamp: timestampActual,
        areaConsultada: data.nombreArea && data.nombreArea !== 'N/A' ? data.nombreArea : areaSeleccionada,
        perfil: perfilCompleto,
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
        areaNombre: data.nombreArea && data.nombreArea !== 'N/A' ? data.nombreArea : areaSeleccionada,
        numeroDocumentoIngresado: tipoIdentificador === 'DOCUMENTO' ? identificador.trim() : '',
        codigoTarjetaIngresado: tipoIdentificador === 'RFID' ? identificador.trim() : undefined,
        resultadoAcceso: estado,
        motivoDenegacion: data.motivo || data.mensaje,
        empleadoNombreCompleto: (nombreBackend && nombreBackend !== 'DESCONOCIDO') ? nombreBackend : undefined,
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
      {/* ── ENCABEZADO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 leading-tight">Control de Acceso</h1>
            <p className="text-xs text-slate-500 mt-0.5">Valide credenciales RFID o documento en tiempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Sistema en línea
        </div>
      </div>

      {/* ── CARD PRINCIPAL UNIFICADA ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* ─ PANEL IZQUIERDO: Formulario ─ */}
          <div className="p-8 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-center gap-7">

            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Escanear Credencial</p>
              <p className="text-slate-500 text-xs leading-relaxed">Seleccione el tipo e ingrese el identificador para verificar el acceso al laboratorio.</p>
            </div>

            {/* Selector de tipo animado */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de credencial</p>
              <div className="relative flex bg-slate-100 rounded-xl p-1 gap-1">
                {(['DOCUMENTO', 'RFID'] as const).map((tipo) => (
                  <motion.button
                    key={tipo}
                    type="button"
                    layout
                    onClick={() => setTipoIdentificador(tipo)}
                    className={`relative flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors z-10 ${
                      tipoIdentificador === tipo ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tipoIdentificador === tipo && (
                      <motion.div
                        layoutId="pill"
                        className="absolute inset-0 rounded-lg bg-emerald-600 shadow-md shadow-emerald-600/30"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-1.5">
                      {tipo === 'DOCUMENTO' ? (
                        <><Building2 className="w-3.5 h-3.5" /> Documento ID</>
                      ) : (
                        <><ScanLine className="w-3.5 h-3.5" /> Tarjeta RFID</>
                      )}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input de credencial */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {tipoIdentificador === 'DOCUMENTO' ? 'Número de documento' : 'Código de carnet'}
                </p>
                <span className={`text-[10px] font-mono font-bold ${
                  identificador.length === (tipoIdentificador === 'DOCUMENTO' ? 10 : 15)
                    ? 'text-emerald-500' : 'text-slate-300'
                }`}>
                  {identificador.length}/{tipoIdentificador === 'DOCUMENTO' ? 10 : 15}
                </span>
              </div>
              <div className="relative group">
                <input
                  id="input-credencial"
                  type="text"
                  required
                  autoComplete="off"
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
                  placeholder={tipoIdentificador === 'DOCUMENTO' ? 'Ej. 1012345678' : 'Ej. crn-cnj-857'}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-sm tracking-widest focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-25 group-focus-within:opacity-70 transition-opacity">
                  <Fingerprint className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                {tipoIdentificador === 'DOCUMENTO' ? 'Solo números · Máx. 10 dígitos' : 'Formato: abc-xyz-123 · Máx. 15 chars'}
              </p>
            </div>

            {/* Botón de escaneo */}
            <motion.button
              type="button"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.975 }}
              onClick={handleSimular as any}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/15"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
              />
              <ScanLine className={`w-5 h-5 relative z-10 ${loading ? 'animate-spin' : ''}`} />
              <span className="relative z-10">{loading ? 'Analizando credencial...' : 'Escanear en Torniquete'}</span>
            </motion.button>
          </div>

          {/* ─ PANEL DERECHO: Resultado ─ */}
          <div className="flex flex-col justify-center min-h-[440px] bg-slate-50/50">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full p-12"
                >
                  <div className="relative flex items-center justify-center w-32 h-32 mb-6">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full border-2 border-emerald-400/50"
                        animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
                        style={{ width: 76, height: 76 }}
                      />
                    ))}
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center relative z-10">
                      <ScanLine className="w-8 h-8 text-emerald-600 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 tracking-widest font-mono">VALIDANDO...</p>
                  <p className="text-xs text-slate-400 mt-1.5">Consultando base de datos biométrica</p>
                </motion.div>

              ) : resultado ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 120 }}
                  className="p-7"
                >
                  {/* Badge de estado */}
                  <div className={`flex items-center gap-3 p-4 rounded-2xl mb-5 ${colors[resultado.estado].bg} border ${colors[resultado.estado].border}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[resultado.estado].iconBg} border ${colors[resultado.estado].border} flex-shrink-0`}>
                      {resultado.estado === 'AUTORIZADO' && <CheckCircle2 className={`w-5 h-5 ${colors[resultado.estado].icon}`} />}
                      {resultado.estado === 'DENEGADO' && <XCircle className={`w-5 h-5 ${colors[resultado.estado].icon}`} />}
                      {resultado.estado === 'NO_REGISTRADO' && <AlertCircle className={`w-5 h-5 ${colors[resultado.estado].icon}`} />}
                    </div>
                    <div>
                      <p className={`font-extrabold text-base leading-tight ${colors[resultado.estado].text}`}>
                        {resultado.estado === 'AUTORIZADO' ? 'Acceso Otorgado' : resultado.estado === 'DENEGADO' ? 'Acceso Denegado' : 'No Registrado'}
                      </p>
                      <p className={`text-xs mt-0.5 ${colors[resultado.estado].text} opacity-60`}>
                        {new Date(resultado.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Perfil completo */}
                  {resultado.perfil && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                    >
                      {/* Encabezado del perfil: foto + nombre */}
                      <div className={`flex items-center gap-4 p-4 ${colors[resultado.estado].bg} border-b ${colors[resultado.estado].border}`}>
                        <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/60 shadow-md flex-shrink-0 bg-slate-100 flex items-center justify-center">
                          {resultado.perfil.fotoPerfil
                            ? <img src={resultado.perfil.fotoPerfil} alt="Foto" className="w-full h-full object-cover" />
                            : <span className="text-3xl">👤</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-extrabold text-base leading-tight ${colors[resultado.estado].text} truncate`}>
                            {resultado.perfil.nombres} {resultado.perfil.apellidos}
                          </p>
                          {resultado.perfil.departamentoNombre && (
                            <p className={`text-xs mt-0.5 ${colors[resultado.estado].text} opacity-70 truncate`}>
                              {resultado.perfil.departamentoNombre}
                            </p>
                          )}
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/70 border ${colors[resultado.estado].border} ${colors[resultado.estado].icon}`}>
                            {resultado.perfil.estado}
                          </span>
                        </div>
                      </div>

                      {/* Grid de datos */}
                      <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Tipo Doc.</p>
                          <p className="font-bold text-slate-700">{resultado.perfil.tipoDocumento || 'CC'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">N° Documento</p>
                          <p className="font-mono font-bold text-slate-700">{resultado.perfil.numeroDocumento}</p>
                        </div>
                        {resultado.perfil.correo && (
                          <div className="col-span-2">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Correo</p>
                            <p className="font-medium text-slate-600 truncate">{resultado.perfil.correo}</p>
                          </div>
                        )}
                        {resultado.perfil.telefono && (
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Teléfono</p>
                            <p className="font-medium text-slate-600">{resultado.perfil.telefono}</p>
                          </div>
                        )}
                        <div className={resultado.perfil.telefono ? '' : 'col-span-2'}>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Área Autorizada</p>
                          <p className="font-semibold text-slate-700">{resultado.perfil.areaPrincipalNombre || resultado.areaConsultada}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Motivo */}
                  {resultado.motivo && (
                    <div className={`mt-4 p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-2 ${colors[resultado.estado].alertBg}`}>
                      {resultado.estado === 'AUTORIZADO'
                        ? <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
                        : <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span>{resultado.motivo}</span>
                    </div>
                  )}
                </motion.div>

              ) : (
                /* Idle state */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[440px] p-10 text-center"
                >
                  <div className="relative flex items-center justify-center w-28 h-28 mb-6">
                    {[0, 1].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full border border-dashed border-slate-200"
                        animate={{ rotate: i === 0 ? 360 : -360 }}
                        transition={{ duration: i === 0 ? 12 : 18, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 76 + i * 24, height: 76 + i * 24 }}
                      />
                    ))}
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center z-10">
                      <ScanLine className="w-7 h-7 text-slate-300" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-400">En espera de credencial</p>
                  <p className="text-xs text-slate-300 mt-1.5 max-w-[200px] leading-relaxed">
                    Ingrese un documento o carnet para verificar el acceso
                  </p>
                  <div className="flex items-center gap-4 mt-7 text-[10px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Biometría activa
                    </span>
                    <span className="w-px h-3 bg-slate-200" />
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      RFID en línea
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
