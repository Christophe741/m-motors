import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/server/database';
import { signToken } from '@/lib/jwt';
import { withErrorHandler } from '@/lib/api-handler';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide'),
  mot_de_passe: z.string().trim().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  nom: z.string().trim().min(1, 'Nom requis'),
  prenom: z.string().trim().min(1, 'Prénom requis'),
  telephone: z.string().trim().min(10, 'Numéro de téléphone invalide'),
  adresse: z.string().trim().min(1, 'Adresse requise'),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const userData = parsed.data;

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
});
