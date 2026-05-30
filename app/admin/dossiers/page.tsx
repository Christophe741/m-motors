"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminFilters } from '@/components/admin/AdminFilters';
import { AdminDossierCard, DossierAdmin } from '@/components/admin/AdminDossierCard';
import { useDossiers } from '@/hooks';
import { StatutDossier } from '@/lib/types';

const statutConfig: Record<StatutDossier, { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info', label: string }> = {
  brouillon: { variant: 'secondary', label: 'Brouillon' },
  soumis: { variant: 'info', label: 'Soumis' },
  en_cours: { variant: 'warning', label: 'En cours' },
  valide: { variant: 'success', label: 'Validé' },
  refuse: { variant: 'destructive', label: 'Refusé' },
};

export default function AdminDossiersPage() {
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');

  const { dossiers: allDossiers, loading } = useDossiers();

  if (loading) return null;

  const filteredDossiers = (allDossiers as DossierAdmin[]).filter((d) => {
    if (filterStatut && d.statut !== filterStatut) return false;
    if (filterType && d.type_dossier !== filterType) return false;
    return true;
  });

  const stats = [
    { label: 'Total', value: allDossiers.length },
    { label: 'Soumis', value: allDossiers.filter((d) => d.statut === 'soumis').length, color: 'text-blue-600' },
    { label: 'En cours', value: allDossiers.filter((d) => d.statut === 'en_cours').length, color: 'text-yellow-600' },
    { label: 'Validés', value: allDossiers.filter((d) => d.statut === 'valide').length, color: 'text-green-600' },
    { label: 'Refusés', value: allDossiers.filter((d) => d.statut === 'refuse').length, color: 'text-red-600' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Gestion des Dossiers</h1>
            <p className="text-muted-foreground">
              {filteredDossiers.length} dossier{filteredDossiers.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="mb-6">
            <AdminStats stats={stats} />
          </div>

          <div className="mb-6">
            <AdminFilters
              filterStatut={filterStatut}
              setFilterStatut={setFilterStatut}
              filterType={filterType}
              setFilterType={setFilterType}
              onReset={() => { setFilterStatut(''); setFilterType(''); }}
            />
          </div>

          <div className="space-y-4">
            {filteredDossiers.map((dossier) => (
              <AdminDossierCard key={dossier.id} dossier={dossier} statutConfig={statutConfig} />
            ))}

            {filteredDossiers.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Aucun dossier trouvé
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
