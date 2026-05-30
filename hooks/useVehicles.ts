"use client";

import { useState, useEffect, useCallback } from "react";
import { Vehicule, VehicleFilters } from "@/lib/types";

interface UseVehiclesReturn {
  vehicles: Vehicule[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVehicles(filters?: VehicleFilters): UseVehiclesReturn {
  const [vehicles, setVehicles] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (filters?.search) queryParams.append("search", filters.search);
      if (filters?.type_offre)
        queryParams.append("type_offre", filters.type_offre);
      if (filters?.marque) queryParams.append("marque", filters.marque);
      if (filters?.prix_max)
        queryParams.append("prix_max", filters.prix_max.toString());
      if (filters?.annee_min)
        queryParams.append("annee_min", filters.annee_min.toString());
      if (filters?.kilometrage_max)
        queryParams.append(
          "kilometrage_max",
          filters.kilometrage_max.toString(),
        );
      if (filters?.carburant)
        queryParams.append("carburant", filters.carburant);
      if (filters?.transmission)
        queryParams.append("transmission", filters.transmission);
      if (filters?.statut) queryParams.append("statut", filters.statut);

      const url = `/api/vehicles${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des véhicules");
      }

      const result = await response.json();
      setVehicles(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles,
  };
}
