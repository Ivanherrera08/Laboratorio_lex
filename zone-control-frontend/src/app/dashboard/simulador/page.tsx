'use client';

import React, { useState, useEffect } from 'react';
import { ResultadoAcceso, Empleado } from '@/types';
import { api } from '@/lib/api';
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
} from 'lucide-react';

export default function SimuladorAccesoPage() {
  const [identificador, setIdentificador] = useState('');
  const [tipoIdentificador, setTipoIdentificador] = useState<'DOCUMENTO' | 'RFID'>('DOCUMENTO');
  const [areaId, setAreaId] = useState('1');
  const [loading, setLoading] = useState(false);

  // Al montar: asegurar que los stores estén correctamente inicializados
  useEffect(() => {
    // Importación dinámica para evitar SSR issues
    import('@/lib/usuariosStore').then(({ getUsuariosSistema }) => {
      getUsuariosSistema(); // Inicializa el store si no existe
    });
    import('@/lib/personalStore').then(({ getEmpleados }) => {
      getEmpleados(); // Inicializa el store si no existe
    });
  }, []);

  // Resultado contiene el estado + perfil completo del empleado encontrado
  const [resultado, setResultado] = useState<{
    estado: ResultadoAcceso;
    motivo?: string;
    timestamp: string;
    areaConsultada?: string;
    perfil?: Empleado; // Perfil completo del empleado
  } | null>(null);

  const areasDemo = [
    { id: '1', nombre: 'Laboratorio de Síntesis Molecular (Área A - Alto Riesgo)' },
    { id: '2', nombre: 'Sala Limpia de Liofilización (Área B - Alto Riesgo)' },
    { id: '3', nombre: 'Almacén Central de Materias Primas (Área C - Medio Riesgo)' },
    { id: '4', nombre: 'Oficinas Administrativas de Calidad (Área D - Bajo Riesgo)' },
  ];

  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);

    const areaSeleccionada = areasDemo.find((a) => a.id === areaId)?.nombre ?? '';

    try {
      // Intenta llamar al backend Spring Boot
      const res = await api.post('/accesos/simular', {
        identificador,
        tipoIdentificador,
        areaId: parseInt(areaId, 10),
      });

      setResultado({
        estado: res.data.resultado,
        motivo: res.data.motivo,
        timestamp: res.data.timestamp || new Date().toISOString(),
        areaConsultada: areaSeleccionada,
      });
    } catch {
      // --- FALLBACK MOCK ---
      // ORDEN DE PRIORIDAD:
      // 1° Usuarios del Sistema (operadores registrados en la página de Usuarios) → PRIORIDAD MÁXIMA
      // 2° Personal de Laboratorio (empleados registrados en la página de Personal)
      const { buscarPorDocumento, buscarPorRfid } = await import('@/lib/personalStore');
      const { buscarUsuarioPorDocumento } = await import('@/lib/usuariosStore');

      let empleado = null;

      if (tipoIdentificador === 'DOCUMENTO') {
        // Primero verificar si es un USUARIO DEL SISTEMA (operador con login)
        const usuarioSistema = buscarUsuarioPorDocumento(identificador.trim());

        if (usuarioSistema) {
          // Es un operador del sistema → convertir y mostrar SU estado real (siempre desde usuariosStore)
          const rolLabel: Record<string, string> = {
            ADMINISTRADOR: 'Administrador del Sistema',
            GESTOR_PERSONAL: 'Gestor de Personal',
            SUPERVISOR_ACCESOS: 'Supervisor de Accesos',
          };

          // Mapeo de estados: UsuarioAuth → EstadoEmpleado
          const estadoMapeado =
            usuarioSistema.estado === 'ACTIVO'
              ? 'ACTIVO'
              : usuarioSistema.estado === 'BLOQUEADO'
              ? 'REVOCADO'
              : 'SUSPENDIDO'; // INACTIVO → SUSPENDIDO

          empleado = {
            id: usuarioSistema.id,
            departamentoId: 0,
            departamentoNombre: rolLabel[usuarioSistema.rol] || usuarioSistema.rol,
            areaPrincipalNombre: 'Oficinas Administrativas y Auditoría (Área D)',
            areasAutorizadas: ['Oficinas Administrativas y Auditoría (Área D)'],
            tipoDocumento: 'CC',
            numeroDocumento: usuarioSistema.documento,
            nombres: usuarioSistema.nombres,
            apellidos: usuarioSistema.apellidos,
            correo: usuarioSistema.correo,
            telefono: '—',
            codigoTarjetaRfid: undefined,
            estado: estadoMapeado as any,
          };
        } else {
          // No es operador del sistema → buscar en personal de laboratorio
          empleado = buscarPorDocumento(identificador.trim());
        }
      } else {
        // RFID: solo en el store de personal
        empleado = buscarPorRfid(identificador.trim());
      }

      if (!empleado) {
        setResultado({
          estado: 'NO_REGISTRADO',
          motivo: 'El identificador no corresponde a ningún personal registrado en la base de datos.',
          timestamp: new Date().toISOString(),
          areaConsultada: areaSeleccionada,
        });
      } else if (empleado.estado === 'REVOCADO') {
        setResultado({
          estado: 'DENEGADO',
          perfil: empleado,
          areaConsultada: areaSeleccionada,
          motivo: `Acceso REVOCADO. ${empleado.motivoCambioEstado || 'Credencial inhabilitada por auditoría de bioseguridad.'}`,
          timestamp: new Date().toISOString(),
        });
      } else if (empleado.estado === 'SUSPENDIDO') {
        setResultado({
          estado: 'DENEGADO',
          perfil: empleado,
          areaConsultada: areaSeleccionada,
          motivo: `Acceso SUSPENDIDO. ${empleado.motivoCambioEstado || 'Credencial temporalmente suspendida.'}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Estado ACTIVO → verificar permisos por área
        const areaBaseName = areaSeleccionada
          .replace(' (Alto Riesgo)', '')
          .replace(' (Medio Riesgo)', '')
          .replace(' (Bajo Riesgo)', '')
          .split('(')[0]
          .trim()
          .toLowerCase();

        const tieneAcceso =
          !areaBaseName ||
          (empleado.areasAutorizadas?.some((a) =>
            a.toLowerCase().includes(areaBaseName)
          ) ?? false);

        setResultado({
          estado: tieneAcceso ? 'AUTORIZADO' : 'DENEGADO',
          perfil: empleado,
          areaConsultada: areaSeleccionada,
          motivo: tieneAcceso
            ? undefined
            : `Sin autorización para esta área. Área principal asignada: ${empleado.areaPrincipalNombre}.`,
          timestamp: new Date().toISOString(),
        });
      }

    } finally {
      setLoading(false);
    }
  };

  const estadoColor = {
    AUTORIZADO: {
      bg: 'bg-emerald-50/80',
      border: 'border-[#4A9B8E]',
      text: 'text-[#2E3D34]',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: '#4A9B8E',
    },
    DENEGADO: {
      bg: 'bg-red-50/80',
      border: 'border-[#E8A0A0]',
      text: 'text-red-900',
      badge: 'bg-red-100 text-red-800 border-red-200',
      icon: '#E8A0A0',
    },
    NO_REGISTRADO: {
      bg: 'bg-amber-50/80',
      border: 'border-[#E8C687]',
      text: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: '#E8C687',
    },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-brand-dark">Simulador de Control de Acceso Físico</h1>
        <p className="text-xs text-brand-text/70 mt-1">
          Validación en tiempo real de credenciales y registro inmutable en bitácora (FDA 21 CFR Part 11).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario de Simulación */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-brand-accent/40 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-secondary text-brand-primary">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-brand-dark">Lector de Credenciales</h2>
              <p className="text-[11px] text-brand-text/70">Seleccione el área y digite la credencial simulada</p>
            </div>
          </div>

          <form onSubmit={handleSimular} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5">Área Restringida</label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              >
                {areasDemo.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5">Método de Identificación</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoIdentificador('DOCUMENTO')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    tipoIdentificador === 'DOCUMENTO'
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-brand-secondary/40 text-brand-text border-brand-accent/40'
                  }`}
                >
                  Documento ID
                </button>
                <button
                  type="button"
                  onClick={() => setTipoIdentificador('RFID')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    tipoIdentificador === 'RFID'
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-brand-secondary/40 text-brand-text border-brand-accent/40'
                  }`}
                >
                  Tarjeta RFID/NFC
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text mb-1.5">
                {tipoIdentificador === 'DOCUMENTO' ? 'Número de Documento' : 'Código de Tarjeta RFID'}
              </label>
              <input
                type="text"
                required
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder={
                  tipoIdentificador === 'DOCUMENTO'
                    ? 'Ej. 1012345678'
                    : 'Ej. RFID-001'
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-accent/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
              <p className="text-[10px] text-brand-text/50 mt-1">
                Ingrese el número exactamente como fue registrado en el sistema.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <ScanLine className="w-4 h-4" />
              {loading ? 'Consultando biometría...' : 'Simular Lectura de Acceso'}
            </button>
          </form>
        </div>

        {/* Panel de Resultado */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {resultado ? (
            <div
              className={`rounded-3xl border overflow-hidden shadow-md transition-all ${
                estadoColor[resultado.estado].bg
              } ${estadoColor[resultado.estado].border}`}
            >
              {/* Banner de resultado */}
              <div className="p-6 text-center">
                <div
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3 shadow-xs"
                  style={{ backgroundColor: estadoColor[resultado.estado].icon }}
                >
                  {resultado.estado === 'AUTORIZADO' && <CheckCircle2 className="w-7 h-7 text-white" />}
                  {resultado.estado === 'DENEGADO' && <XCircle className="w-7 h-7 text-white" />}
                  {resultado.estado === 'NO_REGISTRADO' && <AlertCircle className="w-7 h-7 text-white" />}
                </div>
                <span className={`text-[10px] font-extrabold tracking-widest uppercase ${estadoColor[resultado.estado].text}`}>
                  Resultado de Validación
                </span>
                <h3 className={`text-xl font-heading font-extrabold mt-0.5 ${estadoColor[resultado.estado].text}`}>
                  {resultado.estado === 'AUTORIZADO' && 'ACCESO PERMITIDO'}
                  {resultado.estado === 'DENEGADO' && 'ACCESO DENEGADO'}
                  {resultado.estado === 'NO_REGISTRADO' && 'PERSONA NO REGISTRADA'}
                </h3>
              </div>

              {/* Perfil del empleado (si fue encontrado) */}
              {resultado.perfil && (
                <div className="bg-white/95 mx-4 mb-4 rounded-2xl border border-black/5 overflow-hidden shadow-xs">
                  {/* Cabecera del perfil con foto */}
                  <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                    {/* Foto de perfil */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-accent/40 bg-brand-secondary/30 flex items-center justify-center shrink-0 shadow-xs">
                      {resultado.perfil.fotoPerfil ? (
                        <img
                          src={resultado.perfil.fotoPerfil}
                          alt={`${resultado.perfil.nombres} ${resultado.perfil.apellidos}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">👤</span>
                      )}
                    </div>

                    {/* Nombre y estado */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-extrabold text-brand-dark truncate">
                        {resultado.perfil.nombres} {resultado.perfil.apellidos}
                      </p>
                      <p className="text-[11px] text-brand-text/60 truncate">{resultado.perfil.departamentoNombre}</p>
                      {/* Badge de estado */}
                      <span
                        className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          resultado.perfil.estado === 'ACTIVO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : resultado.perfil.estado === 'REVOCADO'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {resultado.perfil.estado === 'ACTIVO' && <ShieldCheck className="w-3 h-3" />}
                        {resultado.perfil.estado === 'REVOCADO' && <ShieldOff className="w-3 h-3" />}
                        {resultado.perfil.estado === 'SUSPENDIDO' && <ShieldAlert className="w-3 h-3" />}
                        {resultado.perfil.estado}
                      </span>
                    </div>
                  </div>

                  {/* Datos del perfil */}
                  <div className="p-4 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-brand-text/80">
                        <CreditCard className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span className="font-mono font-bold text-brand-dark">
                          {resultado.perfil.tipoDocumento} {resultado.perfil.numeroDocumento}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-text/80">
                        <Phone className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span>{resultado.perfil.telefono}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-brand-text/80">
                      <Mail className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span className="truncate">{resultado.perfil.correo}</span>
                    </div>

                    <div className="flex items-center gap-2 text-brand-text/80">
                      <Building2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span className="text-brand-dark font-medium">{resultado.perfil.areaPrincipalNombre}</span>
                    </div>

                    {resultado.perfil.codigoTarjetaRfid && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                        <span className="font-mono text-[11px] bg-brand-secondary px-2 py-0.5 rounded-md border border-brand-accent/40 text-brand-primary font-bold">
                          {resultado.perfil.codigoTarjetaRfid}
                        </span>
                      </div>
                    )}

                    {/* Áreas autorizadas */}
                    {resultado.perfil.areasAutorizadas && resultado.perfil.areasAutorizadas.length > 0 && (
                      <div className="pt-1 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-brand-text/60 mb-1">ÁREAS AUTORIZADAS:</p>
                        <div className="flex flex-wrap gap-1">
                          {resultado.perfil.areasAutorizadas.map((area) => (
                            <span
                              key={area}
                              className="px-1.5 py-0.5 rounded-md bg-brand-secondary text-[9px] font-semibold text-brand-text border border-brand-accent/40"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Motivo de denegación */}
                    {resultado.motivo && (
                      <div className="pt-1 border-t border-gray-100">
                        <p className="text-red-700 font-medium text-[11px]">
                          <strong>⚠ Motivo:</strong> {resultado.motivo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Caso NO_REGISTRADO: solo muestra el motivo */}
              {resultado.estado === 'NO_REGISTRADO' && resultado.motivo && (
                <div className="bg-white/90 mx-4 mb-4 rounded-2xl p-4 border border-amber-100 text-xs">
                  <p className="text-amber-800 font-medium">
                    <strong>Motivo:</strong> {resultado.motivo}
                  </p>
                </div>
              )}

              {/* Timestamp */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Marca de tiempo: {new Date(resultado.timestamp).toLocaleString()}</span>
                  {resultado.areaConsultada && (
                    <span className="ml-auto text-[9px] text-brand-text/50 truncate max-w-[140px]">
                      {resultado.areaConsultada}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl p-12 bg-brand-secondary/40 border border-dashed border-brand-accent/60 text-center">
              <ScanLine className="w-12 h-12 text-brand-primary/40 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-heading font-bold text-brand-text/70">Esperando Lectura</h3>
              <p className="text-xs text-brand-text/50 max-w-xs mx-auto mt-1">
                Ingrese los parámetros en el panel izquierdo para simular el paso por el torniquete/esclusa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
