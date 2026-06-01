import { NextRequest, NextResponse } from 'next/server';
import { getDossierById } from '@/server/database';
import { prisma } from '@/server/prisma';
import { getAuthUser } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
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

    if (user.role !== 'admin' && dossier.client_id !== user.sub) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
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
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

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
    } else {
      dossier = await prisma.dossier.update({
        where: { id },
        data: {
          statut: updates.statut,
          commentaire_admin: updates.commentaire_admin,
        },
        include: { documents: true, contrat_location: true },
      });
    }

    return NextResponse.json({ success: true, data: dossier });
  } catch (error) {
    console.error('Error updating dossier:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
