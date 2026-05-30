import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userCookie = request.cookies.get('mmotors_user');
  let user = null;

  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value));
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('mmotors_user');
      return response;
    }
  }

  // Routes admin — nécessite le rôle admin
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Routes client authentifié
  const protectedClientRoutes = ['/dashboard', '/dossier'];
  const isProtectedClientRoute = protectedClientRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedClientRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Login/Register — redirige si déjà connecté
  if (pathname === '/login' || pathname === '/register') {
    if (user) {
      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/vehicles', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
