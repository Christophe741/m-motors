"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface AdminFiltersProps {
  filterStatut: string;
  setFilterStatut: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  onReset: () => void;
}

export function AdminFilters({
  filterStatut,
  setFilterStatut,
  filterType,
  setFilterType,
  onReset,
}: AdminFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={filterStatut || 'all'} onValueChange={(v) => setFilterStatut(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="soumis">Soumis</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="valide">Validé</SelectItem>
                <SelectItem value="refuse">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={filterType || 'all'} onValueChange={(v) => setFilterType(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="achat">Achat</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>&nbsp;</Label>
            <Button variant="outline" className="w-full" onClick={onReset}>
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
