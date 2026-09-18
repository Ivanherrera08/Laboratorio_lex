'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RolUsuario } from '@/types';

export interface DetallesAuditoria {
  evento: string;
  modulo: string;
  operacion: string;
  usuarioResponsable?: string;
  entidadInvolucrada?: string;
  valorAnterior?: string | null;
  valorNuevo?: string | null;
  direccionIp?: string;
  resultado?: string;
}

export interface NotificacionSistema {
  id: string;
  titulo: string;
  mensaje: string;
  timestamp: string;
  fechaHoraIso: string;
  leida: boolean;
  tipo: 'SEGURIDAD' | 'PERSONAL' | 'SISTEMA' | 'AUDITORIA';
  rolesDestino: RolUsuario[];
  accionUrl?: string;
  detallesAuditoria?: DetallesAuditoria;
}

const STORAGE_KEY = 'zone_control_notifications_v3';

const notificacionesIniciales: NotificacionSistema[] = [
  {
    id: 'NOTIF-01',
    titulo: '🚨 Alerta de Bioseguridad en Sala A',
    mensaje: 'Se revocó el permiso de acceso para la credencial RFID-002 por ciclo de despresurización incompleto.',
    timestamp: 'Hace 5 minutos',
    fechaHoraIso: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    leida: false,
    tipo: 'SEGURIDAD',
    rolesDestino: ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'],
    accionUrl: '/dashboard/simulador',
    detallesAuditoria: {
      evento: 'Revocación Automática por Protocolo de Presión Negativa',
      modulo: 'Control Físico de Accesos',
      operacion: 'REVOCACION_EMERGENCIA',
      usuarioResponsable: 'Sistema Automatizado de Esclusas (PLC-04)',
      entidadInvolucrada: 'Credencial RFID-002 (Laura Sofía Restrepo)',
      valorAnterior: '{"estado": "ACTIVO", "esclusa": "SALA_A", "presionPa": -15}',
      valorNuevo: '{"estado": "BLOQUEADO", "motivo": "Falla de hermeticidad", "presionPa": -4}',
      direccionIp: '192.168.10.45 (Gateway Sensores Sala Blanca)',
      resultado: 'BLOQUEADO PREVENTIVO',
    },
  },
  {
    id: 'NOTIF-02',
    titulo: '📊 Nuevo Lote CSV de Personal Procesado',
    mensaje: 'El lote #BATCH-88231 incorporó 45 empleados con éxito. 3 registros requieren corrección.',
    timestamp: 'Hace 25 minutos',
    fechaHoraIso: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    leida: false,
    tipo: 'PERSONAL',
    rolesDestino: ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
    accionUrl: '/dashboard/carga-masiva',
    detallesAuditoria: {
      evento: 'Importación Masiva de Personal Científico',
      modulo: 'Gestión de Personal Farmacéutico',
      operacion: 'CARGA_MASIVA',
      usuarioResponsable: 'María Fernanda Londoño (Gestor de Personal)',
      entidadInvolucrada: 'Lote #BATCH-88231',
      valorAnterior: '{"totalEmpleados": 210}',
      valorNuevo: '{"totalEmpleados": 255, "procesados": 45, "inconsistencias": 3}',
      direccionIp: '192.168.1.102',
      resultado: 'COMPLETADO CON OBSERVACIONES',
    },
  },
  {
    id: 'NOTIF-03',
    titulo: '🌐 Sincronización B2B con Socio Global',
    mensaje: 'Transmisión cifrada de bitácoras completada satisfactoriamente con respuesta HTTP 200.',
    timestamp: 'Hace 1 hora',
    fechaHoraIso: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    leida: true,
    tipo: 'SISTEMA',
    rolesDestino: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
    accionUrl: '/dashboard/socio-sync',
    detallesAuditoria: {
      evento: 'Intercambio EDI / B2B Partner API',
      modulo: 'Sincronización Internacional',
      operacion: 'SINCRONIZACION_EXTERNA',
      usuarioResponsable: 'Cron Daemon (Spring Scheduler)',
      entidadInvolucrada: 'partner-api.pharma-cloud.org',
      valorAnterior: '{"estado": "EN_COLA", "intentos": 0}',
      valorNuevo: '{"estado": "EXITOSO", "codigoHttp": 200, "paquetesEnviados": 128}',
      direccionIp: '127.0.0.1:8080 (Microservicio Sync)',
      resultado: 'EXITOSO (HTTP 200)',
    },
  },
  {
    id: 'NOTIF-04',
    titulo: '🛡️ Auditoría Regulatoria Exportada',
    mensaje: 'Se descargó el historial consolidado de accesos para inspección regulatoria GxP.',
    timestamp: 'Hace 3 horas',
    fechaHoraIso: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    leida: true,
    tipo: 'AUDITORIA',
    rolesDestino: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
    accionUrl: '/dashboard/historial',
    detallesAuditoria: {
      evento: 'Exportación de Bitácora Regulada (21 CFR Part 11)',
      modulo: 'Historial y Trazabilidad',
      operacion: 'DESCARGA_HISTORIAL',
      usuarioResponsable: 'Admin Principal (admin@laboratorioxyz.com)',
      entidadInvolucrada: 'Registro Histórico de Accesos (Área ZR-LAB01 a ZR-ALM01)',
      valorAnterior: null,
      valorNuevo: '{"formato": "CSV", "firmadoDigitalmente": true}',
      direccionIp: '127.0.0.1',
      resultado: 'DESCARGA COMPLETADA',
    },
  },
];

interface NotificationContextType {
  notificaciones: NotificacionSistema[];
  notificacionesFiltradas: NotificacionSistema[];
  noLeidasCount: number;
  marcarComoLeida: (id: string) => void;
  marcarTodasComoLeidas: () => void;
  eliminarNotificacion: (id: string) => void;
  limpiarLeidas: () => void;
  agregarNotificacion: (
    notif: Omit<NotificacionSistema, 'id' | 'timestamp' | 'fechaHoraIso' | 'leida'> & {
      timestamp?: string;
      detallesAuditoria?: DetallesAuditoria;
    }
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(() => {
    if (typeof window === 'undefined') return notificacionesIniciales;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return notificacionesIniciales;
  });

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notificaciones));
      } catch (err) {
        console.error('Error al persistir notificaciones en localStorage:', err);
      }
    }
  }, [notificaciones]);

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  const marcarComoLeida = useCallback((id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  }, []);

  const marcarTodasComoLeidas = useCallback(() => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  }, []);

  const eliminarNotificacion = useCallback((id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const limpiarLeidas = useCallback(() => {
    setNotificaciones((prev) => prev.filter((n) => !n.leida));
  }, []);

  const agregarNotificacion = useCallback(
    (
      notif: Omit<NotificacionSistema, 'id' | 'timestamp' | 'fechaHoraIso' | 'leida'> & {
        timestamp?: string;
        detallesAuditoria?: DetallesAuditoria;
      }
    ) => {
      const nueva: NotificacionSistema = {
        ...notif,
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        timestamp: notif.timestamp || 'Ahora mismo',
        fechaHoraIso: new Date().toISOString(),
        leida: false,
      };
      setNotificaciones((prev) => [nueva, ...prev]);
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        notificaciones,
        notificacionesFiltradas: notificaciones,
        noLeidasCount,
        marcarComoLeida,
        marcarTodasComoLeidas,
        eliminarNotificacion,
        limpiarLeidas,
        agregarNotificacion,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }
  return context;
}
