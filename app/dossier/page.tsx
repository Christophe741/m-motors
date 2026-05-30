"use client";

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDossiers } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { Eye, FileText, Plus } from 'lucide-react';
import { Dossier, Document, StatutDossier } from '@/lib/types';

interface DossierClient extends Dossier {
  vehicule?: { marque: string; modele: string } | null;
}

const statutConfig: Record<StatutDossier, { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info', label: string }> = {
  brouillon: { variant: 'secondary', label: 'Brouillon' },
  soumis: { variant: 'info', label: 'Soumis' },
  en_cours: { variant: 'warning', label: 'En cours' },
  valide: { variant: 'success', label: 'Validé' },
  refuse: { variant: 'destructive', label: 'Refusé' },
};

export default function MesDossiersPage() {
  const { user, loading: authLoading } = useAuth();
  const { dossiers, loading } = useDossiers({ clientId: user?.id });

  if (authLoading || !user || loading) return null;

  const clientDossiers = dossiers as DossierClient[];

  const stats = {
    total: clientDossiers.length,
    brouillon: clientDossiers.filter((d) => d.statut === 'brouillon').length,
    soumis: clientDossiers.filter((d) => d.statut === 'soumis').length,
    en_cours: clientDossiers.filter((d) => d.statut === 'en_cours').length,
    valide: clientDossiers.filter((d) => d.statut === 'valide').length,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mes Dossiers</h1>
              <p className="text-muted-foreground">
                {clientDossiers.length} dossier{clientDossiers.length > 1 ? 's' : ''}
              </p>
            </div>
            <Button asChild>
              <Link href="/search">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau dossier
              </Link>
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground mt-1">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-gray-600">{stats.brouillon}</div>
                <div className="text-sm text-muted-foreground mt-1">Brouillons</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.soumis}</div>
                <div className="text-sm text-muted-foreground mt-1">Soumis</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.en_cours}</div>
                <div className="text-sm text-muted-foreground mt-1">En cours</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.valide}</div>
                <div className="text-sm text-muted-foreground mt-1">Validés</div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des dossiers */}
          <div className="space-y-4">
            {clientDossiers.map((dossier) => {
              const config = statutConfig[dossier.statut];
              return (
                <Card key={dossier.id} className="hover:shadow-md transition">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <FileText className="h-6 w-6 text-muted-foreground mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-bold text-lg">
                              {dossier.vehicule ? `${dossier.vehicule.marque} ${dossier.vehicule.modele}` : 'Véhicule inconnu'}
                            </h3>
                            <Badge variant={config.variant}>{config.label}</Badge>
                            <Badge variant="outline">
                              {dossier.type_dossier === 'achat' ? 'Achat' : 'Location'}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                            <div><strong>Créé le:</strong> {formatDate(dossier.date_creation)}</div>
                            <div><strong>Modifié le:</strong> {formatDate(dossier.date_modification)}</div>
                          </div>

                          <div className="flex items-center gap-4 text-sm mb-2">
                            <span className="text-muted-foreground">
                              {dossier.documents?.length || 0} document{(dossier.documents?.length || 0) > 1 ? 's' : ''}
                            </span>
                            {dossier.documents && (
                              <span className="text-muted-foreground">
                                {dossier.documents.filter((d: Document) => d.statut === 'valide').length} validé
                                {dossier.documents.filter((d: Document) => d.statut === 'valide').length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          {dossier.commentaire_admin && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                              <p className="text-sm font-semibold text-blue-900 mb-1">Commentaire administrateur:</p>
                              <p className="text-sm text-blue-800">{dossier.commentaire_admin}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dossier/${dossier.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {clientDossiers.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun dossier</h3>
                  <p className="text-muted-foreground mb-6">
                    Vous n&apos;avez pas encore créé de dossier. Recherchez un véhicule pour commencer.
                  </p>
                  <Button asChild>
                    <Link href="/search">
                      <Plus className="mr-2 h-4 w-4" />
                      Rechercher un véhicule
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
