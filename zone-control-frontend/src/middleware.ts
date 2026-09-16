import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Prefijo de rutas protegidas del sistema
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

// Lista de rutas válidas públicas conocidas
const VALID_PUBLIC_ROUTES = ['/', '/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar archivos estáticos, api interna y favicon de next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Interceptar rutas protegidas que empiezan con /dashboard
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    const token = request.cookies.get('zone_control_token')?.value;
    const userRole = request.cookies.get('zone_control_role')?.value;

    // Si no hay token de autenticación, redirigir a la página principal por seguridad
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Validación de Rol (RBAC)
    const allowedRoles = ROLE_PERMISSIONS[pathname];
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard/simulador', request.url));
    }
  } else if (!VALID_PUBLIC_ROUTES.includes(pathname)) {
    // 2. Si la ruta ingresada no existe o es desconocida, redirigir a la página de inicio (/) para evitar 404
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // Headers de Seguridad Farmacéutica y Prevención de Clickjacking / XSS
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
