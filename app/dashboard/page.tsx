"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDossiers } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { FileText, Plus, Eye, Folder } from 'lucide-react';
import { Dossier, StatutDossier } from '@/lib/types';

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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { dossiers, loading } = useDossiers({ clientId: user?.id });

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      router.push('/admin/vehicles');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || loading) return null;

  const clientDossiers = dossiers as DossierClient[];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mon Espace Client</h1>
            <p className="text-muted-foreground">Bienvenue {user.prenom} {user.nom}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dossiers actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {clientDossiers.filter((d) => d.statut === 'soumis' || d.statut === 'en_cours').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dossiers validés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {clientDossiers.filter((d) => d.statut === 'valide').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total dossiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clientDossiers.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mes Dossiers</CardTitle>
                  <CardDescription>Suivez l&apos;avancement de vos demandes</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/search">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau dossier
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {clientDossiers.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore de dossier</p>
                  <Button asChild>
                    <Link href="/search">Rechercher un véhicule</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientDossiers.map((dossier) => {
                    const config = statutConfig[dossier.statut];
                    return (
                      <div key={dossier.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition">
                        <div className="flex items-start gap-4 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {dossier.vehicule ? `${dossier.vehicule.marque} ${dossier.vehicule.modele}` : 'Véhicule inconnu'}
                              </h3>
                              <Badge variant={config.variant}>{config.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {dossier.type_dossier === 'achat' ? "Dossier d'achat" : 'Dossier de location'}
                              {' • '}
                              Créé le {formatDate(dossier.date_creation)}
                            </p>
                            {dossier.commentaire_admin && (
                              <p className="text-sm text-muted-foreground mt-1 italic">{dossier.commentaire_admin}</p>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dossier/${dossier.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
