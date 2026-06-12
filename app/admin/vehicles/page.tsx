"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVehicles } from '@/hooks';
import { formatPrice, formatKilometrage } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';
import { StatutVehicule, VehicleFilters } from '@/lib/types';

const statutColors: Record<StatutVehicule, 'success' | 'warning' | 'destructive' | 'secondary' | 'default'> = {
  disponible: 'success',
  reserve: 'warning',
  vendu: 'secondary',
  loue: 'secondary',
  maintenance: 'warning',
};

export default function AdminVehiclesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterMarque, setFilterMarque] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [marques, setMarques] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetch('/api/marques')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMarques(data.data);
      })
      .catch(() => {});
  }, []);

  // Les filtres sont appliqués côté serveur : avec un catalogue paginé,
  // filtrer en mémoire ne porterait que sur les pages déjà chargées
  const filters = useMemo<VehicleFilters>(
    () => ({
      search: debouncedSearch || undefined,
      marque: filterMarque || undefined,
      statut: (filterStatut || undefined) as StatutVehicule | undefined,
    }),
    [debouncedSearch, filterMarque, filterStatut]
  );

  const { vehicles, total, loading, loadingMore, hasMore, loadMore } =
    useVehicles(filters);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestion des Véhicules</h1>
              <p className="text-muted-foreground">
                {total} véhicule{total > 1 ? 's' : ''}
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/vehicles/create">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un véhicule
              </Link>
            </Button>
          </div>

          {/* Filtres */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Recherche</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Marque, modèle..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Marque</Label>
                  <Select value={filterMarque || 'all'} onValueChange={(v) => setFilterMarque(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {marques.map((marque) => (
                        <SelectItem key={marque} value={marque}>{marque}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={filterStatut || 'all'} onValueChange={(v) => setFilterStatut(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="reserve">Réservé</SelectItem>
                      <SelectItem value="vendu">Vendu</SelectItem>
                      <SelectItem value="loue">Loué</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setSearch(''); setFilterMarque(''); setFilterStatut(''); }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des véhicules */}
          <div className="space-y-4">
            {loading && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Chargement...
                </CardContent>
              </Card>
            )}

            {!loading && vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">
                          {vehicle.marque} {vehicle.modele}
                        </h3>
                        <Badge variant={statutColors[vehicle.statut]}>
                          {vehicle.statut}
                        </Badge>
                        {vehicle.type_offre === 'vente_location' && (
                          <Badge variant="secondary">Vente & Location</Badge>
                        )}
                        {vehicle.type_offre === 'vente' && (
                          <Badge variant="outline">Vente uniquement</Badge>
                        )}
                        {vehicle.type_offre === 'location' && (
                          <Badge variant="outline">Location uniquement</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{vehicle.motorisation}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Année:</span>{' '}
                          <span className="font-medium">{vehicle.annee}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kilométrage:</span>{' '}
                          <span className="font-medium">{formatKilometrage(vehicle.kilometrage)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carburant:</span>{' '}
                          <span className="font-medium">{vehicle.carburant}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transmission:</span>{' '}
                          <span className="font-medium">{vehicle.transmission}</span>
                        </div>
                      </div>

                      <div className="flex gap-6 mt-3">
                        {vehicle.prix_vente && (
                          <div>
                            <span className="text-sm text-muted-foreground">Achat:</span>{' '}
                            <span className="font-bold">{formatPrice(vehicle.prix_vente)}</span>
                          </div>
                        )}
                        {vehicle.prix_location_mensuel && (
                          <div>
                            <span className="text-sm text-muted-foreground">Location/mois:</span>{' '}
                            <span className="font-bold">{formatPrice(vehicle.prix_location_mensuel)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/vehicle/${vehicle.id}`} target="_blank">Voir</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!loading && vehicles.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Aucun véhicule trouvé
                </CardContent>
              </Card>
            )}

            {!loading && hasMore && (
              <div className="text-center pt-2">
                <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore
                    ? 'Chargement...'
                    : `Voir plus (${vehicles.length} sur ${total})`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
