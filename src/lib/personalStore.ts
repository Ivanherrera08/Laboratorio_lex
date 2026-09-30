/**
 * personalStore.ts
 * 
 * Almacén compartido de empleados para el frontend Zone Control.
 * Persiste en localStorage para que tanto "Gestión de Personal" como
 * el "Simulador de Acceso" operen sobre la misma base de datos.
 */

import { Empleado } from '@/types';

const STORE_KEY = 'zone_control_personal_v6';

const empleadosIniciales: Empleado[] = [
  {
    id: 1,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    areaPrincipalId: 1,
    areaPrincipalNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    areasAutorizadas: [
      'Laboratorio de Síntesis Molecular (Área A)',
      'Sala Limpia de Liofilización (Área B)',
    ],
    tipoDocumento: 'CC',
    numeroDocumento: '1012345678',
    nombres: 'Carlos Andrés',
    apellidos: 'Mendoza Pérez',
    correo: 'carlos.mendoza@laboratorioxyz.com',
    telefono: '3109988776',
    codigoTarjetaRfid: 'car-los-001',
    estado: 'ACTIVO',
  },
  {
    id: 2,
    departamentoId: 2,
    departamentoNombre: 'Control de Calidad',
    areaPrincipalId: 3,
    areaPrincipalNombre: 'Almacén Central (Área C)',
    areasAutorizadas: ['Almacén Central (Área C)'],
    tipoDocumento: 'CC',
    numeroDocumento: '1087654321',
    nombres: 'Laura Sofía',
    apellidos: 'Restrepo Villa',
    correo: 'laura.restrepo@laboratorioxyz.com',
    telefono: '3201123344',
    codigoTarjetaRfid: 'lau-ras-002',
    estado: 'INACTIVO',
    motivoCambioEstado: 'Finalización de contrato temporal y auditoría de seguridad.',
  },
  {
    id: 3,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    areaPrincipalId: 2,
    areaPrincipalNombre: 'Sala Limpia de Liofilización (Área B)',
    areasAutorizadas: ['Sala Limpia de Liofilización (Área B)'],
    tipoDocumento: 'CE',
    numeroDocumento: '98765432',
    nombres: 'Guillermo',
    apellidos: 'Von Hassen',
    correo: 'guillermo.von@laboratorioxyz.com',
    telefono: '3154432211',
    codigoTarjetaRfid: 'gui-lle-003',
    estado: 'INACTIVO',
    motivoCambioEstado: 'Incumplimiento de protocolo de esterilidad en esclusa.',
  },
  {
    id: 4,
    departamentoId: 3,
    departamentoNombre: 'Bioseguridad y Mantenimiento',
    areaPrincipalId: 1,
    areaPrincipalNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    areasAutorizadas: ['Laboratorio de Síntesis Molecular (Área A)', 'Sala Limpia de Liofilización (Área B)'],
    tipoDocumento: 'CC',
    numeroDocumento: '1122334455',
    nombres: 'Valeria',
    apellidos: 'Montes',
    correo: 'valeria.montes@laboratorioxyz.com',
    telefono: '3123456789',
    codigoTarjetaRfid: 'val-mon-004',
    estado: 'ACTIVO',
  },
  {
    id: 5,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    areaPrincipalId: 1,
    areaPrincipalNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    areasAutorizadas: ['Laboratorio de Síntesis Molecular (Área A)'],
    tipoDocumento: 'CC',
    numeroDocumento: '1023659998',
    nombres: 'Andrea',
    apellidos: 'Gomez',
    correo: 'andrea.gomez@laboratorioxyz.com',
    telefono: '3151234567',
    codigoTarjetaRfid: 'and-rea-005',
    estado: 'ACTIVO',
  },
  {
    id: 6,
    departamentoId: 2,
    departamentoNombre: 'Control de Calidad',
    areaPrincipalId: 3,
    areaPrincipalNombre: 'Almacén Central (Área C)',
    areasAutorizadas: ['Almacén Central (Área C)'],
    tipoDocumento: 'CC',
    numeroDocumento: '1098765432',
    nombres: 'Juan Pablo',
    apellidos: 'Ramirez',
    correo: 'juan.pablo@laboratorioxyz.com',
    telefono: '3009876543',
    codigoTarjetaRfid: 'jua-npb-006',
    estado: 'ACTIVO',
  },
  {
    id: 7,
    departamentoId: 2,
    departamentoNombre: 'Control de Calidad',
    areaPrincipalId: 3,
    areaPrincipalNombre: 'Almacén Central (Área C)',
    areasAutorizadas: ['Almacén Central (Área C)'],
    tipoDocumento: 'CC',
    numeroDocumento: '55667788',
    nombres: 'Gabriela',
    apellidos: 'Salazar',
    correo: 'gabriela.salazar@laboratorioxyz.com',
    telefono: '3145678901',
    codigoTarjetaRfid: 'gab-sal-007',
    estado: 'ACTIVO',
  },
  {
    id: 8,
    departamentoId: 4,
    departamentoNombre: 'Administración y Finanzas',
    areaPrincipalId: 4,
    areaPrincipalNombre: 'Oficinas Administrativas (Área D)',
    areasAutorizadas: ['Oficinas Administrativas (Área D)'],
    tipoDocumento: 'CC',
    numeroDocumento: '88776655',
    nombres: 'Roberto',
    apellidos: 'Espinoza',
    correo: 'roberto.espinoza@laboratorioxyz.com',
    telefono: '3187654321',
    codigoTarjetaRfid: 'rob-esp-008',
    estado: 'INACTIVO',
    motivoCambioEstado: 'Licencia no remunerada',
  },
  {
    id: 9,
    departamentoId: 3,
    departamentoNombre: 'Bioseguridad y Mantenimiento',
    areaPrincipalId: 2,
    areaPrincipalNombre: 'Sala Limpia de Liofilización (Área B)',
    areasAutorizadas: ['Sala Limpia de Liofilización (Área B)', 'Almacén Central (Área C)'],
    tipoDocumento: 'CC',
    numeroDocumento: '100100200',
    nombres: 'Mauricio',
    apellidos: 'Vargas',
    correo: 'mauricio.vargas@laboratorioxyz.com',
    telefono: '3198887777',
    codigoTarjetaRfid: 'mau-var-009',
    estado: 'ACTIVO',
  },
  {
    id: 10,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    areaPrincipalId: 1,
    areaPrincipalNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    areasAutorizadas: ['Laboratorio de Síntesis Molecular (Área A)'],
    tipoDocumento: 'CC',
    numeroDocumento: '300000001',
    nombres: 'Elena',
    apellidos: 'Vargas',
    correo: 'elena.vargas@laboratorioxyz.com',
    telefono: '3120000001',
    codigoTarjetaRfid: 'ele-var-020',
    estado: 'ACTIVO',
  },
  {
    id: 11,
    departamentoId: 2,
    departamentoNombre: 'Control de Calidad',
    areaPrincipalId: 3,
    areaPrincipalNombre: 'Almacén Central (Área C)',
    areasAutorizadas: ['Almacén Central (Área C)'],
    tipoDocumento: 'CC',
    numeroDocumento: '300000002',
    nombres: 'Mateo',
    apellidos: 'Rios',
    correo: 'mateo.rios@laboratorioxyz.com',
    telefono: '3120000002',
    codigoTarjetaRfid: 'mat-rio-021',
    estado: 'ACTIVO',
  },
  {
    id: 12,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    areaPrincipalId: 1,
    areaPrincipalNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    areasAutorizadas: ['Laboratorio de Síntesis Molecular (Área A)'],
    tipoDocumento: 'CC',
    numeroDocumento: '300000003',
    nombres: 'Santiago',
    apellidos: 'Hoyos',
    correo: 'santiago.hoyos@laboratorioxyz.com',
    telefono: '3120000003',
    codigoTarjetaRfid: 'san-hoy-022',
    estado: 'INACTIVO',
    motivoCambioEstado: 'Finalización de proyecto',
  },
  {
    id: 13,
    departamentoId: 2,
    departamentoNombre: 'Control de Calidad',
    areaPrincipalId: 3,
    areaPrincipalNombre: 'Almacén Central (Área C)',
    areasAutorizadas: ['Almacén Central (Área C)'],
    tipoDocumento: 'CC',
    numeroDocumento: '300000004',
    nombres: 'Natalia',
    apellidos: 'Gomez',
    correo: 'natalia.gomez@laboratorioxyz.com',
    telefono: '3120000004',
    codigoTarjetaRfid: 'nat-gom-023',
    estado: 'ACTIVO',
  },
  {
    id: 14,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    areaPrincipalId: 1,
    areaPrincipalNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    areasAutorizadas: ['Laboratorio de Síntesis Molecular (Área A)'],
    tipoDocumento: 'CC',
    numeroDocumento: '300000005',
    nombres: 'Alejandro',
    apellidos: 'Lopez',
    correo: 'alejandro.lopez@laboratorioxyz.com',
    telefono: '3120000005',
    codigoTarjetaRfid: 'ale-lop-024',
    estado: 'ACTIVO',
  },
  {
    id: 15,
    departamentoId: 2,
    departamentoNombre: 'Control de Calidad',
    areaPrincipalId: 3,
    areaPrincipalNombre: 'Almacén Central (Área C)',
    areasAutorizadas: ['Almacén Central (Área C)'],
    tipoDocumento: 'CC',
    numeroDocumento: '300000006',
    nombres: 'Ximena',
    apellidos: 'Cruz',
    correo: 'ximena.cruz@laboratorioxyz.com',
    telefono: '3120000006',
    codigoTarjetaRfid: 'xim-cru-025',
    estado: 'ACTIVO',
  },
  {
    id: 16,
    departamentoId: 1,
    departamentoNombre: 'Producción y Síntesis',
    areaPrincipalId: 1,
    areaPrincipalNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    areasAutorizadas: ['Laboratorio de Síntesis Molecular (Área A)'],
    tipoDocumento: 'CC',
    numeroDocumento: '300000007',
    nombres: 'Pablo',
    apellidos: 'Mendez',
    correo: 'pablo.mendez@laboratorioxyz.com',
    telefono: '3120000007',
    codigoTarjetaRfid: 'pab-men-026',
    estado: 'ACTIVO',
  },
  {
    id: 17,
    departamentoId: 2,
    departamentoNombre: 'Control de Calidad',
    areaPrincipalId: 3,
    areaPrincipalNombre: 'Almacén Central (Área C)',
    areasAutorizadas: ['Almacén Central (Área C)'],
    tipoDocumento: 'CC',
    numeroDocumento: '300000008',
    nombres: 'Mariana',
    apellidos: 'Cortes',
    correo: 'mariana.cortes@laboratorioxyz.com',
    telefono: '3120000008',
    codigoTarjetaRfid: 'mar-cor-027',
    estado: 'ACTIVO',
  }
];

