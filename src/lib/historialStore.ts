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

const STORE_KEY = 'zone_control_historial_v3';

// Registros demo iniciales para cuando la base de datos esté vacía
const registrosIniciales: HistorialAcceso[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    empleadoId: 1,
    empleadoNombreCompleto: 'Dr. Carlos Mendoza',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    numeroDocumentoIngresado: '1012345678',
    codigoTarjetaIngresado: 'RFID-001',
    resultadoAcceso: 'AUTORIZADO',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    empleadoId: 2,
    empleadoNombreCompleto: 'Ing. Laura Restrepo',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular (Área A)',
    numeroDocumentoIngresado: '1087654321',
    codigoTarjetaIngresado: 'RFID-002',
    resultadoAcceso: 'DENEGADO',
    motivoDenegacion: 'Permiso INACTIVO en área de alto riesgo',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '00112233-4455-6677-8899-aabbccddeeff',
    areaId: 2,
    areaNombre: 'Sala Limpia de Liofilización (Área B)',
    numeroDocumentoIngresado: '9988776655',
    codigoTarjetaIngresado: 'RFID-UNKNOWN',
    resultadoAcceso: 'NO_REGISTRADO',
    motivoDenegacion: 'Credencial no existe en padrón de empleados',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
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
    return Array.isArray(parsed) ? parsed : registrosIniciales;
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
        id: item.id?.toString() || `bk-${item.timestamp}`,
        empleadoId: item.empleadoId ?? undefined,
        empleadoNombreCompleto: item.empleadoNombreCompleto || (item.resultadoAcceso === 'NO_REGISTRADO' ? 'Credencial No Registrada' : 'Usuario del Sistema'),
        areaId: item.areaId || 1,
        areaNombre: item.areaNombre || 'Área no especificada',
        numeroDocumentoIngresado: item.numeroDocumentoIngresado || '',
        codigoTarjetaIngresado: item.codigoTarjetaIngresado || undefined,
        resultadoAcceso: item.resultadoAcceso as ResultadoAcceso,
        motivoDenegacion: item.motivoDenegacion || undefined,
        timestamp: item.timestamp || new Date().toISOString(),
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
