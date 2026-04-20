"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VehicleFilters, Vehicule } from "@/lib/types";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface VehicleSearchClientProps {
  initialVehicles: Vehicule[];
  marques: string[];
}

export default function VehicleSearchClient({
  initialVehicles,
  marques,
}: VehicleSearchClientProps) {
  const [vehicles, setVehicles] = useState<Vehicule[]>(initialVehicles);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchVehicles = useCallback(async (filterParams: VehicleFilters) => {
    const params = new URLSearchParams();
    Object.entries(filterParams).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.append(k, String(v));
    });

    setIsLoading(true);
    try {
      const response = await fetch(`/api/vehicles?${params.toString()}`);
      const data = await response.json();
      if (data.success) setVehicles(data.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof VehicleFilters, value: string | number | undefined) => {
      const newFilters = { ...filters, [key]: value || undefined };
      setFilters(newFilters);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      if (key === "search") {
        debounceTimerRef.current = setTimeout(() => {
          fetchVehicles(newFilters);
        }, 500);
      } else {
        fetchVehicles(newFilters);
      }
    },
    [filters, fetchVehicles]
  );

  const resetFilters = useCallback(async () => {
    setFilters({});
    setIsLoading(true);
    try {
      const response = await fetch("/api/vehicles");
      const data = await response.json();
      if (data.success) setVehicles(data.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rechercher un véhicule</h1>
        <p className="text-muted-foreground">
          Trouvez votre véhicule parmi notre sélection de {vehicles.length}{" "}
          véhicules disponibles
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filtres */}
        <div className="lg:col-span-1">
          <Button
            className="lg:hidden w-full mb-4"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          </Button>

          <Card className={showFilters ? "" : "hidden lg:block"}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filtres
                </span>
                {Object.keys(filters).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-auto p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Marque, modèle..."
                    value={filters.search || ""}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type d&apos;offre</Label>
                <Select
                  value={filters.type_offre || ""}
                  onValueChange={(v) =>
                    handleFilterChange(
                      "type_offre",
                      v === "all" ? undefined : v
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="vente">Achat</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Marque</Label>
                <Select
                  value={filters.marque || ""}
                  onValueChange={(v) =>
                    handleFilterChange("marque", v === "all" ? undefined : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {marques.map((marque) => (
                      <SelectItem key={marque} value={marque}>
                        {marque}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prix maximum</Label>
                <Input
                  type="number"
                  placeholder="Ex: 25000"
                  value={filters.prix_max || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "prix_max",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Année minimum</Label>
                <Input
                  type="number"
                  placeholder="Ex: 2020"
                  value={filters.annee_min || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "annee_min",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Kilométrage maximum</Label>
                <Input
                  type="number"
                  placeholder="Ex: 50000"
                  value={filters.kilometrage_max || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "kilometrage_max",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Carburant</Label>
                <Select
                  value={filters.carburant || ""}
                  onValueChange={(v) =>
                    handleFilterChange("carburant", v === "all" ? undefined : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="Essence">Essence</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Hybride">Hybride</SelectItem>
                    <SelectItem value="Électrique">Électrique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Transmission</Label>
                <Select
                  value={filters.transmission || ""}
                  onValueChange={(v) =>
                    handleFilterChange(
                      "transmission",
                      v === "all" ? undefined : v
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="Manuelle">Manuelle</SelectItem>
                    <SelectItem value="Automatique">Automatique</SelectItem>
                    <SelectItem value="Automatique DSG">
                      Automatique DSG
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des véhicules */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Chargement...</p>
              </CardContent>
            </Card>
          ) : vehicles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Aucun véhicule ne correspond à vos critères.
                </p>
                <Button onClick={resetFilters} variant="outline" className="mt-4">
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
