"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatPrice, formatKilometrage } from "@/lib/utils";
import { Dossier, Document, StatutDossier, StatutDocument, TypeDocument, Vehicule } from "@/lib/types";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

const documentLabels: Record<TypeDocument, string> = {
  identite: "Pièce d'identité",
  justificatif_domicile: "Justificatif de domicile",
  justificatif_revenus: "Justificatif de revenus",
  permis_conduire: "Permis de conduire",
};

const statutConfig: Record<
  StatutDossier,
  { icon: LucideIcon; color: string; label: string }
> = {
  brouillon: { icon: Clock, color: "text-gray-500", label: "Brouillon" },
  soumis: { icon: FileText, color: "text-blue-500", label: "Soumis" },
  en_cours: {
    icon: Clock,
    color: "text-yellow-500",
    label: "En cours de traitement",
  },
  valide: { icon: CheckCircle, color: "text-green-500", label: "Validé" },
  refuse: { icon: XCircle, color: "text-red-500", label: "Refusé" },
};

const documentStatutConfig: Record<
  StatutDocument,
  { icon: LucideIcon; color: string; label: string }
> = {
  en_attente: { icon: Clock, color: "text-gray-500", label: "En attente" },
  valide: { icon: CheckCircle, color: "text-green-500", label: "Validé" },
  refuse: { icon: XCircle, color: "text-red-500", label: "Refusé" },
};

export default function DossierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [vehicle, setVehicle] = useState<Vehicule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchDossier() {
      if (!id || !user) return;
      try {
        const response = await fetch(`/api/dossiers/${id}`);
        if (response.ok) {
          const result = await response.json();
          setDossier(result.data);

          if (result.data?.vehicule_id) {
            const vehicleResponse = await fetch(
              `/api/vehicles/${result.data.vehicule_id}`,
            );
            if (vehicleResponse.ok) {
              const vehicleResult = await vehicleResponse.json();
              setVehicle(vehicleResult.data);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dossier:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDossier();
  }, [id, user]);

  if (authLoading || !user || loading) return null;

  if (!dossier) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Dossier non trouvé</p>
              <Button asChild>
                <Link href="/search">Retour à la recherche</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (user.role === "client" && dossier.client_id !== user.id) {
    router.push("/");
    return null;
  }

  const config = statutConfig[dossier.statut as StatutDossier];
  const Icon = config.icon;

  const timeline: { statut: StatutDossier; active: boolean }[] = [
    {
      statut: "soumis",
      active: ["soumis", "en_cours", "valide", "refuse"].includes(
        dossier.statut,
      ),
    },
    {
      statut: "en_cours",
      active: ["en_cours", "valide", "refuse"].includes(dossier.statut),
    },
    {
      statut: dossier.statut === "valide" ? "valide" : "refuse",
      active: ["valide", "refuse"].includes(dossier.statut),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/search">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la recherche
              </Link>
            </Button>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2">Dossier d&apos;achat</CardTitle>
                    <CardDescription>
                      Créé le {formatDate(dossier.date_creation)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      dossier.statut === "valide"
                        ? "success"
                        : dossier.statut === "refuse"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-sm px-3 py-1"
                  >
                    <Icon className="mr-1 h-4 w-4" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              {vehicle && (
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">
                        {vehicle.marque} {vehicle.modele}
                      </h3>
                      <p className="text-muted-foreground">
                        {vehicle.motorisation}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vehicle.annee} •{" "}
                        {formatKilometrage(vehicle.kilometrage)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Prix d&apos;achat
                      </div>
                      <div className="text-2xl font-bold">
                        {formatPrice(vehicle.prix_vente || 0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suivi du dossier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {timeline.map((step, index) => {
                    const stepConfig = statutConfig[step.statut];
                    const StepIcon = stepConfig.icon;
                    const isLast = index === timeline.length - 1;

                    return (
                      <div key={step.statut} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`rounded-full p-2 ${
                              step.active
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            <StepIcon className="h-5 w-5" />
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 h-12 mt-2 ${
                                step.active ? "bg-primary" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <h4
                            className={`font-semibold ${step.active ? "" : "text-muted-foreground"}`}
                          >
                            {stepConfig.label}
                          </h4>
                          {step.active && step.statut === dossier.statut && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Dernière mise à jour :{" "}
                              {formatDate(dossier.date_modification)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {dossier.commentaire_admin && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                          Message de l&apos;administrateur
                        </h4>
                        <p className="text-sm text-blue-700">
                          {dossier.commentaire_admin}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  {dossier.documents.length} document
                  {dossier.documents.length > 1 ? "s" : ""} déposé
                  {dossier.documents.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dossier.documents.map((doc: Document) => {
                    const docConfig =
                      documentStatutConfig[doc.statut as StatutDocument];
                    const DocIcon = docConfig.icon;

                    return (
                      <div
                        key={doc.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                {
                                  documentLabels[
                                    doc.type_document as TypeDocument
                                  ]
                                }
                              </h4>
                              <Badge
                                variant={
                                  doc.statut === "valide"
                                    ? "success"
                                    : doc.statut === "refuse"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                <DocIcon className="mr-1 h-3 w-3" />
                                {docConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {doc.fichier_nom} • Déposé le{" "}
                              {formatDate(doc.date_upload)}
                            </p>
                            {doc.fichier_url && (
                              <a
                                href={doc.fichier_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 underline hover:text-blue-800"
                              >
                                Voir le document
                              </a>
                            )}
                            {doc.commentaire && (
                              <p className="text-sm text-red-600 mt-1 italic">
                                {doc.commentaire}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {dossier.contrat_location && (
              <Card>
                <CardHeader>
                  <CardTitle>Détails du contrat de location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée</span>
                    <span className="font-medium">
                      {dossier.contrat_location.duree_mois} mois
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Option d&apos;achat
                    </span>
                    <span className="font-medium">
                      {dossier.contrat_location.option_achat ? "Oui" : "Non"}
                    </span>
                  </div>
                  {dossier.contrat_location.prix_rachat && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Prix de rachat
                      </span>
                      <span className="font-medium">
                        {formatPrice(dossier.contrat_location.prix_rachat)}
                      </span>
                    </div>
                  )}
                  {dossier.contrat_location.options_incluses.length > 0 && (
                    <div className="pt-3 border-t">
                      <h4 className="font-semibold mb-2">Services inclus</h4>
                      <div className="space-y-1">
                        {dossier.contrat_location.options_incluses.map(
                          (optId: string) => (
                            <div
                              key={optId}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{optId}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
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
