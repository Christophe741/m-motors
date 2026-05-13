"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, formatKilometrage } from '@/lib/utils';
import { TypeDocument, Vehicule } from '@/lib/types';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const documentTypes: { value: TypeDocument; label: string }[] = [
  { value: 'identite', label: "Pièce d'identité" },
  { value: 'justificatif_domicile', label: 'Justificatif de domicile' },
  { value: 'justificatif_revenus', label: 'Justificatif de revenus' },
  { value: 'permis_conduire', label: 'Permis de conduire' },
];

export default function CreateDossierClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const vehicleId = searchParams.get('vehicleId');

  const [vehicle, setVehicle] = useState<Vehicule | null>(null);
  const [documents, setDocuments] = useState<{ [key in TypeDocument]?: File }>({});
  const [loading, setLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'client') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchVehicle() {
      if (!vehicleId) return;
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        if (response.ok) {
          const result = await response.json();
          setVehicle(result.data);
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
      } finally {
        setVehicleLoading(false);
      }
    }
    fetchVehicle();
  }, [vehicleId]);

  if (authLoading || !user || vehicleLoading || !vehicle || !vehicleId) {
    return null;
  }

  const handleFileChange = (type: TypeDocument, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments((prev) => ({ ...prev, [type]: file }));
      toast.success(`${documentTypes.find(d => d.value === type)?.label} ajouté`);
    }
  };

  const submitDossier = async () => {
    const missingDocs = documentTypes.filter((dt) => !documents[dt.value]);
    if (missingDocs.length > 0) {
      toast.error(`Documents manquants : ${missingDocs.map(d => d.label).join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: user.id,
          vehicule_id: vehicleId,
          type_dossier: 'achat',
          documents: Object.entries(documents).map(([type, file]) => ({
            type_document: type as TypeDocument,
            fichier_nom: (file as File).name,
            fichier_type: (file as File).type,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Dossier soumis avec succès !');
        router.push(`/dossier/${result.data.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la soumission du dossier');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/vehicle/${vehicleId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au véhicule
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Déposer un dossier d&apos;achat</h1>
          <p className="text-muted-foreground">
            {vehicle.marque} {vehicle.modele} — {vehicle.motorisation}
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submitDossier(); }} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Véhicule sélectionné</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {vehicle.marque} {vehicle.modele}
                  </h3>
                  <p className="text-muted-foreground">{vehicle.motorisation}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vehicle.annee} • {formatKilometrage(vehicle.kilometrage)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Prix d&apos;achat</div>
                  <div className="text-2xl font-bold">
                    {formatPrice(vehicle.prix_vente || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents requis</CardTitle>
              <CardDescription>
                Téléchargez les 4 documents nécessaires pour votre dossier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentTypes.map((docType) => (
                <div key={docType.value} className="space-y-2">
                  <Label htmlFor={docType.value} className="flex items-center gap-2">
                    {documents[docType.value] ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    {docType.label}
                    {documents[docType.value] && (
                      <Badge variant="success" className="ml-2">Ajouté</Badge>
                    )}
                  </Label>
                  <Input
                    id={docType.value}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(docType.value, e)}
                  />
                  {documents[docType.value] && (
                    <p className="text-sm text-muted-foreground">
                      {(documents[docType.value] as File).name}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" size="lg" className="flex-1" disabled={loading}>
              {loading ? 'Soumission en cours...' : 'Soumettre le dossier'}
            </Button>
            <Button type="button" variant="outline" size="lg" asChild>
              <Link href={`/vehicle/${vehicleId}`}>Annuler</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
