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

  // Routes dossier — nécessite d'être connecté
  if (pathname.startsWith('/dossier')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Login/Register — redirige vers l'accueil si déjà connecté
  if (pathname === '/login' || pathname === '/register') {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
