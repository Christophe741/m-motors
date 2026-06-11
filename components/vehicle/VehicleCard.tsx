import Link from "next/link";
import Image from "next/image";
import { Vehicule } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatKilometrage } from "@/lib/utils";
import { Calendar, Gauge, Fuel, Settings } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicule;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const canBuy =
    vehicle.type_offre === "vente" || vehicle.type_offre === "vente_location";
  const canRent =
    vehicle.type_offre === "location" ||
    vehicle.type_offre === "vente_location";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-slate-200">
        <Image
          src={vehicle.photos[0]}
          alt={`${vehicle.marque} ${vehicle.modele}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur">
            {vehicle.statut === "disponible" ? "Disponible" : vehicle.statut}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-bold text-lg">
            {vehicle.marque} {vehicle.modele}
          </h3>
          <p className="text-sm text-muted-foreground">{vehicle.motorisation}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{vehicle.annee}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>{formatKilometrage(vehicle.kilometrage)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Fuel className="h-4 w-4" />
            <span>{vehicle.carburant}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span>{vehicle.transmission}</span>
          </div>
        </div>

        <div className="space-y-2">
          {canBuy && vehicle.prix_vente && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                Prix d&apos;achat
              </span>
              <span className="font-bold text-lg">
                {formatPrice(vehicle.prix_vente)}
              </span>
            </div>
          )}
          {canRent && vehicle.prix_location_mensuel && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                Location/mois
              </span>
              <span className="font-bold text-lg">
                {formatPrice(vehicle.prix_location_mensuel)}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Button asChild className="w-full">
          <Link href={`/vehicle/${vehicle.id}`}>Voir les détails</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
