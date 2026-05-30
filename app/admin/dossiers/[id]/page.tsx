"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDate, formatPrice } from '@/lib/utils';
import { Document, StatutDocument, StatutDossier, TypeDocument } from '@/lib/types';
import { ArrowLeft, FileText, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DossierDetail {
  id: string;
  type_dossier: 'achat' | 'location';
  statut: StatutDossier;
  commentaire_admin?: string;
  documents: Document[];
  contrat_location?: {
    duree_mois: number;
    option_achat: boolean;
    prix_rachat?: number;
  };
  client: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
  } | null;
  vehicule: {
    marque: string;
    modele: string;
    motorisation: string;
    annee: number;
    kilometrage: number;
    prix_vente?: number;
    prix_location_mensuel?: number;
  } | null;
}

const documentLabels: Record<TypeDocument, string> = {
  identite: 'Pièce d\'identité',
  justificatif_domicile: 'Justificatif de domicile',
  justificatif_revenus: 'Justificatif de revenus',
  permis_conduire: 'Permis de conduire',
};

export default function AdminDossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<DossierDetail | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    async function fetchDossier() {
      try {
        const response = await fetch(`/api/dossiers/${id}`);
        if (response.ok) {
          const result = await response.json();
          setDossier(result.data);
        }
      } catch (error) {
        console.error('Error fetching dossier:', error);
      } finally {
        setFetchLoading(false);
      }
    }

    if (id) fetchDossier();
  }, [id]);

  const updateDocumentStatus = async (dossierId: string, documentId: string, statut: StatutDocument, commentaireDoc?: string) => {
    try {
      const response = await fetch(`/api/dossiers/${dossierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_document', documentId, statut, commentaire: commentaireDoc }),
      });

      if (response.ok) {
        const result = await response.json();
        setDossier(result.data);
        toast.success(`Document ${statut === 'valide' ? 'validé' : 'refusé'}`);
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Erreur lors de la mise à jour du document');
    }
  };

  const updateDossierStatus = async (dossierId: string, statut: StatutDossier, commentaireDoc?: string) => {
    try {
      const response = await fetch(`/api/dossiers/${dossierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', statut, commentaire_admin: commentaireDoc }),
      });

      if (response.ok) {
        const result = await response.json();
        setDossier(result.data);
      }
    } catch (error) {
      console.error('Error updating dossier:', error);
      toast.error('Erreur lors de la mise à jour du dossier');
    }
  };

  if (fetchLoading || !dossier) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {fetchLoading ? 'Chargement...' : 'Dossier non trouvé'}
              </p>
              {!fetchLoading && (
                <Button asChild>
                  <Link href="/admin/dossiers">Retour à la liste</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const { vehicule, client } = dossier;

  const handleDocumentAction = (documentId: string, statut: StatutDocument, commentaireDoc?: string) => {
    updateDocumentStatus(dossier.id, documentId, statut, commentaireDoc);

    const allDocsValid = dossier.documents.every(
      (d: Document) => d.id === documentId ? statut === 'valide' : d.statut === 'valide'
    );

    if (allDocsValid && dossier.statut === 'soumis') {
      updateDossierStatus(dossier.id, 'en_cours');
    }
  };

  const handleValidateDossier = async () => {
    setLoading(true);
    await updateDossierStatus(dossier.id, 'valide', commentaire || 'Dossier validé');
    toast.success('Dossier validé avec succès !');
    setLoading(false);
    setTimeout(() => router.push('/admin/dossiers'), 1500);
  };

  const handleRejectDossier = async () => {
    if (!commentaire) {
      toast.error('Veuillez indiquer un motif de refus');
      return;
    }
    setLoading(true);
    await updateDossierStatus(dossier.id, 'refuse', commentaire);
    toast.error('Dossier refusé');
    setLoading(false);
    setTimeout(() => router.push('/admin/dossiers'), 1500);
  };

  const allDocumentsValid = dossier.documents.length > 0 && dossier.documents.every((d: Document) => d.statut === 'valide');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/admin/dossiers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* En-tête */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2">
                      Dossier {dossier.type_dossier === 'achat' ? 'd\'achat' : 'de location'}
                    </CardTitle>
                    <CardDescription>Référence: {dossier.id}</CardDescription>
                  </div>
                  <Badge
                    variant={dossier.statut === 'valide' ? 'success' : dossier.statut === 'refuse' ? 'destructive' : 'secondary'}
                    className="text-base px-4 py-1"
                  >
                    {dossier.statut}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle>Informations Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Nom complet:</span>
                    <div className="font-medium">{client ? `${client.prenom} ${client.nom}` : 'Inconnu'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <div className="font-medium">{client?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Téléphone:</span>
                    <div className="font-medium">{client?.telephone || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Adresse:</span>
                    <div className="font-medium">{client?.adresse || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations véhicule */}
            {vehicule && (
              <Card>
                <CardHeader>
                  <CardTitle>Véhicule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{vehicule.marque} {vehicule.modele}</h3>
                      <p className="text-muted-foreground">{vehicule.motorisation}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vehicule.annee} • {vehicule.kilometrage} km
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {dossier.type_dossier === 'achat' ? 'Prix d\'achat' : 'Location/mois'}
                      </div>
                      <div className="text-2xl font-bold">
                        {formatPrice(dossier.type_dossier === 'achat' ? vehicule.prix_vente ?? 0 : vehicule.prix_location_mensuel ?? 0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documents à valider</CardTitle>
                <CardDescription>
                  {dossier.documents.filter((d: Document) => d.statut === 'valide').length} / {dossier.documents.length} documents validés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dossier.documents.map((doc: Document) => (
                    <div key={doc.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{documentLabels[doc.type_document]}</h4>
                              <Badge variant={doc.statut === 'valide' ? 'success' : doc.statut === 'refuse' ? 'destructive' : 'secondary'}>
                                {doc.statut}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {doc.fichier_nom} • {formatDate(doc.date_upload)}
                            </p>
                            {doc.commentaire && (
                              <p className="text-sm text-red-600 mt-2 italic">{doc.commentaire}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {doc.statut === 'en_attente' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDocumentAction(doc.id, 'valide')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              const motif = prompt('Motif du refus:');
                              if (motif) handleDocumentAction(doc.id, 'refuse', motif);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Refuser
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contrat de location */}
            {dossier.contrat_location && (
              <Card>
                <CardHeader>
                  <CardTitle>Contrat de location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée</span>
                    <span className="font-medium">{dossier.contrat_location.duree_mois} mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Option d&apos;achat</span>
                    <span className="font-medium">{dossier.contrat_location.option_achat ? 'Oui' : 'Non'}</span>
                  </div>
                  {dossier.contrat_location.prix_rachat && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix de rachat</span>
                      <span className="font-medium">{formatPrice(dossier.contrat_location.prix_rachat)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions admin */}
            {dossier.statut !== 'valide' && dossier.statut !== 'refuse' && (
              <Card>
                <CardHeader>
                  <CardTitle>Validation du dossier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
                    <Textarea
                      id="commentaire"
                      placeholder="Ajoutez un commentaire pour le client..."
                      rows={3}
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button size="lg" className="flex-1" onClick={handleValidateDossier} disabled={!allDocumentsValid || loading}>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Valider le dossier
                    </Button>
                    <Button size="lg" variant="destructive" className="flex-1" onClick={handleRejectDossier} disabled={loading}>
                      <XCircle className="mr-2 h-5 w-5" />
                      Refuser le dossier
                    </Button>
                  </div>

                  {!allDocumentsValid && (
                    <p className="text-sm text-amber-600 text-center">
                      Tous les documents doivent être validés avant de valider le dossier
                    </p>
                  )}
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
