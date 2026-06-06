import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword } from '@/server/database';
import { signToken } from '@/lib/jwt';
import { withErrorHandler } from '@/lib/api-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: 'Email et mot de passe requis' },
      { status: 400 }
    );
  }

  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Email ou mot de passe incorrect' },
      { status: 401 }
    );
  }

  const isValid = await verifyPassword(password, user.mot_de_passe);

  if (!isValid) {
    return NextResponse.json(
      { success: false, error: 'Email ou mot de passe incorrect' },
      { status: 401 }
    );
  }

  const token = await signToken({ sub: user.id, role: user.role });

  const { mot_de_passe: _mot_de_passe, ...userWithoutPassword } = user;

  const response = NextResponse.json({ success: true, user: userWithoutPassword });
  response.cookies.set('mmotors_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
});
