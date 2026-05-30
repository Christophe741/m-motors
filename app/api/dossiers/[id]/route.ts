import { NextRequest, NextResponse } from 'next/server';
import { getDossierById } from '@/server/database';
import { prisma } from '@/server/prisma';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { action, ...updates } = body;

    let dossier;

    if (action === 'update_document') {
      const { documentId, statut, commentaire } = updates;
      await prisma.document.update({
        where: { id: documentId },
        data: { statut, commentaire },
      });
      dossier = await prisma.dossier.findUnique({
        where: { id },
        include: { documents: true, contrat_location: true },
      });
    } else if (action === 'update_status') {
      dossier = await prisma.dossier.update({
        where: { id },
        data: { statut: updates.statut, commentaire_admin: updates.commentaire_admin },
        include: { documents: true, contrat_location: true },
      });
    } else {
      dossier = await prisma.dossier.update({
        where: { id },
        data: updates,
        include: { documents: true, contrat_location: true },
      });
    }

    return NextResponse.json({ success: true, data: dossier });
  } catch (error) {
    console.error('Error updating dossier:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
