"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Dossier, StatutDossier, Document } from '@/lib/types';

interface DossierAdmin extends Dossier {
  client: { prenom: string; nom: string; email: string } | null;
  vehicule: { marque: string; modele: string } | null;
}

interface AdminDossierCardProps {
  dossier: DossierAdmin;
  statutConfig: Record<StatutDossier, {
    variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info';
    label: string;
  }>;
}

export function AdminDossierCard({ dossier, statutConfig }: AdminDossierCardProps) {
  const vehicle = dossier.vehicule;
  const client = dossier.client;
  const config = statutConfig[dossier.statut as StatutDossier];

  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <FileText className="h-6 w-6 text-muted-foreground mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">
                  {vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Véhicule inconnu'}
                </h3>
                <Badge variant={config.variant}>{config.label}</Badge>
                <Badge variant="outline">
                  {dossier.type_dossier === 'achat' ? 'Achat' : 'Location'}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                <div>
                  <strong>Client:</strong> {client ? `${client.prenom} ${client.nom}` : 'Inconnu'}
                </div>
                <div>
                  <strong>Email:</strong> {client?.email || 'N/A'}
                </div>
                <div>
                  <strong>Créé le:</strong> {formatDate(dossier.date_creation)}
                </div>
                <div>
                  <strong>Modifié le:</strong> {formatDate(dossier.date_modification)}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {dossier.documents.length} document{dossier.documents.length > 1 ? 's' : ''}
                </span>
                <span className="text-muted-foreground">
                  {dossier.documents.filter((d: Document) => d.statut === 'valide').length} validé
                  {dossier.documents.filter((d: Document) => d.statut === 'valide').length > 1 ? 's' : ''}
                </span>
              </div>

              {dossier.commentaire_admin && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  {dossier.commentaire_admin}
                </p>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/dossiers/${dossier.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Traiter
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
