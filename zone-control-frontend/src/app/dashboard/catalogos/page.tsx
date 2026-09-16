'use client';

import React, { useState } from 'react';
import { Departamento, AreaRestringida } from '@/types';
import {
  Building2,
  ShieldCheck,
  Plus,
  Layers,
  CreditCard,
  AlertTriangle,
  QrCode,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const mockDeptos: Departamento[] = [
  { id: 1, codigo: 'PROD-01', nombre: 'Producción y Síntesis', descripcion: 'Área química de elaboración', activo: true },
  { id: 2, codigo: 'CAL-02', nombre: 'Control de Calidad', descripcion: 'Laboratorios de cromatografía y microbiología', activo: true },
  { id: 3, codigo: 'BIO-03', nombre: 'Bioseguridad y Esclusas', descripcion: 'Personal técnico de esterilización', activo: true },
];

const mockAreas: AreaRestringida[] = [
  { id: 1, codigo: 'ZONA-A', nombre: 'Laboratorio de Síntesis Molecular', nivelRiesgo: 'ALTO', descripcion: 'Presión negativa y esclusa hermética', activa: true },
  { id: 2, codigo: 'ZONA-B', nombre: 'Sala Limpia de Liofilización', nivelRiesgo: 'ALTO', descripcion: 'Grado A / ISO 5 para inyectables', activa: true },
  { id: 3, codigo: 'ZONA-C', nombre: 'Almacén Central de Materias Primas', nivelRiesgo: 'MEDIO', descripcion: 'Cuarentena de reactivos', activa: true },
];

export default function CatalogosPage() {
  const [deptos] = useState<Departamento[]>(mockDeptos);
  const [areas] = useState<AreaRestringida[]>(mockAreas);

  // Formulario vinculación de Carnet Físico Institucional
  const [rfidDoc, setRfidDoc] = useState('');
  const [nombreEmpleado, setNombreEmpleado] = useState('');
  const [rfidCodigo, setRfidCodigo] = useState('');
  const [tipoCarnet, setTipoCarnet] = useState('CHIP_RFID_NFC');
  const [rfidMsg, setRfidMsg] = useState('');

  const handleVincularTarjeta = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = rfidDoc.trim();
    const code = rfidCodigo.trim();

    setRfidMsg(`¡Carnet Institucional [${code}] vinculado y habilitado con éxito para el personal [Documento: ${doc}]!`);
    setTimeout(() => {
      setRfidMsg('');
      setRfidDoc('');
      setNombreEmpleado('');
      setRfidCodigo('');
    }, 4500);
  };

  const generarCodigoCarnet = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setRfidCodigo(`CARNET-XYZ-${randomNum}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-brand-dark">
          Catálogos de Zonas y Asignación de Carnets Institucionales
        </h1>
        <p className="text-xs text-brand-text/70 mt-1">
          Gestión de áreas restringidas, departamentos y vinculación del carnet físico inteligente (RFID/NFC) del personal (RF F-18, F-19).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Áreas Restringidas */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-brand-accent/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-brand-accent/20 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-primary" />
              <h3 className="font-heading font-bold text-sm text-brand-dark">Áreas y Zonas Restringidas</h3>
            </div>
            <span className="text-[11px] font-bold text-brand-primary bg-brand-secondary px-2.5 py-1 rounded-full">
              {areas.length} Zonas Activas
            </span>
          </div>

          <div className="space-y-3">
            {areas.map((area) => (
              <div key={area.id} className="p-4 rounded-2xl bg-brand-light/70 border border-brand-accent/30 space-y-1.5 transition-all hover:bg-brand-secondary/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-dark">{area.nombre}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      area.nivelRiesgo === 'ALTO'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : area.nivelRiesgo === 'MEDIO'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    Riesgo {area.nivelRiesgo}
                  </span>
                </div>
                <p className="text-[11px] text-brand-text/70 leading-relaxed">{area.descripcion}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-1">
                  <span>Código Zona: {area.codigo}</span>
                  <span className="text-emerald-700 font-semibold font-sans">● Esclusa Operativa</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario y Vista Previa del Carnet Físico */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card Mockup Visual del Carnet */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-secondary to-[#d5edd9] border border-brand-primary/30 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-brand-primary/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-brand-primary flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  Z
                </div>
                <span className="font-heading font-extrabold text-xs text-brand-dark tracking-tight">
                  CARNET DE IDENTIFICACIÓN Y ACCESO • LAB XYZ
                </span>
              </div>
              <QrCode className="w-5 h-5 text-brand-primary opacity-80" />
            </div>

            <div className="grid grid-cols-3 gap-3 items-center">
              <div className="w-16 h-20 bg-white/80 rounded-xl border border-brand-accent/60 flex flex-col items-center justify-center text-brand-primary/60">
                <UserCheck className="w-8 h-8 text-brand-primary" />
                <span className="text-[8px] font-bold text-brand-dark mt-1">FOTO</span>
              </div>

              <div className="col-span-2 space-y-1 text-xs">
                <p className="font-bold text-brand-dark text-sm leading-tight">
                  {nombreEmpleado || 'NOMBRE DEL EMPLEADO'}
                </p>
                <p className="text-[11px] text-brand-text/80 font-mono">
                  Doc: {rfidDoc || '••••••••••'}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-brand-primary border border-brand-accent/50">
                    {rfidCodigo || 'CHIP-RFID-NO-ASIGNADO'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de Asignación */}
          <div className="bg-white rounded-3xl p-6 border border-brand-accent/40 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-secondary text-brand-primary">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-brand-dark">Asignar / Troquelar Carnet Físico</h3>
                  <p className="text-[11px] text-brand-text/70">Enlazar chip de proximidad del carnet al empleado</p>
                </div>
              </div>

              <button
                type="button"
                onClick={generarCodigoCarnet}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary bg-brand-secondary px-2.5 py-1.5 rounded-xl hover:bg-brand-accent/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Autogenerar Chip
              </button>
            </div>

            {rfidMsg && (
              <div className="p-3.5 bg-emerald-50 text-emerald-900 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{rfidMsg}</span>
              </div>
            )}

            <form onSubmit={handleVincularTarjeta} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1">Nombre Completo del Personal</label>
                <input
                  type="text"
                  value={nombreEmpleado}
                  onChange={(e) => setNombreEmpleado(e.target.value)}
                  placeholder="Ej. Dr. Carlos Andrés Mendoza"
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-accent/60 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Documento de Identidad *</label>
                  <input
                    type="text"
                    required
                    value={rfidDoc}
                    onChange={(e) => setRfidDoc(e.target.value)}
                    placeholder="Ej. 1012345678"
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-accent/60 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">Código del Chip RFID/NFC *</label>
                  <input
                    type="text"
                    required
                    value={rfidCodigo}
                    onChange={(e) => setRfidCodigo(e.target.value)}
                    placeholder="Ej. CARNET-XYZ-901"
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-accent/60 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                Guardar y Activar Carnet Institucional
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
