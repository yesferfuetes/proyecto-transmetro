import { NextResponse, type NextRequest } from 'next/server';
import { NOMBRE_COOKIE_SESION } from '@/shared/lib/sesion/nombre-cookie';

/**
 * Solo redirige: sin cookie de sesión, una ruta protegida lleva a iniciar sesión. No decide
 * permisos ni valida el token; eso lo hacen el layout, cada página y cada acción en el servidor.
 * Nunca saca de /login por la mera existencia de la cookie: una cookie vencida haría un ciclo.
 */
export function proxy(solicitud: NextRequest): NextResponse {
  if (solicitud.cookies.has(NOMBRE_COOKIE_SESION)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL('/login', solicitud.url));
}

export const config = {
  // Todo menos la raíz (decide sola), /login, los recursos de Next y los archivos estáticos.
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).+)'],
};
