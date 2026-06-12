"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TypeOffre, StatutVehicule } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateVehiclePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    motorisation: '',
    kilometrage: '',
    annee: new Date().getFullYear().toString(),
    prix_vente: '',
    prix_location_mensuel: '',
    type_offre: 'vente' as TypeOffre,
    statut: 'disponible' as StatutVehicule,
    description: '',
    carburant: 'Essence',
    transmission: 'Manuelle',
    puissance: '',
    couleur: '',
    photos: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vehicleData = {
        ...formData,
        kilometrage: Number(formData.kilometrage),
        annee: Number(formData.annee),
        prix_vente: formData.prix_vente ? Number(formData.prix_vente) : undefined,
        prix_location_mensuel: formData.prix_location_mensuel ? Number(formData.prix_location_mensuel) : undefined,
        photos: [formData.photos, formData.photos],
        options: [],
      };

      if (!vehicleData.prix_vente && !vehicleData.prix_location_mensuel) {
        toast.error('Veuillez renseigner au moins un prix (vente ou location)');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        toast.success('Véhicule créé avec succès !');
        router.push('/admin/vehicles');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create vehicle');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du véhicule');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/admin/vehicles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Ajouter un véhicule</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de base</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marque">Marque *</Label>
                      <Input id="marque" name="marque" value={formData.marque} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modele">Modèle *</Label>
                      <Input id="modele" name="modele" value={formData.modele} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motorisation">Motorisation *</Label>
                    <Input
                      id="motorisation"
                      name="motorisation"
                      placeholder="Ex: 1.2 PureTech 100ch"
                      value={formData.motorisation}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="Description détaillée du véhicule..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Caractéristiques */}
              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annee">Année *</Label>
                      <Input
                        id="annee"
                        name="annee"
                        type="number"
                        min="2000"
                        max={new Date().getFullYear()}
                        value={formData.annee}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kilometrage">Kilométrage (km) *</Label>
                      <Input
                        id="kilometrage"
                        name="kilometrage"
                        type="number"
                        min="0"
                        value={formData.kilometrage}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="puissance">Puissance *</Label>
                      <Input
                        id="puissance"
                        name="puissance"
                        placeholder="Ex: 100 ch"
                        value={formData.puissance}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Carburant *</Label>
                      <Select value={formData.carburant} onValueChange={handleSelectChange('carburant')}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Essence">Essence</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Hybride">Hybride</SelectItem>
                          <SelectItem value="Électrique">Électrique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Transmission *</Label>
                      <Select value={formData.transmission} onValueChange={handleSelectChange('transmission')}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manuelle">Manuelle</SelectItem>
                          <SelectItem value="Automatique">Automatique</SelectItem>
                          <SelectItem value="Automatique DSG">Automatique DSG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="couleur">Couleur *</Label>
                      <Input id="couleur" name="couleur" value={formData.couleur} onChange={handleChange} required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prix et disponibilité */}
              <Card>
                <CardHeader>
                  <CardTitle>Prix et Disponibilité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Type d&apos;offre *</Label>
                      <Select value={formData.type_offre} onValueChange={handleSelectChange('type_offre')}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vente">Vente uniquement</SelectItem>
                          <SelectItem value="location">Location uniquement</SelectItem>
                          <SelectItem value="vente_location">Vente et Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Statut *</Label>
                      <Select value={formData.statut} onValueChange={handleSelectChange('statut')}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponible">Disponible</SelectItem>
                          <SelectItem value="reserve">Réservé</SelectItem>
                          <SelectItem value="vendu">Vendu</SelectItem>
                          <SelectItem value="loue">Loué</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prix_vente">Prix de vente (€)</Label>
                      <Input
                        id="prix_vente"
                        name="prix_vente"
                        type="number"
                        min="0"
                        placeholder="Ex: 15000"
                        value={formData.prix_vente}
                        onChange={handleChange}
                        disabled={formData.type_offre === 'location'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prix_location_mensuel">Prix location/mois (€)</Label>
                      <Input
                        id="prix_location_mensuel"
                        name="prix_location_mensuel"
                        type="number"
                        min="0"
                        placeholder="Ex: 350"
                        value={formData.prix_location_mensuel}
                        onChange={handleChange}
                        disabled={formData.type_offre === 'vente'}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photo */}
              <Card>
                <CardHeader>
                  <CardTitle>Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="photos">URL de la photo principale</Label>
                    <Input
                      id="photos"
                      name="photos"
                      type="url"
                      value={formData.photos}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                  {loading ? 'Création...' : 'Créer le véhicule'}
                </Button>
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="/admin/vehicles">Annuler</Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
