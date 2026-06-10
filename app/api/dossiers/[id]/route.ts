import { NextRequest, NextResponse } from 'next/server';
import { getDossierById } from '@/server/database';
import { prisma } from '@/server/prisma';
import { getAuthUser } from '@/lib/jwt';
import { withErrorHandler } from '@/lib/api-handler';

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;
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
});

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, ...updates } = body;

  let dossier;

  if (action === 'update_document') {
    const { documentId, statut, commentaire } = updates;

    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document || document.dossier_id !== id) {
      return NextResponse.json({ success: false, error: 'Document introuvable' }, { status: 404 });
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { statut, commentaire },
    });
    dossier = await prisma.dossier.findUnique({
      where: { id },
      include: { documents: true, contrat_location: true },
    });
  } else if (action === 'set_prix_rachat') {
    const prix = Number(updates.prix_rachat);
    if (!Number.isFinite(prix) || prix <= 0) {
      return NextResponse.json(
        { success: false, error: 'Prix de rachat invalide' },
        { status: 400 }
      );
    }

    const contrat = await prisma.contratLocation.findUnique({ where: { dossier_id: id } });
    if (!contrat) {
      return NextResponse.json(
        { success: false, error: 'Ce dossier n\'a pas de contrat de location' },
        { status: 404 }
      );
    }

    await prisma.contratLocation.update({
      where: { dossier_id: id },
      data: { prix_rachat: prix },
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
});
