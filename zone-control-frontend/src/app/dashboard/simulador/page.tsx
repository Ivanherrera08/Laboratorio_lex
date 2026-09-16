'use client';

import React, { useState } from 'react';
import { ResultadoAcceso } from '@/types';
import { api } from '@/lib/api';
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  CreditCard,
  User,
  Clock,
} from 'lucide-react';

export default function SimuladorAccesoPage() {
  const [identificador, setIdentificador] = useState('');
  const [tipoIdentificador, setTipoIdentificador] = useState<'DOCUMENTO' | 'RFID'>('DOCUMENTO');
  const [areaId, setAreaId] = useState('1');
  const [loading, setLoading] = useState(false);

  // Resultado de la simulación
  const [resultado, setResultado] = useState<{
    estado: ResultadoAcceso;
    empleado?: string;
    area?: string;
    motivo?: string;
    timestamp: string;
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

    try {
      const res = await api.post('/accesos/simular', {
        identificador,
        tipoIdentificador,
        areaId: parseInt(areaId, 10),
      });

      setResultado({
        estado: res.data.resultado,
        empleado: res.data.empleado,
        area: res.data.area,
        motivo: res.data.motivo,
        timestamp: res.data.timestamp || new Date().toISOString(),
      });
    } catch (err: any) {
      // Mock para prueba local si no está corriendo el backend Spring Boot
      const areaSeleccionada = areasDemo.find((a) => a.id === areaId)?.nombre;

      if (identificador === '101' || identificador === 'RFID-001') {
        setResultado({
          estado: 'AUTORIZADO',
          empleado: 'Dr. Carlos Mendoza — Bioquímica Avanzada',
          area: areaSeleccionada,
          timestamp: new Date().toISOString(),
        });
      } else if (identificador === '102' || identificador === 'RFID-002') {
        setResultado({
          estado: 'DENEGADO',
          empleado: 'Ing. Laura Restrepo — Mantenimiento',
          area: areaSeleccionada,
          motivo: 'Permiso REVOCADO por auditoría de bioseguridad',
          timestamp: new Date().toISOString(),
        });
      } else {
        setResultado({
          estado: 'NO_REGISTRADO',
          motivo: 'El identificador no corresponde a ningún personal registrado en la base de datos',
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-brand-dark">Simulador de Control de Acceso Físico</h1>
        <p className="text-xs text-brand-text/70 mt-1">
          Validación en tiempo real de credenciales y registro inmutable en bitácora (FDA 21 CFR Part 11).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario de Simulación */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-brand-accent/40 shadow-xs space-y-6">
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
                placeholder={tipoIdentificador === 'DOCUMENTO' ? 'Ej. 101 (Autorizado), 102 (Denegado)' : 'Ej. RFID-001'}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-accent/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              {loading ? 'Consultando biometría...' : 'Simular Lectura de Acceso'}
            </button>
          </form>
        </div>

        {/* Semáforo / Tarjeta de Respuesta Visual */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {resultado ? (
            <div
              className={`rounded-3xl p-8 border text-center transition-all shadow-md ${
                resultado.estado === 'AUTORIZADO'
                  ? 'bg-emerald-50/80 border-[#4A9B8E] text-[#2E3D34]'
                  : resultado.estado === 'DENEGADO'
                  ? 'bg-red-50/80 border-[#E8A0A0] text-red-900'
                  : 'bg-amber-50/80 border-[#E8C687] text-amber-900'
              }`}
            >
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 shadow-xs"
                style={{
                  backgroundColor:
                    resultado.estado === 'AUTORIZADO'
                      ? '#4A9B8E'
                      : resultado.estado === 'DENEGADO'
                      ? '#E8A0A0'
                      : '#E8C687',
                }}
              >
                {resultado.estado === 'AUTORIZADO' && <CheckCircle2 className="w-8 h-8 text-white" />}
                {resultado.estado === 'DENEGADO' && <XCircle className="w-8 h-8 text-white" />}
                {resultado.estado === 'NO_REGISTRADO' && <AlertCircle className="w-8 h-8 text-white" />}
              </div>

              <span className="text-xs font-extrabold tracking-wider uppercase opacity-80">
                Resultado de Validación
              </span>
              <h3 className="text-2xl font-heading font-extrabold mt-1 mb-4">
                {resultado.estado === 'AUTORIZADO' && 'ACCESO PERMITIDO'}
                {resultado.estado === 'DENEGADO' && 'ACCESO DENEGADO'}
                {resultado.estado === 'NO_REGISTRADO' && 'PERSONA NO REGISTRADA'}
              </h3>

              <div className="bg-white/90 rounded-2xl p-4 text-left space-y-2 border border-black/5 text-xs">
                {resultado.empleado && (
                  <div className="flex items-center gap-2 text-brand-dark font-medium">
                    <User className="w-3.5 h-3.5 text-brand-primary" />
                    <span>{resultado.empleado}</span>
                  </div>
                )}
                {resultado.area && (
                  <div className="flex items-center gap-2 text-brand-dark">
                    <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                    <span>{resultado.area}</span>
                  </div>
                )}
                {resultado.motivo && (
                  <p className="text-red-700 font-medium pt-1 border-t border-gray-100">
                    <strong>Motivo:</strong> {resultado.motivo}
                  </p>
                )}
                <div className="flex items-center gap-2 text-gray-500 pt-1 text-[10px]">
                  <Clock className="w-3 h-3" />
                  <span>Marca de tiempo registrada: {new Date(resultado.timestamp).toLocaleString()}</span>
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
