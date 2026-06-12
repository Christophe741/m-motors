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
import { VehicleFilters, VehiculeListItem } from "@/lib/types";
import { VEHICLES_PAGE_SIZE } from "@/lib/constants";
import { buildVehicleQueryParams } from "@/hooks/useVehicles";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface VehicleSearchClientProps {
  initialVehicles: VehiculeListItem[];
  initialTotal: number;
  marques: string[];
}

export default function VehicleSearchClient({
  initialVehicles,
  initialTotal,
  marques,
}: VehicleSearchClientProps) {
  const [vehicles, setVehicles] = useState<VehiculeListItem[]>(initialVehicles);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Annule la requête précédente pour qu'une réponse lente arrivée en
  // retard n'écrase pas les résultats du dernier filtre choisi
  const abortRef = useRef<AbortController | null>(null);

  const fetchVehicles = useCallback(
    async (filterParams: VehicleFilters, pageToLoad: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Le catalogue public n'affiche que les véhicules disponibles
      const params = buildVehicleQueryParams(
        { ...filterParams, statut: "disponible" },
        pageToLoad,
        VEHICLES_PAGE_SIZE
      );

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      try {
        const response = await fetch(`/api/vehicles?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (data.success) {
          setVehicles((prev) => (append ? [...prev, ...data.data] : data.data));
          setTotal(data.pagination?.total ?? data.data.length);
          setPage(pageToLoad);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Error fetching vehicles:", error);
      } finally {
        if (abortRef.current === controller) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    []
  );

  const handleFilterChange = useCallback(
    (key: keyof VehicleFilters, value: string | number | undefined) => {
      const newFilters = { ...filters, [key]: value || undefined };
      setFilters(newFilters);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      if (key === "search") {
        debounceTimerRef.current = setTimeout(() => {
          fetchVehicles(newFilters, 1, false);
        }, 500);
      } else {
        fetchVehicles(newFilters, 1, false);
      }
    },
    [filters, fetchVehicles]
  );

  const loadMore = useCallback(() => {
    fetchVehicles(filters, page + 1, true);
  }, [fetchVehicles, filters, page]);

  const resetFilters = useCallback(() => {
    setFilters({});
    fetchVehicles({}, 1, false);
  }, [fetchVehicles]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rechercher un véhicule</h1>
        <p className="text-muted-foreground">
          Trouvez votre véhicule parmi notre sélection de {total} véhicule
          {total > 1 ? "s" : ""} disponible{total > 1 ? "s" : ""}
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
                <Label>Prix</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.prix_min || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "prix_min",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.prix_max || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "prix_max",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Année</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.annee_min || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "annee_min",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.annee_max || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "annee_max",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>
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
            <>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              {vehicles.length < total && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore
                      ? "Chargement..."
                      : `Voir plus (${vehicles.length} sur ${total})`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
