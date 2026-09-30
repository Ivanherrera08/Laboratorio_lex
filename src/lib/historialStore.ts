/**
 * historialStore.ts
 *
 * Almacén sincronizado del historial inmutable de accesos (Bitácoras).
 * Funciona de manera híbrida:
 * 1. Consulta la API REST del backend de Java y PostgreSQL (/api/accesos/historial).
 * 2. Si el backend está en línea, sincroniza y persiste en la base de datos real.
 * 3. Si se opera sin conexión o en modo simulación, guarda en localStorage y emite
 *    eventos 'historial-updated' para actualización en tiempo real en la interfaz.
 */

import { HistorialAcceso, ResultadoAcceso } from '@/types';
import { api } from './api';

const STORE_KEY = 'zone_control_historial_v5';

// Registros demo iniciales para cuando la base de datos esté vacía
const registrosIniciales: HistorialAcceso[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    empleadoId: 1,
    empleadoNombreCompleto: 'Carlos Andrés Mendoza Pérez',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    numeroDocumentoIngresado: '1012345678',
    codigoTarjetaIngresado: 'car-los-001',
    resultadoAcceso: 'AUTORIZADO',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    empleadoId: 2,
    empleadoNombreCompleto: 'Laura Sofía Restrepo Villa',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    numeroDocumentoIngresado: '1087654321',
    codigoTarjetaIngresado: 'lau-ras-002',
    resultadoAcceso: 'DENEGADO',
    motivoDenegacion: 'Permiso INACTIVO en área de alto riesgo',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'a7b8c9d0-1111-2222-3333-445566778899',
    empleadoId: 4,
    empleadoNombreCompleto: 'Valeria Montes',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    numeroDocumentoIngresado: '1122334455',
    codigoTarjetaIngresado: 'val-mon-004',
    resultadoAcceso: 'AUTORIZADO',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'b1c2d3e4-5555-6666-7777-8899aabbccdd',
    empleadoId: 7,
    empleadoNombreCompleto: 'Gabriela Salazar',
    areaId: 3,
    areaNombre: 'Almacén Central (Área C)',
    numeroDocumentoIngresado: '55667788',
    codigoTarjetaIngresado: 'gab-sal-007',
    resultadoAcceso: 'AUTORIZADO',
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'c2d3e4f5-aaaa-bbbb-cccc-dddddddddddd',
    empleadoId: 8,
    empleadoNombreCompleto: 'Roberto Espinoza',
    areaId: 4,
    areaNombre: 'Oficinas Administrativas (Área D)',
    numeroDocumentoIngresado: '88776655',
    codigoTarjetaIngresado: 'rob-esp-008',
    resultadoAcceso: 'DENEGADO',
    motivoDenegacion: 'Estado de empleado INACTIVO (Licencia no remunerada)',
    timestamp: new Date(Date.now() - 450000).toISOString(),
  },
  {
    id: 'd3e4f5g6-1234-5678-90ab-cdef12345678',
    empleadoId: 9,
    empleadoNombreCompleto: 'Mauricio Vargas',
    areaId: 2,
    areaNombre: 'Sala Limpia de Liofilización (Área B)',
    numeroDocumentoIngresado: '100100200',
    codigoTarjetaIngresado: 'mau-var-009',
    resultadoAcceso: 'AUTORIZADO',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'e4f5g6h7-2345-6789-01bc-def234567890',
    empleadoId: 10,
    empleadoNombreCompleto: 'Elena Vargas',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    numeroDocumentoIngresado: '300000001',
    codigoTarjetaIngresado: 'ele-var-020',
    resultadoAcceso: 'AUTORIZADO',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'f5g6h7i8-3456-7890-12cd-ef3456789012',
    empleadoId: 12,
    empleadoNombreCompleto: 'Santiago Hoyos',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    numeroDocumentoIngresado: '300000003',
    codigoTarjetaIngresado: 'san-hoy-022',
    resultadoAcceso: 'DENEGADO',
    motivoDenegacion: 'Estado de empleado INACTIVO (Finalización de proyecto)',
    timestamp: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'g6h7i8j9-4567-8901-23de-f45678901234',
    empleadoId: 13,
    empleadoNombreCompleto: 'Natalia Gomez',
    areaId: 3,
    areaNombre: 'Almacén Central (Área C)',
    numeroDocumentoIngresado: '300000004',
    codigoTarjetaIngresado: 'nat-gom-023',
    resultadoAcceso: 'AUTORIZADO',
    timestamp: new Date().toISOString(),
  }
];

/**
 * Obtiene los registros guardados en el almacenamiento local del navegador.
 */
