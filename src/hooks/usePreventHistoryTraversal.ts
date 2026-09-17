'use client';

import { useEffect, useCallback } from 'react';

/**
 * Hook de Seguridad: usePreventHistoryTraversal
 * 
 * Permite la navegación fluida y natural (Atrás / Adelante) entre las distintas páginas del dashboard
 * cuando el usuario tiene sesión activa, pero expulsa y bloquea instantáneamente el acceso si el usuario
 * no tiene credenciales o si intenta visualizar la página tras cerrar sesión (BFCache / Cache local).
 */
export function usePreventHistoryTraversal(redirectTo: string = '/login?error=session_expired') {
  const verifySessionIntegrity = useCallback(() => {
    if (typeof window === 'undefined') return;

    const token = sessionStorage.getItem('zone_control_token');
    const user = sessionStorage.getItem('zone_control_user');

    // Solo si NO hay sesión activa, purgar y redirigir
    if (!token || !user) {
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch {}

      document.cookie = 'zone_control_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure;';
      document.cookie = 'zone_control_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure;';

      window.location.replace(redirectTo);
    }
  }, [redirectTo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Escuchar el evento pageshow para detectar si la página se recupera de la caché tras un logout
    const handlePageShow = (event: PageTransitionEvent) => {
      const token = sessionStorage.getItem('zone_control_token');
      if (!token || event.persisted) {
        verifySessionIntegrity();
      }
    };

    // Escuchar navegación con flechas para validar que la sesión sigue viva
    const handlePopState = () => {
      verifySessionIntegrity();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [verifySessionIntegrity]);
}