/** Lee todos los empleados del localStorage. Si no hay datos, inicializa con los demos. */
export function getEmpleados(): Empleado[] {
  if (typeof window === 'undefined') return empleadosIniciales;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      // Primera vez: persistir los empleados demo
      localStorage.setItem(STORE_KEY, JSON.stringify(empleadosIniciales));
      return empleadosIniciales;
    }
    return JSON.parse(raw) as Empleado[];
  } catch {
    return empleadosIniciales;
  }
}

/** Persiste la lista completa de empleados en localStorage. */
export function saveEmpleados(empleados: Empleado[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(empleados));
  } catch {}
}

/**
 * Busca un empleado por su número de documento.
 * Retorna el empleado si existe, o null.
 */
export function buscarPorDocumento(numeroDocumento: string): Empleado | null {
  const empleados = getEmpleados();
  return empleados.find(
    (e) => e.numeroDocumento.trim() === numeroDocumento.trim()
  ) ?? null;
}

/**
 * Busca un empleado por código de tarjeta RFID.
 * Retorna el empleado si existe, o null.
 */
export function buscarPorRfid(codigoRfid: string): Empleado | null {
  const empleados = getEmpleados();
  return empleados.find(
    (e) => e.codigoTarjetaRfid?.trim().toUpperCase() === codigoRfid.trim().toUpperCase()
  ) ?? null;
}

/**
 * Agrega o actualiza un empleado en el store.
 */
export function agregarEmpleado(nuevoEmpleado: Empleado): void {
  const empleados = getEmpleados();
  // Si ya existe por documento, lo reemplaza
  const index = empleados.findIndex(e => e.numeroDocumento === nuevoEmpleado.numeroDocumento);
  if (index >= 0) {
    empleados[index] = { ...empleados[index], ...nuevoEmpleado };
  } else {
    // Si no tiene id, le asigna uno consecutivo
    if (!nuevoEmpleado.id) {
      const maxId = empleados.length > 0 ? Math.max(...empleados.map(e => e.id)) : 0;
      nuevoEmpleado.id = maxId + 1;
    }
    empleados.push(nuevoEmpleado);
  }
  saveEmpleados(empleados);
}

