import { NextRequest, NextResponse } from 'next/server';
import { getAllDossiers, getDossiersByClientId } from '@/server/database';
import { prisma } from '@/server/prisma';
import { getAuthUser } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const clientId = request.nextUrl.searchParams.get('clientId');

    // Un client ne peut voir que ses propres dossiers
    const targetClientId = user.role === 'admin' ? clientId : user.sub;

    const dossiers = targetClientId
      ? await getDossiersByClientId(targetClientId)
      : await getAllDossiers();

    return NextResponse.json({ success: true, data: dossiers, count: dossiers.length });
  } catch (error) {
    console.error('Error fetching dossiers:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.vehicule_id || !data.type_dossier) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const dossier = await prisma.dossier.create({
      data: {
        client_id: user.sub,
        vehicule_id: data.vehicule_id,
        type_dossier: data.type_dossier,
        statut: 'soumis',
        documents: {
          create: data.documents.map((doc: { type_document: string; fichier_nom: string; fichier_type: string }) => ({
            type_document: doc.type_document,
            fichier_nom: doc.fichier_nom,
            fichier_type: doc.fichier_type,
            statut: 'en_attente',
          })),
        },
        ...(data.contrat_location && {
          contrat_location: { create: data.contrat_location },
        }),
      },
      include: { documents: true, contrat_location: true },
    });

    return NextResponse.json({ success: true, data: dossier });
  } catch (error) {
    console.error('Error creating dossier:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
