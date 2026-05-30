import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/server/database';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    if (!userData.email || !userData.mot_de_passe || !userData.nom || !userData.prenom || !userData.telephone || !userData.adresse) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    const newUser = await createUser({
      ...userData,
      role: 'client',
    });

    const token = await signToken({ sub: newUser.id, role: newUser.role });

    const { mot_de_passe: _mot_de_passe, ...userWithoutPassword } = newUser;

    const response = NextResponse.json({ success: true, user: userWithoutPassword });
    response.cookies.set('mmotors_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
