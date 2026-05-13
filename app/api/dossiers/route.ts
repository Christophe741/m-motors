import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';

export async function POST(request: NextRequest) {
  const userCookie = request.cookies.get('mmotors_user');
  if (!userCookie) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.client_id || !data.vehicule_id || !data.type_dossier) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const dossier = await prisma.dossier.create({
      data: {
        client_id: data.client_id,
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
      },
      include: { documents: true },
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
