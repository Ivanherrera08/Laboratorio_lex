'use client';

import React, { useState } from 'react';
import { Departamento, AreaRestringida, Empleado } from '@/types';
import { agregarEmpleado } from '@/lib/personalStore';
import { toast } from 'sonner';
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
  Camera,
  Image as ImageIcon,
  Upload,
  Trash2,
  User,
} from 'lucide-react';

const mockDeptos: Departamento[] = [
  { id: 1, codigo: 'PROD-01', nombre: 'Producción y Síntesis', descripcion: 'Área química de elaboración', activo: true },
  { id: 2, codigo: 'CAL-02', nombre: 'Control de Calidad', descripcion: 'Laboratorios de cromatografía y microbiología', activo: true },
  { id: 3, codigo: 'BIO-03', nombre: 'Bioseguridad y Esclusas', descripcion: 'Personal técnico de esterilización', activo: true },
  { id: 4, codigo: 'ADM-04', nombre: 'Administración y Finanzas', descripcion: 'Oficinas centrales', activo: true },
];

const mockAreas: AreaRestringida[] = [
  { id: 1, codigo: 'ZONA-A', nombre: 'Laboratorio de Síntesis Molecular', nivelRiesgo: 'ALTO', descripcion: 'Presión negativa y esclusa hermética', activa: true },
  { id: 2, codigo: 'ZONA-B', nombre: 'Sala Limpia de Liofilización', nivelRiesgo: 'ALTO', descripcion: 'Grado A / ISO 5 para inyectables', activa: true },
  { id: 3, codigo: 'ZONA-C', nombre: 'Almacén Central de Materias Primas', nivelRiesgo: 'MEDIO', descripcion: 'Cuarentena de reactivos', activa: true },
  { id: 4, codigo: 'ZONA-D', nombre: 'Oficinas Administrativas', nivelRiesgo: 'BAJO', descripcion: 'Zonas comunes y despachos', activa: true },
];

