/**
 * personalStore.ts
 * 
 * Almacén compartido de empleados para el frontend Zone Control.
 * Persiste en localStorage para que tanto "Gestión de Personal" como
 * el "Simulador de Acceso" operen sobre la misma base de datos.
 */

import { Empleado } from '@/types';

const STORE_KEY = 'zone_control_personal_v3';

// Empleados demo iniciales que se cargan si el store está vacío
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
    departamentoNombre: 'Bioseguridad',
    areaPrincipalId: 1,
    areaPrincipalNombre: 'Laboratorio de Bioseguridad 1',
    areasAutorizadas: ['Laboratorio de Bioseguridad 1', 'Zona de Empaque 1'],
    tipoDocumento: 'CC',
    numeroDocumento: '1122334455',
    nombres: 'Prueba',
    apellidos: 'Exitosa',
    correo: 'prueba@laboratorioxyz.com',
    telefono: '3000000000',
    codigoTarjetaRfid: 'pru-eba-123',
    estado: 'ACTIVO',
  },
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