export function getHistorialLocal(): HistorialAcceso[] {
  if (typeof window === 'undefined') return registrosIniciales;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(registrosIniciales));
      return registrosIniciales;
    }
    const parsed = JSON.parse(raw) as HistorialAcceso[];
    return Array.isArray(parsed) 
      ? parsed
          .filter(item => item.empleadoNombreCompleto && item.empleadoNombreCompleto.trim() !== '')
          .map(item => ({
            ...item,
            resultadoAcceso: item.resultadoAcceso === 'NO_REGISTRADO' as any ? 'DENEGADO' : item.resultadoAcceso
          })) 
      : registrosIniciales;
  } catch {
    return registrosIniciales;
  }
}

/**
 * Guarda la lista de registros en el almacenamiento local y notifica a las vistas.
 */
export function saveHistorialLocal(items: HistorialAcceso[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('historial-updated'));
  } catch {}
}

/**
 * Registra un nuevo intento de acceso (del simulador o lector físico).
 * Lo antepone al inicio de la lista y emite evento global.
 */
export function registrarAccesoLocal(
  registro: Omit<HistorialAcceso, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): HistorialAcceso {
  const historial = getHistorialLocal();
  const nuevoItem: HistorialAcceso = {
    id: registro.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    timestamp: registro.timestamp || new Date().toISOString(),
    areaId: registro.areaId,
    areaNombre: registro.areaNombre,
    numeroDocumentoIngresado: registro.numeroDocumentoIngresado,
    codigoTarjetaIngresado: registro.codigoTarjetaIngresado,
    resultadoAcceso: registro.resultadoAcceso as ResultadoAcceso,
    motivoDenegacion: registro.motivoDenegacion,
    empleadoId: registro.empleadoId,
    empleadoNombreCompleto: registro.empleadoNombreCompleto,
  };

  const actualizado = [nuevoItem, ...historial];
  saveHistorialLocal(actualizado);
  return nuevoItem;
}

/**
 * Limpia el historial local restableciéndolo a vacío.
 */
export function limpiarHistorialLocal(): void {
  saveHistorialLocal([]);
}

/**
 * Consulta la API de backend de Spring Boot (/api/accesos/historial).
 * Si tiene éxito, combina con los registros locales y actualiza el store.
 * Si falla, retorna el historial local sin interrumpir la experiencia.
 */
export async function obtenerHistorialCombinado(): Promise<HistorialAcceso[]> {
  const localItems = getHistorialLocal();

  try {
    const res = await api.get<any[]>('/accesos/historial');
    if (res.data && Array.isArray(res.data)) {
      const backendItems: HistorialAcceso[] = res.data.map((item) => ({
        // idHistorial viene del DTO del backend
        id: item.idHistorial?.toString() || item.id?.toString() || `bk-${item.fechaHora || item.timestamp}`,
        empleadoId: item.empleadoId ?? undefined,
        // nombreEmpleado viene del backend, empleadoNombreCompleto es el nombre local
        empleadoNombreCompleto:
          item.empleadoNombreCompleto ||
          item.nombreEmpleado ||
          undefined,
        areaId: item.areaId || 1,
        // nombreArea viene del backend, areaNombre es el nombre local
        areaNombre: item.areaNombre || item.nombreArea || 'N/A',
        numeroDocumentoIngresado: item.numeroDocumentoIngresado || '',
        // codigoTarjetaRfid viene del backend
        codigoTarjetaIngresado: item.codigoTarjetaIngresado || item.codigoTarjetaRfid || undefined,
        // resultado viene del backend (no resultadoAcceso)
        resultadoAcceso: (item.resultadoAcceso || item.resultado) as ResultadoAcceso,
        // motivo viene del backend (no motivoDenegacion)
        motivoDenegacion: item.motivoDenegacion || item.motivo || undefined,
        // fechaHora viene del backend (no timestamp)
        timestamp: item.timestamp || item.fechaHora || new Date().toISOString(),
      }));

      // Fusionar evitando duplicados por id o por timestamp exacto + documento
      const combined = [...backendItems];
      const seen = new Set(combined.map((b) => `${b.numeroDocumentoIngresado}_${b.timestamp}`));

      for (const loc of localItems) {
        const key = `${loc.numeroDocumentoIngresado}_${loc.timestamp}`;
        if (!seen.has(key)) {
          combined.push(loc);
          seen.add(key);
        }
      }

      // Ordenar por fecha descendente (lo más reciente primero)
      combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Guardar caché actualizada
      saveHistorialLocal(combined);

      return combined;
    }
  } catch (err) {
    console.error("Error al sincronizar el historial con el backend:", err);
    // Si no hay conexión al backend, retornar local
  }

  return localItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
