'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RolUsuario } from '@/types';

export interface NotificacionSistema {
  id: string;
  titulo: string;
  mensaje: string;
  timestamp: string;
  leida: boolean;
  tipo: 'SEGURIDAD' | 'PERSONAL' | 'SISTEMA' | 'AUDITORIA';
  rolesDestino: RolUsuario[];
  accionUrl?: string;
}

const notificacionesIniciales: NotificacionSistema[] = [
  {
    id: 'NOTIF-01',
    titulo: '🚨 Alerta de Bioseguridad en Sala A',
    mensaje: 'Se revocó el permiso de acceso para la credencial RFID-002 por ciclo de despresurización incompleto.',
    timestamp: 'Hace 2 minutos',
    leida: false,
    tipo: 'SEGURIDAD',
    rolesDestino: ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'],
    accionUrl: '/dashboard/auditoria',
  },
  {
    id: 'NOTIF-02',
    titulo: '📊 Nuevo Lote CSV Procesado',
    mensaje: 'El lote #BATCH-88231 incorporó 45 empleados con éxito. 3 registros requieren corrección.',
    timestamp: 'Hace 15 minutos',
    leida: false,
    tipo: 'PERSONAL',
    rolesDestino: ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
    accionUrl: '/dashboard/carga-masiva',
  },
  {
    id: 'NOTIF-03',
    titulo: '🌐 Sincronización B2B Programada',
    mensaje: 'Transmisión con el socio internacional completada satisfactoriamente (HTTP 200).',
    timestamp: 'Hace 1 hora',
    leida: true,
    tipo: 'SISTEMA',
    rolesDestino: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
    accionUrl: '/dashboard/socio-sync',
  },
  {
    id: 'NOTIF-04',
    titulo: '🛡️ Auditoría Mensual Generada',
    mensaje: 'El informe de accesos de alta criticidad está listo para exportación en formato firmado.',
    timestamp: 'Hace 3 horas',
    leida: true,
    tipo: 'AUDITORIA',
    rolesDestino: ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
    accionUrl: '/dashboard/historial',
  },
];

interface NotificationContextType {
  notificaciones: NotificacionSistema[];
  notificacionesFiltradas: NotificacionSistema[];
  noLeidasCount: number;
  marcarComoLeida: (id: string) => void;
  marcarTodasComoLeidas: () => void;
  agregarNotificacion: (notif: Omit<NotificacionSistema, 'id' | 'timestamp' | 'leida'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(notificacionesIniciales);
  
  // Filtrar notificaciones (TEMPORAL: Sin filtro de usuario)
  const notificacionesFiltradas = notificaciones;

  const noLeidasCount = notificacionesFiltradas.filter((n) => !n.leida).length;

  const marcarComoLeida = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const agregarNotificacion = (notif: Omit<NotificacionSistema, 'id' | 'timestamp' | 'leida'>) => {
    const nueva: NotificacionSistema = {
      ...notif,
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      timestamp: 'Ahora mismo',
      leida: false,
    };
    setNotificaciones((prev) => [nueva, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notificaciones,
        notificacionesFiltradas,
        noLeidasCount,
        marcarComoLeida,
        marcarTodasComoLeidas,
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