export default function CatalogosPage() {
  const [deptos] = useState<Departamento[]>(mockDeptos);
  const [areas] = useState<AreaRestringida[]>(mockAreas);

  // Formulario vinculación y registro de empleado
  const [rfidDoc, setRfidDoc] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [rfidCodigo, setRfidCodigo] = useState('');
  const [deptoId, setDeptoId] = useState('1');
  const [areaId, setAreaId] = useState('1');
  
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoNombre, setFotoNombre] = useState('');
  const [errorCarnet, setErrorCarnet] = useState('');

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La fotografía no debe superar 2MB de tamaño.');
        return;
      }
      setFotoNombre(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEliminarFoto = () => {
    setFotoUrl(null);
    setFotoNombre('');
  };

  const handleCarnetCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value;
    if (valor.length <= 14) {
      setRfidCodigo(valor);
      if (valor.length > 0 && valor.length < 4) {
        setErrorCarnet('El número del carnet debe tener entre 4 y 14 caracteres.');
      } else {
        setErrorCarnet('');
      }
    }
  };

  const handleRegistrarYVincular = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = rfidDoc.trim();
    const code = rfidCodigo.trim();

    if (code.length > 14) {
      toast.error('El número de carnet no puede superar los 14 caracteres.');
      return;
    }

    if (!nombres || !apellidos || !doc || !code) {
      toast.error('Por favor completa los datos básicos obligatorios.');
      return;
    }

    const deptoObj = deptos.find(d => d.id === parseInt(deptoId));
    const areaObj = areas.find(a => a.id === parseInt(areaId));

    // Crear empleado completo para el store
    const nuevoEmpleado: Empleado = {
      id: 0, // Se autogenera en el store
      departamentoId: parseInt(deptoId),
      departamentoNombre: deptoObj?.nombre,
      areaPrincipalId: parseInt(areaId),
      areaPrincipalNombre: areaObj?.nombre,
      areasAutorizadas: areaObj ? [areaObj.nombre] : [],
      tipoDocumento: tipoDocumento,
      numeroDocumento: doc,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      correo: `${nombres.split(' ')[0].toLowerCase()}.${apellidos.split(' ')[0].toLowerCase()}@laboratorioxyz.com`,
      telefono: 'No registrado',
      codigoTarjetaRfid: code,
      estado: 'ACTIVO',
      fotoPerfil: fotoUrl || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      // Registrar en el Storage
      agregarEmpleado(nuevoEmpleado);
      toast.success(`Personal ${nombres} registrado y carnet ${code} vinculado.`);
      
      // Limpiar form
      setRfidDoc('');
      setNombres('');
      setApellidos('');
      setRfidCodigo('');
      handleEliminarFoto();
      setErrorCarnet('');
      
    } catch (err) {
      toast.error('Ocurrió un error al registrar al personal.');
    }
  };

  const generarCodigoCarnet = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setRfidCodigo(`CRN-XYZ-${randomNum}`);
    setErrorCarnet('');
  };

  const nombreCompletoDisplay = [nombres, apellidos].filter(Boolean).join(' ') || 'NOMBRE DEL EMPLEADO';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-brand-dark">
          Registro de Personal y Asignación de Carnets
        </h1>
        <p className="text-xs text-brand-text/70 mt-1">
          Alta de colaboradores, asignación a zonas restringidas y troquelado de chips de seguridad (RFID/NFC).
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Áreas Restringidas */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-6 border border-brand-accent/40 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-brand-accent/20 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-primary" />
              <h3 className="font-heading font-bold text-sm text-brand-dark">Zonas de Riesgo Biológico</h3>
            </div>
            <span className="text-[11px] font-bold text-brand-primary bg-brand-secondary px-2.5 py-1 rounded-full">
              {areas.length} Activas
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
        <div className="xl:col-span-7 space-y-6">
          {/* Card Mockup Visual del Carnet */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-secondary to-[#d5edd9] border border-brand-primary/30 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-brand-primary/20 pb-3 mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-brand-primary flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  Z
                </div>
                <span className="font-heading font-extrabold text-xs text-brand-dark tracking-tight">
                  CREDENCIAL DE ACCESO • LAB XYZ
                </span>
              </div>
              <QrCode className="w-5 h-5 text-brand-primary opacity-80" />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center relative z-10">
              {/* Recuadro de Fotografía Interactivo directamente en el Carnet */}
              <div className="relative">
                <label className="block w-28 h-32 bg-white rounded-2xl border-2 border-dashed border-brand-primary/60 hover:border-brand-primary shadow-sm flex flex-col items-center justify-center overflow-hidden cursor-pointer group transition-all transform hover:scale-102 active:scale-98 bg-gradient-to-b from-white to-brand-secondary/40">
                  {fotoUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-100 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fotoUrl}
                        alt="Foto del colaborador"
                        className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xs"
                      />
                      <div className="absolute inset-0 bg-brand-dark/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center rounded-xl">
                        <Camera className="w-5 h-5 mb-0.5 animate-bounce" />
                        <span className="text-[9px] font-bold">Cambiar Foto</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-brand-primary p-2 text-center">
                      <div className="p-2.5 rounded-full bg-brand-secondary group-hover:bg-brand-primary group-hover:text-white transition-all mb-1 shadow-xs">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold text-brand-dark group-hover:text-brand-primary transition-colors">
                        Subir Foto
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>

                {fotoUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarFoto();
                    }}
                    title="Eliminar foto"
                    className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-transform hover:scale-110 active:scale-90 cursor-pointer z-20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="col-span-2 space-y-2 text-xs pl-2">
                <div>
                  <p className="font-heading font-black text-brand-dark text-base leading-tight">
                    {nombreCompletoDisplay}
                  </p>
                  {areas.find(a => a.id === parseInt(areaId)) && (
                    <p className="text-[9px] font-bold text-emerald-700 uppercase mt-0.5">
                      {areas.find(a => a.id === parseInt(areaId))?.nombre}
                    </p>
                  )}
                </div>
                
                <p className="text-[11px] text-brand-text/80 font-mono">
                  {tipoDocumento}: {rfidDoc || '••••••••••'}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="px-2 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-brand-primary border border-brand-accent/50 shadow-2xs">
                    {rfidCodigo || 'CHIP-RFID-NO-ASIGNADO'}
                  </span>
                </div>
                {fotoUrl && <p className="text-[9px] text-emerald-700 font-bold flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3"/> Biometría vinculada</p>}
              </div>
            </div>
          </div>

          {/* Formulario Completo de Alta y Asignación */}
          <div className="bg-white rounded-3xl p-6 border border-brand-accent/40 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-brand-accent/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-secondary text-brand-primary">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-brand-dark">Ficha de Alta y Vinculación</h3>
                  <p className="text-[11px] text-brand-text/70">Registra al personal y asígnale su credencial física</p>
                </div>
              </div>

              <button
                type="button"
                onClick={generarCodigoCarnet}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary bg-brand-secondary border border-brand-accent/40 px-3 py-1.5 rounded-xl hover:bg-brand-accent/60 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Autogenerar RFID
              </button>
            </div>

            <form onSubmit={handleRegistrarYVincular} className="space-y-4">
              {/* Datos Personales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-brand-text/70 uppercase">Nombres</label>
                    <span className="text-[10px] font-medium text-brand-text/50">{nombres.length}/50</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Ej. Carlos Andrés"
                    maxLength={50}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-brand-text/70 uppercase">Apellidos</label>
                    <span className="text-[10px] font-medium text-brand-text/50">{apellidos.length}/50</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ej. Mendoza Pérez"
                    maxLength={50}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Identidad */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold text-brand-text/70 uppercase mb-1">Tipo</label>
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white"
                  >
                    <option value="CC">Cédula</option>
                    <option value="CE">Cédula Ext.</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-brand-text/70 uppercase">Núm. Documento</label>
                    <span className="text-[10px] font-medium text-brand-text/50">{rfidDoc.length}/12</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={rfidDoc}
                    onChange={(e) => setRfidDoc(e.target.value)}
                    placeholder="Ej. 1012345678"
                    maxLength={12}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Asignación Operativa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text/70 uppercase mb-1">Departamento</label>
                  <select
                    value={deptoId}
                    onChange={(e) => setDeptoId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white"
                  >
                    {deptos.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-text/70 uppercase mb-1">Zona Principal Asignada</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chip RFID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-brand-text/70 uppercase">Código del Carnet RFID *</label>
                  <span className="text-[10px] font-medium text-brand-text/50">{rfidCodigo.length}/14 máx.</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={rfidCodigo}
                  onChange={handleCarnetCodigoChange}
                  placeholder="Ej. CRN-XYZ-123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-primary/40 bg-brand-secondary/20 text-brand-primary text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
                {errorCarnet && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1">{errorCarnet}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                >
                  <CreditCard className="w-5 h-5" />
                  Registrar Personal y Activar Carnet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
