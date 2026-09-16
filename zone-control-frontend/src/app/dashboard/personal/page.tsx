'use client';

import React, { useState } from 'react';
import { Empleado, EstadoEmpleado } from '@/types';
import { useNotifications } from '@/context/NotificationContext';
import {
  Users,
  Search,
  Plus,
  Filter,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  CreditCard,
  Sparkles,
  Check,
  ShieldCheck,
  Award,
  X,
  FlaskConical,
  Microscope,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';

export interface CatalogoAreaLab {
  id: number;
  codigo: string;
  nombre: string;
  deptoAsociado: string;
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
}

const catalogoLaboratoriosAreas: CatalogoAreaLab[] = [
  { id: 1, codigo: 'LAB-01', nombre: 'Laboratorio de Síntesis Molecular (Área A)', deptoAsociado: 'Producción y Síntesis', nivelRiesgo: 'ALTO' },
  { id: 2, codigo: 'LAB-02', nombre: 'Sala Limpia de Liofilización e Inyectables (Área B)', deptoAsociado: 'Producción y Síntesis', nivelRiesgo: 'ALTO' },
  { id: 3, codigo: 'LAB-03', nombre: 'Laboratorio de Cromatografía y Espectrometría', deptoAsociado: 'Control de Calidad', nivelRiesgo: 'ALTO' },
  { id: 4, codigo: 'LAB-04', nombre: 'Laboratorio de Microbiología y Cultivos Celulares', deptoAsociado: 'Control de Calidad', nivelRiesgo: 'ALTO' },
  { id: 5, codigo: 'ALM-01', nombre: 'Almacén Central de Materias Primas y Reactivos (Área C)', deptoAsociado: 'Bioseguridad y Mantenimiento', nivelRiesgo: 'MEDIO' },
  { id: 6, codigo: 'ESC-01', nombre: 'Esclusa de Desinfección y Cuarentena', deptoAsociado: 'Bioseguridad y Mantenimiento', nivelRiesgo: 'ALTO' },
  { id: 7, codigo: 'ADM-01', nombre: 'Oficinas Administrativas y Auditoría (Área D)', deptoAsociado: 'Control de Calidad', nivelRiesgo: 'BAJO' },
];

const mockEmpleados: Empleado[] = [
  {
    id: 1,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    areaPrincipalId: 1,
    areaPrincipalNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    areasAutorizadas: ['Laboratorio de Síntesis Molecular (Área A)', 'Sala Limpia de Liofilización e Inyectables (Área B)'],
    tipoDocumento: 'CC',
    numeroDocumento: '1012345678',
    nombres: 'Carlos Andrés',
    apellidos: 'Mendoza Pérez',
    correo: 'carlos.mendoza@laboratorioxyz.com',
    telefono: '3109988776',
    codigoTarjetaRfid: 'RFID-001',
    estado: 'ACTIVO',
  },
  {
    id: 2,
    departamentoId: 2,
    departamentoNombre: 'Control de Calidad',
    areaPrincipalId: 3,
    areaPrincipalNombre: 'Laboratorio de Cromatografía y Espectrometría',
    areasAutorizadas: ['Laboratorio de Cromatografía y Espectrometría'],
    tipoDocumento: 'CC',
    numeroDocumento: '1087654321',
    nombres: 'Laura Sofía',
    apellidos: 'Restrepo Villa',
    correo: 'laura.restrepo@laboratorioxyz.com',
    telefono: '3201123344',
    codigoTarjetaRfid: 'RFID-002',
    estado: 'REVOCADO',
    motivoCambioEstado: 'Finalización de contrato temporal y auditoría de seguridad.',
  },
  {
    id: 3,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    areaPrincipalId: 2,
    areaPrincipalNombre: 'Sala Limpia de Liofilización e Inyectables (Área B)',
    areasAutorizadas: ['Sala Limpia de Liofilización e Inyectables (Área B)'],
    tipoDocumento: 'CE',
    numeroDocumento: '98765432',
    nombres: 'Guillermo',
    apellidos: 'Von Hassen',
    correo: 'guillermo.von@laboratorioxyz.com',
    telefono: '3154432211',
    codigoTarjetaRfid: 'RFID-003',
    estado: 'SUSPENDIDO',
    motivoCambioEstado: 'Incumplimiento de protocolo de esterilidad en esclusa.',
  },
];

export default function GestionPersonalPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>(mockEmpleados);
  const [busqueda, setBusqueda] = useState('');
  const [deptoFiltro, setDeptoFiltro] = useState('TODOS');
  const [areaFiltro, setAreaFiltro] = useState('TODAS');

  // Modales
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);

  // Formulario con validaciones estrictas requeridas
  const [nuevoDoc, setNuevoDoc] = useState('');
  const [nuevoTipoDoc, setNuevoTipoDoc] = useState('CC');
  const [nuevosNombres, setNuevosNombres] = useState('');
  const [nuevosApellidos, setNuevosApellidos] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoDepto, setNuevoDepto] = useState('Producción y Síntesis');
  const [nuevoLaboratorioPrincipal, setNuevoLaboratorioPrincipal] = useState('Laboratorio de Síntesis Molecular (Área A)');
  const [areasPermitidas, setAreasPermitidas] = useState<string[]>(['Laboratorio de Síntesis Molecular (Área A)']);
  const [showDropdownAreas, setShowDropdownAreas] = useState<boolean>(false);
  const [nuevoRfid, setNuevoRfid] = useState('');

  const { agregarNotificacion } = useNotifications();

  // Modal de Éxito Dinámico y Animado
  const [showExitoModal, setShowExitoModal] = useState(false);
  const [empleadoCreado, setEmpleadoCreado] = useState<Empleado | null>(null);

  // Errores de validación en tiempo real
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  // Formulario de estado
  const [nuevoEstado, setNuevoEstado] = useState<EstadoEmpleado>('ACTIVO');
  const [motivoEstado, setMotivoEstado] = useState('');

  // Validación de Nombres: Solo letras, espacios, tildes y ñ (Sin números ni signos)
  const handleNombresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const sanitized = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setNuevosNombres(sanitized);

    if (valor !== sanitized) {
      setErroresForm((prev) => ({ ...prev, nombres: 'El nombre solo debe contener letras (sin números ni signos).' }));
    } else {
      setErroresForm((prev) => {
        const c = { ...prev };
        delete c.nombres;
        return c;
      });
    }
  };

  // Validación de Apellidos: Solo letras, espacios, tildes y ñ (Sin números ni signos)
  const handleApellidosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const sanitized = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    setNuevosApellidos(sanitized);

    if (valor !== sanitized) {
      setErroresForm((prev) => ({ ...prev, apellidos: 'El apellido solo debe contener letras (sin números ni signos).' }));
    } else {
      setErroresForm((prev) => {
        const c = { ...prev };
        delete c.apellidos;
        return c;
      });
    }
  };

  // Manejo de Documento: Máximo 12 dígitos si es CC/Numérico
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 12) {
      setNuevoDoc(valor);
      if (valor.length < 6 && valor.length > 0) {
        setErroresForm((prev) => ({ ...prev, doc: 'La cédula debe contener entre 6 y 12 dígitos.' }));
      } else {
        setErroresForm((prev) => {
          const c = { ...prev };
          delete c.doc;
          return c;
        });
      }
    }
  };

  // Manejo de Teléfono Celular: Máximo 10 dígitos numéricos
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 10) {
      setNuevoTelefono(valor);
      if (valor.length !== 10 && valor.length > 0) {
        setErroresForm((prev) => ({ ...prev, tel: 'El número de celular debe tener exactamente 10 dígitos.' }));
      } else {
        setErroresForm((prev) => {
          const c = { ...prev };
          delete c.tel;
          return c;
        });
      }
    }
  };

  // Manejo de Correo Institucional
  const handleCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setNuevoCorreo(valor);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (valor && !emailRegex.test(valor)) {
      setErroresForm((prev) => ({ ...prev, email: 'Formato de correo electrónico institucional inválido.' }));
    } else {
      setErroresForm((prev) => {
        const c = { ...prev };
        delete c.email;
        return c;
      });
    }
  };

  // Manejo de Código de Carnet / RFID: Máximo 14 caracteres
  const handleRfidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (valor.length <= 14) {
      setNuevoRfid(valor);
      if (valor.length > 0 && valor.length < 4) {
        setErroresForm((prev) => ({ ...prev, rfid: 'El número de carnet debe tener entre 4 y 14 caracteres.' }));
      } else {
        setErroresForm((prev) => {
          const c = { ...prev };
          delete c.rfid;
          return c;
        });
      }
    }
  };

  const handleToggleArea = (areaNombre: string) => {
    setAreasPermitidas((prev) =>
      prev.includes(areaNombre)
        ? prev.length > 1
          ? prev.filter((a) => a !== areaNombre)
          : prev
        : [...prev, areaNombre]
    );
  };

  const handleDeptoChange = (depto: string) => {
    setNuevoDepto(depto);
    const primerLabDelDepto = catalogoLaboratoriosAreas.find((l) => l.deptoAsociado === depto);
    if (primerLabDelDepto) {
      setNuevoLaboratorioPrincipal(primerLabDelDepto.nombre);
      setAreasPermitidas([primerLabDelDepto.nombre]);
    }
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    const coincideTexto =
      emp.numeroDocumento.includes(busqueda) ||
      `${emp.nombres} ${emp.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (emp.areaPrincipalNombre && emp.areaPrincipalNombre.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideDepto = deptoFiltro === 'TODOS' || emp.departamentoNombre === deptoFiltro;
    const coincideArea =
      areaFiltro === 'TODAS' ||
      emp.areaPrincipalNombre === areaFiltro ||
      (emp.areasAutorizadas && emp.areasAutorizadas.includes(areaFiltro));

    return coincideTexto && coincideDepto && coincideArea;
  });

  const handleRegistrarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevosNombres.trim() || !nuevosApellidos.trim()) {
      alert('Error: Debe ingresar nombres y apellidos válidos (solo letras).');
      return;
    }

    if (nuevoDoc.length < 6 || nuevoDoc.length > 12) {
      alert('Error: La cédula debe tener entre 6 y 12 dígitos.');
      return;
    }

    if (nuevoTelefono.length !== 10) {
      alert('Error: El celular debe contener exactamente 10 dígitos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nuevoCorreo)) {
      alert('Error: Ingrese un correo electrónico válido (ejemplo: usuario@laboratorioxyz.com).');
      return;
    }

    const existe = empleados.some((emp) => emp.numeroDocumento === nuevoDoc);
    if (existe) {
      alert('Error: Ya existe un empleado registrado con este número de cédula.');
      return;
    }

    const labObj = catalogoLaboratoriosAreas.find((l) => l.nombre === nuevoLaboratorioPrincipal);

    const nuevo: Empleado = {
      id: Date.now(),
      departamentoId: nuevoDepto === 'Producción y Síntesis' ? 1 : nuevoDepto === 'Control de Calidad' ? 2 : 3,
      departamentoNombre: nuevoDepto,
      areaPrincipalId: labObj ? labObj.id : 1,
      areaPrincipalNombre: nuevoLaboratorioPrincipal,
      areasAutorizadas: areasPermitidas.length > 0 ? areasPermitidas : [nuevoLaboratorioPrincipal],
      tipoDocumento: nuevoTipoDoc,
      numeroDocumento: nuevoDoc,
      nombres: nuevosNombres.trim(),
      apellidos: nuevosApellidos.trim(),
      correo: nuevoCorreo.trim().toLowerCase(),
      telefono: nuevoTelefono,
      codigoTarjetaRfid: nuevoRfid.trim() ? nuevoRfid.trim() : `CRN-XYZ-${Math.floor(100000 + Math.random() * 900000)}`,
      estado: 'ACTIVO',
    };

    setEmpleados([nuevo, ...empleados]);
    setEmpleadoCreado(nuevo);

    // Notificación en el sistema global
    agregarNotificacion({
      titulo: `👤 Alta de Personal: ${nuevo.nombres} ${nuevo.apellidos}`,
      mensaje: `Asignado a [${nuevo.areaPrincipalNombre}] (${nuevo.departamentoNombre}) con carnet [${nuevo.codigoTarjetaRfid}].`,
      tipo: 'PERSONAL',
      rolesDestino: ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
      accionUrl: '/dashboard/personal',
    });

    // Limpiar formulario y cerrar modal de registro para abrir el modal dinámico de éxito
    setNuevoDoc('');
    setNuevosNombres('');
    setNuevosApellidos('');
    setNuevoCorreo('');
    setNuevoTelefono('');
    setNuevoRfid('');
    setAreasPermitidas([catalogoLaboratoriosAreas[0].nombre]);
    setNuevoLaboratorioPrincipal(catalogoLaboratoriosAreas[0].nombre);
    setErroresForm({});
    setShowRegistrarModal(false);
    setShowExitoModal(true);
  };

  const handleAbrirCambioEstado = (emp: Empleado) => {
    setEmpleadoSeleccionado(emp);
    setNuevoEstado(emp.estado);
    setMotivoEstado(emp.motivoCambioEstado || '');
    setShowEstadoModal(true);
  };

  const handleGuardarEstado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleadoSeleccionado) return;

    if ((nuevoEstado === 'REVOCADO' || nuevoEstado === 'SUSPENDIDO') && !motivoEstado.trim()) {
      alert('Es obligatorio ingresar el motivo técnico/administrativo del cambio de estado.');
      return;
    }

    setEmpleados((prev) =>
      prev.map((emp) =>
        emp.id === empleadoSeleccionado.id
          ? { ...emp, estado: nuevoEstado, motivoCambioEstado: motivoEstado }
          : emp
      )
    );

    alert(`Estado de ${empleadoSeleccionado.nombres} actualizado a ${nuevoEstado} y registrado en auditoría.`);
    setShowEstadoModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-brand-dark">Gestión del Personal Autorizado</h1>
          <p className="text-xs text-brand-text/70 mt-1">
            Administración de empleados, asignación de biometría y control de estados (RF F-11 a F-17).
          </p>
        </div>

        <button
          onClick={() => setShowRegistrarModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Registrar Empleado
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-brand-accent/40 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-text/50 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-accent/60 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-brand-primary" />
            <select
              value={deptoFiltro}
              onChange={(e) => setDeptoFiltro(e.target.value)}
              className="px-3 py-2 rounded-xl border border-brand-accent/60 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            >
              <option value="TODOS">Todos los Deptos</option>
              <option value="Producción y Síntesis">Producción y Síntesis</option>
              <option value="Control de Calidad">Control de Calidad</option>
              <option value="Bioseguridad y Mantenimiento">Bioseguridad y Mantenimiento</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-brand-primary" />
            <select
              value={areaFiltro}
              onChange={(e) => setAreaFiltro(e.target.value)}
              className="px-3 py-2 rounded-xl border border-brand-accent/60 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 max-w-[210px] truncate"
            >
              <option value="TODAS">Todos los Laboratorios/Zonas</option>
              {catalogoLaboratoriosAreas.map((lab) => (
                <option key={lab.id} value={lab.nombre}>
                  {lab.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-white rounded-2xl border border-brand-accent/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-secondary/70 border-b border-brand-accent/30 text-brand-dark font-bold">
              <tr>
                <th className="p-4">Cédula (Máx 12)</th>
                <th className="p-4">Nombres y Apellidos</th>
                <th className="p-4">Departamento / Laboratorio</th>
                <th className="p-4">Celular (10 d.)</th>
                <th className="p-4">Credencial RFID</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/20">
              {empleadosFiltrados.map((emp) => (
                <tr key={emp.id} className="hover:bg-brand-light/60 transition-colors">
                  <td className="p-4 font-semibold text-brand-dark">
                    {emp.numeroDocumento}{' '}
                    <span className="text-[10px] text-gray-500 font-normal">({emp.tipoDocumento})</span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-brand-dark">{emp.nombres} {emp.apellidos}</p>
                    <p className="text-[11px] text-brand-text/60">{emp.correo}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-brand-dark">{emp.departamentoNombre}</p>
                    <p className="text-[10.5px] text-brand-primary font-medium flex items-center gap-1 mt-0.5">
                      <FlaskConical className="w-3 h-3 shrink-0" />
                      {emp.areaPrincipalNombre || 'Laboratorio de Síntesis Molecular'}
                    </p>
                    {emp.areasAutorizadas && emp.areasAutorizadas.length > 1 && (
                      <span className="inline-block text-[9px] bg-brand-secondary text-brand-text/80 px-1.5 py-0.2 rounded mt-1 font-medium">
                        +{emp.areasAutorizadas.length - 1} áreas autorizadas
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-gray-600">{emp.telefono}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md bg-brand-secondary font-mono text-[11px] text-brand-primary font-bold border border-brand-accent/40">
                      {emp.codigoTarjetaRfid || 'SIN_VINCULAR'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        emp.estado === 'ACTIVO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : emp.estado === 'REVOCADO'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {emp.estado === 'ACTIVO' && <CheckCircle className="w-3 h-3" />}
                      {emp.estado === 'REVOCADO' && <XCircle className="w-3 h-3" />}
                      {emp.estado === 'SUSPENDIDO' && <Clock className="w-3 h-3" />}
                      {emp.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleAbrirCambioEstado(emp)}
                      className="px-3 py-1.5 rounded-lg bg-brand-secondary hover:bg-brand-accent/30 text-brand-dark font-semibold text-[11px] transition-all cursor-pointer"
                    >
                      Cambiar Estado / Permisos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTRAR NUEVO EMPLEADO CON REGLAS DE VALIDACIÓN */}
      {showRegistrarModal && (
        <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-brand-accent/40 animate-slide-down my-auto relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 mb-4 border-b border-brand-accent/30 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-secondary text-brand-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-brand-dark">Registrar Nuevo Empleado Autorizado</h3>
                  <p className="text-xs text-brand-text/70">Nombres/Apellidos (solo letras), Cédula (máx 12), Celular (máx 10)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegistrarModal(false)}
                className="p-1.5 rounded-xl hover:bg-brand-secondary text-brand-text/60 hover:text-brand-dark transition-colors"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegistrarEmpleado} className="space-y-3.5 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Tipo Doc.</label>
                  <select
                    value={nuevoTipoDoc}
                    onChange={(e) => setNuevoTipoDoc(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-brand-accent/60 text-xs bg-white font-medium"
                  >
                    <option value="CC">CC (Cédula)</option>
                    <option value="CE">CE (Extranjería)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-brand-text">Cédula * (Máx 12 dígitos)</label>
                    <span className="text-[10px] font-mono text-brand-primary">{nuevoDoc.length}/12</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={nuevoDoc}
                    onChange={handleDocChange}
                    placeholder="Ej. 1020304050"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 ${
                      erroresForm.doc ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                    }`}
                  />
                  {erroresForm.doc && <p className="text-[10px] text-red-600 font-semibold mt-0.5">{erroresForm.doc}</p>}
                </div>
              </div>

              {/* Nombres y Apellidos estrictamente solo letras */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">
                    Nombres * <span className="text-gray-400 font-normal">(Solo letras)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevosNombres}
                    onChange={handleNombresChange}
                    placeholder="Ej. Roberto Carlos"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      erroresForm.nombres ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                    }`}
                  />
                  {erroresForm.nombres && <p className="text-[10px] text-red-600 font-semibold mt-0.5">{erroresForm.nombres}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">
                    Apellidos * <span className="text-gray-400 font-normal">(Solo letras)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevosApellidos}
                    onChange={handleApellidosChange}
                    placeholder="Ej. Gómez Pérez"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      erroresForm.apellidos ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                    }`}
                  />
                  {erroresForm.apellidos && <p className="text-[10px] text-red-600 font-semibold mt-0.5">{erroresForm.apellidos}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Correo Institucional *</label>
                  <input
                    type="email"
                    required
                    value={nuevoCorreo}
                    onChange={handleCorreoChange}
                    placeholder="r.gomez@laboratorioxyz.com"
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                      erroresForm.email ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                    }`}
                  />
                  {erroresForm.email && <p className="text-[10px] text-red-600 font-semibold mt-0.5">{erroresForm.email}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-brand-text">Celular * (10 dígitos)</label>
                    <span className="text-[10px] font-mono text-brand-primary">{nuevoTelefono.length}/10</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={nuevoTelefono}
                    onChange={handleTelefonoChange}
                    placeholder="3001234567"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 ${
                      erroresForm.tel ? 'border-red-400 focus:ring-red-200 bg-red-50/40' : 'border-brand-accent/60 focus:ring-brand-primary/40'
                    }`}
                  />
                  {erroresForm.tel && <p className="text-[10px] text-red-600 font-semibold mt-0.5">{erroresForm.tel}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">Departamento</label>
                  <select
                    value={nuevoDepto}
                    onChange={(e) => handleDeptoChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  >
                    <option value="Producción y Síntesis">Producción y Síntesis</option>
                    <option value="Control de Calidad">Control de Calidad</option>
                    <option value="Bioseguridad y Mantenimiento">Bioseguridad y Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-brand-text">Código / N° Carnet</label>
                    <span className="text-[9px] text-gray-500 font-medium">{nuevoRfid.length}/14 máx.</span>
                  </div>
                  <input
                    type="text"
                    maxLength={14}
                    value={nuevoRfid}
                    onChange={handleRfidChange}
                    placeholder="Ej. CRN-XYZ-901"
                    className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs font-mono font-bold"
                  />
                  {erroresForm.rfid && (
                    <p className="text-[10px] text-red-600 font-semibold mt-1">{erroresForm.rfid}</p>
                  )}
                </div>
              </div>

              {/* Selector de Laboratorio / Área Principal */}
              <div>
                <label className="block text-[11px] font-bold text-brand-text mb-1">
                  Laboratorio / Área Principal de Trabajo *
                </label>
                <div className="relative">
                  <select
                    value={nuevoLaboratorioPrincipal}
                    onChange={(e) => {
                      const sel = e.target.value;
                      setNuevoLaboratorioPrincipal(sel);
                      if (!areasPermitidas.includes(sel)) {
                        setAreasPermitidas((prev) => [...prev, sel]);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-brand-accent/60 text-xs bg-white font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  >
                    {catalogoLaboratoriosAreas.map((lab) => (
                      <option key={lab.id} value={lab.nombre}>
                        [{lab.codigo}] {lab.nombre} — (Riesgo {lab.nivelRiesgo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selector Dinámico Desplegable de Zonas y Laboratorios Autorizados (RF F-21) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-brand-text flex items-center gap-1.5">
                    <Microscope className="w-3.5 h-3.5 text-brand-primary" />
                    Zonas y Laboratorios con Acceso Autorizado (RFID)
                  </label>
                  <span className="text-[10px] font-bold text-brand-primary bg-brand-secondary px-2 py-0.5 rounded-full border border-brand-accent/40">
                    {areasPermitidas.length} de {catalogoLaboratoriosAreas.length} seleccionada(s)
                  </span>
                </div>

                {/* Botón trigger del dropdown desplegable */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdownAreas(!showDropdownAreas)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 bg-white hover:border-brand-primary text-xs font-medium text-left flex items-center justify-between shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  >
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span className="truncate text-brand-dark font-medium">
                        {areasPermitidas.length === 0
                          ? 'Haga clic para autorizar laboratorios...'
                          : areasPermitidas.length === 1
                          ? `${areasPermitidas[0]} (1 laboratorio)`
                          : `${areasPermitidas[0]} (+${areasPermitidas.length - 1} laboratorio${areasPermitidas.length > 2 ? 's' : ''} más)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {showDropdownAreas ? (
                        <ChevronUp className="w-4 h-4 text-brand-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-brand-text/60" />
                      )}
                    </div>
                  </button>

                  {/* Panel Desplegable Dinámico Flotante */}
                  {showDropdownAreas && (
                    <div className="mt-1.5 p-2 bg-white rounded-2xl border border-brand-accent/60 shadow-xl space-y-2 animate-slide-down">
                      {/* Cabecera con acciones rápidas */}
                      <div className="flex items-center justify-between px-1.5 pt-1 pb-1.5 border-b border-brand-accent/30 text-[11px]">
                        <span className="font-bold text-brand-dark">Catálogo de Esclusas y Laboratorios</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAreasPermitidas(catalogoLaboratoriosAreas.map((l) => l.nombre))}
                            className="text-[10px] text-brand-primary hover:underline font-semibold cursor-pointer"
                          >
                            Marcar Todas
                          </button>
                          <span className="text-gray-300">•</span>
                          <button
                            type="button"
                            onClick={() => setAreasPermitidas([nuevoLaboratorioPrincipal])}
                            className="text-[10px] text-red-600 hover:underline font-semibold cursor-pointer"
                          >
                            Solo Principal
                          </button>
                        </div>
                      </div>

                      {/* Lista de opciones scrolleable */}
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                        {catalogoLaboratoriosAreas.map((area) => {
                          const isChecked = areasPermitidas.includes(area.nombre);
                          const isPrincipal = nuevoLaboratorioPrincipal === area.nombre;
                          return (
                            <div
                              key={area.id}
                              onClick={() => handleToggleArea(area.nombre)}
                              className={`flex items-center justify-between p-2 rounded-xl border text-[11px] cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-brand-secondary/70 border-brand-primary/60 text-brand-dark font-semibold'
                                  : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}} // Manejado por el onClick del contenedor
                                  className="rounded text-brand-primary focus:ring-brand-primary/40 cursor-pointer shrink-0"
                                />
                                <div className="truncate">
                                  <span className="block truncate">{area.nombre}</span>
                                  <span className="text-[9px] font-normal text-slate-500">
                                    {area.deptoAsociado}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                    area.nivelRiesgo === 'ALTO'
                                      ? 'bg-red-100 text-red-700'
                                      : area.nivelRiesgo === 'MEDIO'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {area.codigo}
                                </span>
                                {isPrincipal && (
                                  <span className="text-[8.5px] bg-brand-primary text-white px-1.5 py-0.5 rounded-md font-bold">
                                    PRINCIPAL
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Botón para cerrar el dropdown */}
                      <div className="pt-1 text-right">
                        <button
                          type="button"
                          onClick={() => setShowDropdownAreas(false)}
                          className="px-3 py-1 bg-brand-primary text-white text-[10px] font-bold rounded-lg hover:bg-brand-primary/90 transition-all cursor-pointer"
                        >
                          Listo ({areasPermitidas.length})
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Badges tipo Tags de las áreas seleccionadas cuando el dropdown está cerrado */}
                {!showDropdownAreas && areasPermitidas.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 max-h-16 overflow-y-auto">
                    {areasPermitidas.map((areaNombre) => (
                      <span
                        key={areaNombre}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-brand-accent/50 text-[10px] text-brand-dark font-medium shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate max-w-[200px]">{areaNombre}</span>
                        {areaNombre !== nuevoLaboratorioPrincipal && (
                          <button
                            type="button"
                            onClick={() => handleToggleArea(areaNombre)}
                            className="text-slate-400 hover:text-red-500 transition-colors ml-0.5"
                            title="Quitar autorización"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-accent/30">
                <button
                  type="button"
                  onClick={() => setShowRegistrarModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CAMBIO DE ESTADO OBLIGATORIO CON MOTIVO */}
      {showEstadoModal && empleadoSeleccionado && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-brand-accent/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-brand-secondary text-brand-primary">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-heading font-bold text-brand-dark">
                  Modificar Estado de {empleadoSeleccionado.nombres}
                </h3>
                <p className="text-xs text-brand-text/70">Documento: {empleadoSeleccionado.numeroDocumento}</p>
              </div>
            </div>

            <form onSubmit={handleGuardarEstado} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5">Nuevo Estado</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as EstadoEmpleado)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-accent/60 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  <option value="ACTIVO">ACTIVO (Autorización Vigente)</option>
                  <option value="SUSPENDIDO">SUSPENDIDO (Temporal)</option>
                  <option value="REVOCADO">REVOCADO (Acceso Bloqueado Definitivo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5">
                  Motivo de Cambio de Estado <span className="text-red-500">* (Obligatorio)</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoEstado}
                  onChange={(e) => setMotivoEstado(e.target.value)}
                  placeholder="Describa la justificación médica, de seguridad o auditoría..."
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-accent/60 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEstadoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm cursor-pointer"
                >
                  Guardar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dinámico de Registro Exitoso con Estilo y Animación */}
      {showExitoModal && empleadoCreado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-accent/40 relative overflow-hidden transform animate-scale-up">
            {/* Elementos visuales decorativos */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-brand-light rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-accent/30 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 text-center">
              {/* Icono con pulsación y halo luminoso */}
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent/80 flex items-center justify-center shadow-lg shadow-brand-primary/30 text-white mb-4 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light border border-brand-accent/60 text-brand-dark text-[11px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-spin" />
                ALTA DE PERSONAL COMPLETADA
              </div>

              <h2 className="text-xl font-heading font-extrabold text-brand-dark mb-1">
                ¡Registro Exitoso!
              </h2>
              <p className="text-xs text-brand-text/75 mb-5">
                El colaborador ha sido ingresado al padrón oficial de <strong className="text-brand-dark font-semibold">Laboratorio XYZ</strong> con autorización de acceso activa.
              </p>

              {/* Ficha Resumen del Colaborador */}
              <div className="bg-brand-secondary/70 p-4 rounded-2xl border border-brand-accent/50 text-left space-y-2 mb-6">
                <div className="flex items-center justify-between pb-2 border-b border-brand-accent/30">
                  <span className="text-[11px] font-medium text-brand-text/70">Nombre Completo:</span>
                  <span className="text-xs font-bold text-brand-dark">{empleadoCreado.nombres} {empleadoCreado.apellidos}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-brand-accent/30">
                  <span className="text-[11px] font-medium text-brand-text/70">Cédula / Documento:</span>
                  <span className="text-xs font-mono font-bold text-brand-primary">{empleadoCreado.numeroDocumento}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-brand-accent/30">
                  <span className="text-[11px] font-medium text-brand-text/70">Departamento:</span>
                  <span className="text-xs font-medium text-brand-dark">{empleadoCreado.departamentoNombre}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-brand-accent/30">
                  <span className="text-[11px] font-medium text-brand-text/70">Carnet Asignado (RFID):</span>
                  <span className="text-xs font-mono font-bold text-brand-dark bg-white px-2 py-0.5 rounded-lg border border-brand-accent/50">
                    {empleadoCreado.codigoTarjetaRfid}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-brand-text/70">Estado Inicial:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A9B8E]/15 text-[#2E6F64]">
                    <ShieldCheck className="w-3 h-3" />
                    ACTIVO
                  </span>
                </div>
              </div>

              {/* Botón de Aceptar con micro-interacción */}
              <button
                type="button"
                onClick={() => {
                  setShowExitoModal(false);
                  setEmpleadoCreado(null);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
