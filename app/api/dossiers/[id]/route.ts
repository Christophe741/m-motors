import { NextRequest, NextResponse } from 'next/server';
import { getDossierById } from '@/server/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userCookie = request.cookies.get('mmotors_user');
  if (!userCookie) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const dossier = await getDossierById(id);

    if (!dossier) {
      return NextResponse.json(
        { success: false, error: 'Dossier non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dossier });
  } catch (error) {
    console.error('Error fetching dossier:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
