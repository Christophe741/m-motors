import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VehicleImageGallery from "@/components/client/VehicleImageGallery";
import { getVehicleById } from "@/server/database";
import { formatPrice, formatKilometrage } from "@/lib/utils";
import {
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Palette,
  Zap,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) notFound();

  const canBuy =
    vehicle.type_offre === "vente" || vehicle.type_offre === "vente_location";
  const canRent =
    vehicle.type_offre === "location" ||
    vehicle.type_offre === "vente_location";

  return (
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

        <div className="grid lg:grid-cols-2 gap-8">
          <VehicleImageGallery
            photos={vehicle.photos}
            alt={`${vehicle.marque} ${vehicle.modele}`}
          />

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {vehicle.marque} {vehicle.modele}
              </h1>
              <p className="text-lg text-muted-foreground">
                {vehicle.motorisation}
              </p>
              <div className="mt-3">
                <Badge
                  className={
                    vehicle.statut === "disponible"
                      ? "bg-green-500 text-white"
                      : undefined
                  }
                >
                  {vehicle.statut === "disponible"
                    ? "Disponible"
                    : vehicle.statut}
                </Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tarifs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canBuy && vehicle.prix_vente && (
                  <div className="flex items-baseline justify-between border-b pb-3">
                    <div>
                      <div className="font-medium">Prix d&apos;achat</div>
                      <div className="text-sm text-muted-foreground">
                        Paiement comptant ou financement
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatPrice(vehicle.prix_vente)}
                    </div>
                  </div>
                )}
                {canRent && vehicle.prix_location_mensuel && (
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="font-medium">Location longue durée</div>
                      <div className="text-sm text-muted-foreground">
                        Par mois avec option d&apos;achat
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatPrice(vehicle.prix_location_mensuel)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Caractéristiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Année</div>
                      <div className="font-medium">{vehicle.annee}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gauge className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Kilométrage
                      </div>
                      <div className="font-medium">
                        {formatKilometrage(vehicle.kilometrage)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Fuel className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Carburant
                      </div>
                      <div className="font-medium">{vehicle.carburant}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Transmission
                      </div>
                      <div className="font-medium">{vehicle.transmission}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Puissance
                      </div>
                      <div className="font-medium">{vehicle.puissance}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Couleur
                      </div>
                      <div className="font-medium">{vehicle.couleur}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{vehicle.description}</p>
            </CardContent>
          </Card>

          {vehicle.options && vehicle.options.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Équipements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {vehicle.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
