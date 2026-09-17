'use client';

import { useEffect, useCallback } from 'react';

/**
 * Hook de Seguridad: usePreventBackNavigation v3
 *
 * COMPORTAMIENTO CORRECTO:
 * ✅ Permite navegar entre páginas del dashboard (Atrás/Adelante entre rutas autenticadas).
 * ✅ Si el usuario cierra sesión y presiona Atrás/Adelante → redirige a /login.
 * ✅ Si la página se restaura desde BFCache sin sesión activa → redirige a /login.
 * ✅ Si el usuario cierra/abre el tab sin sesión (sessionStorage vacío) → redirige a /login.
 */
export function usePreventBackNavigation(redirectTo: string = '/login') {
  /**
   * Verifica si hay una sesión válida en sessionStorage.
   * Si no hay sesión → limpia todo y redirige.
   */
  const verifySession = useCallback(() => {
    if (typeof window === 'undefined') return;

    const token = sessionStorage.getItem('zone_control_token');
    const user = sessionStorage.getItem('zone_control_user');

    // Sin token o sin usuario → sesión inválida, forzar re-login
    if (!token || !user) {
      // Limpiar cualquier residuo
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch {}

      // Eliminar cookies
      const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
      document.cookie = `zone_control_token=; path=/; ${expiry}; SameSite=Lax;`;
      document.cookie = `zone_control_role=; path=/; ${expiry}; SameSite=Lax;`;

      // Reemplazar historial para bloquear el retroceso
      window.location.replace(redirectTo);
    }
  }, [redirectTo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    /**
     * Evento `pageshow`:
     * - Dispara tanto en carga normal como al restaurar desde BFCache.
     * - `event.persisted = true` → viene del BFCache (muy probable sin sesión fresca).
     * - Siempre verificamos la sesión al entrar a cualquier página del dashboard.
     */
    const handlePageShow = (event: PageTransitionEvent) => {
      // Si viene de BFCache O si simplemente se muestra la página
      // Siempre verificar sesión para cubrir todos los casos de navegación histórica
      if (event.persisted) {
        // BFCache: puede tener contenido visualmente "congelado" pero sessionStorage es fresco
        verifySession();
      } else {
        // Carga normal: verificar igualmente para proteger rutas directas
        verifySession();
      }
    };

    /**
     * Evento `popstate`:
     * - Dispara al presionar Atrás/Adelante en el historial del navegador.
     * - Aquí verificamos si la sesión sigue siendo válida.
     * - Si el usuario cerró sesión y regresó con Atrás → verifySession() lo bloquea.
     */
    const handlePopState = () => {
      verifySession();
    };

    /**
     * Evento `visibilitychange`:
     * - Cuando el usuario vuelve a la pestaña después de haber estado en otra.
     * - Cubre el caso de cierre de sesión en otra pestaña del mismo origen.
     */
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        verifySession();
      }
    };

    /**
     * Evento `focus`:
     * - Cuando la ventana recupera el foco.
     * - Cubre el caso de retorno desde otra aplicación o pestaña.
     */
    const handleFocus = () => {
      verifySession();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Verificación inmediata al montar el componente
    verifySession();

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [verifySession]);
}
