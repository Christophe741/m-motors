import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/server/database';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Validation
    if (!userData.email || !userData.mot_de_passe) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (!userData.nom || !userData.prenom || !userData.telephone || !userData.adresse) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Create user (password will be hashed in createUser)
    const newUser = await createUser({
      ...userData,
      role: 'client',
    });

    // Remove password from response
    const { mot_de_passe: _mot_de_passe, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
