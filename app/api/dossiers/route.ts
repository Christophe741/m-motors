import { NextRequest, NextResponse } from 'next/server';
import { getAllDossiers, getDossiersByClientId } from '@/server/database';
import { prisma } from '@/server/prisma';
import { getAuthUser } from '@/lib/jwt';
import { withErrorHandler } from '@/lib/api-handler';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const clientId = request.nextUrl.searchParams.get('clientId');

  // Un client ne peut voir que ses propres dossiers
  const targetClientId = user.role === 'admin' ? clientId : user.sub;

  const dossiers = targetClientId
    ? await getDossiersByClientId(targetClientId)
    : await getAllDossiers();

  return NextResponse.json({ success: true, data: dossiers, count: dossiers.length });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const data = await request.json();

  if (!data.vehicule_id || !data.type_dossier) {
    return NextResponse.json(
      { success: false, error: 'Données manquantes' },
      { status: 400 }
    );
  }

  // Snapshot des options : le client envoie des IDs d'options, mais on ne les
  // stocke pas tels quels. On va lire le catalogue Option côté serveur (prix de
  // confiance, jamais celui du client) et figer { nom, prix_mensuel } dans le
  // contrat. Les IDs inconnus sont ignorés → pas de référence orpheline.
  let optionsSnapshot: { nom: string; prix_mensuel: number }[] = [];
  const optionIds: string[] = data.contrat_location?.options_incluses ?? [];
  if (optionIds.length > 0) {
    const options = await prisma.option.findMany({
      where: { id: { in: optionIds } },
    });
    const parId = new Map(options.map((o) => [o.id, o]));
    optionsSnapshot = optionIds
      .map((id) => parId.get(id))
      .filter((o): o is NonNullable<typeof o> => Boolean(o))
      .map((o) => ({ nom: o.nom, prix_mensuel: Number(o.prix_mensuel) }));
  }

  const dossier = await prisma.dossier.create({
    data: {
      client_id: user.sub,
      vehicule_id: data.vehicule_id,
      type_dossier: data.type_dossier,
      statut: 'soumis',
      documents: {
        create: data.documents.map((doc: { type_document: string; fichier_nom: string; fichier_type: string; fichier_url?: string; fichier_key?: string }) => ({
          type_document: doc.type_document,
          fichier_nom: doc.fichier_nom,
          fichier_type: doc.fichier_type,
          fichier_url: doc.fichier_url ?? null,
          fichier_key: doc.fichier_key ?? null,
          statut: 'en_attente',
        })),
      },
      // On ne recopie jamais prix_rachat depuis le client : c'est l'admin qui
      // le fixe lors de la validation (action set_prix_rachat sur le PATCH).
      ...(data.contrat_location && {
        contrat_location: {
          create: {
            duree_mois: data.contrat_location.duree_mois,
            option_achat: Boolean(data.contrat_location.option_achat),
            options_incluses: optionsSnapshot,
          },
        },
      }),
    },
    include: { documents: true, contrat_location: true },
  });

  return NextResponse.json({ success: true, data: dossier });
});
