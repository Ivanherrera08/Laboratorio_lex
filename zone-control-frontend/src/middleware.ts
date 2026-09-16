import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas protegidas que requieren autenticación obligatoria
const PROTECTED_PREFIX = '/dashboard';

// Matriz de permisos RBAC para rutas de Next.js en el Servidor / Edge
const ROLE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard/simulador': ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'],
  '/dashboard/personal': ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
  '/dashboard/usuarios': ['ADMINISTRADOR'],
  '/dashboard/carga-masiva': ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
  '/dashboard/catalogos': ['ADMINISTRADOR', 'GESTOR_PERSONAL'],
  '/dashboard/historial': ['ADMINISTRADOR', 'GESTOR_PERSONAL', 'SUPERVISOR_ACCESOS'],
  '/dashboard/socio-sync': ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
  '/dashboard/auditoria': ['ADMINISTRADOR', 'SUPERVISOR_ACCESOS'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Interceptar solo las rutas que empiezan con /dashboard
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    const token = request.cookies.get('zone_control_token')?.value;
    const userRole = request.cookies.get('zone_control_role')?.value;

    // 1. Si no hay cookie de sesión autenticada en la petición HTTP
    // Redirigir de inmediato al Login con razón de seguridad
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Validación de Rol (RBAC) a nivel de Servidor / Red
    const allowedRoles = ROLE_PERMISSIONS[pathname];
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      // Redirigir a simulador o pantalla de denegado si intenta forzar la URL
      const deniedUrl = new URL('/dashboard/simulador', request.url);
      deniedUrl.searchParams.set('error', 'forbidden_role');
      return NextResponse.redirect(deniedUrl);
    }
  }

  // Permitir siempre la visualización de la página de Login para ingresar credenciales explícitamente

  const response = NextResponse.next();

  // Agregar Headers de Seguridad Farmacéutica y Prevención de Clickjacking / XSS
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// Matcher para interceptar dashboard y login
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
