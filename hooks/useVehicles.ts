"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VehiculeListItem, VehicleFilters } from "@/lib/types";
import { VEHICLES_PAGE_SIZE } from "@/lib/constants";

interface UseVehiclesReturn {
  vehicles: VehiculeListItem[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function buildVehicleQueryParams(
  filters: VehicleFilters | undefined,
  page: number,
  limit: number,
): URLSearchParams {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.type_offre) queryParams.append("type_offre", filters.type_offre);
  if (filters?.marque) queryParams.append("marque", filters.marque);
  if (filters?.prix_min !== undefined)
    queryParams.append("prix_min", filters.prix_min.toString());
  if (filters?.prix_max !== undefined)
    queryParams.append("prix_max", filters.prix_max.toString());
  if (filters?.annee_min !== undefined)
    queryParams.append("annee_min", filters.annee_min.toString());
  if (filters?.annee_max !== undefined)
    queryParams.append("annee_max", filters.annee_max.toString());
  if (filters?.kilometrage_max !== undefined)
    queryParams.append("kilometrage_max", filters.kilometrage_max.toString());
  if (filters?.carburant) queryParams.append("carburant", filters.carburant);
  if (filters?.transmission)
    queryParams.append("transmission", filters.transmission);
  if (filters?.statut) queryParams.append("statut", filters.statut);

  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  return queryParams;
}

export function useVehicles(
  filters?: VehicleFilters,
  pageSize: number = VEHICLES_PAGE_SIZE,
): UseVehiclesReturn {
  const [vehicles, setVehicles] = useState<VehiculeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Annule la requête précédente quand les filtres changent : sans cela,
  // une réponse lente arrivée en retard écraserait des résultats plus récents
  const abortRef = useRef<AbortController | null>(null);

  const filtersKey = JSON.stringify(filters);

  const fetchPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const queryParams = buildVehicleQueryParams(
          filters,
          pageToLoad,
          pageSize,
        );
        const response = await fetch(`/api/vehicles?${queryParams}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des véhicules");
        }

        const result = await response.json();
        const data: VehiculeListItem[] = result.data || [];
        setVehicles((prev) => (append ? [...prev, ...data] : data));
        setTotal(result.pagination?.total ?? data.length);
        setPage(pageToLoad);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
        if (!append) setVehicles([]);
      } finally {
        if (abortRef.current === controller) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey, pageSize],
  );

  useEffect(() => {
    fetchPage(1, false);
    return () => abortRef.current?.abort();
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    fetchPage(page + 1, true);
  }, [fetchPage, page]);

  const refetch = useCallback(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  return {
    vehicles,
    total,
    loading,
    loadingMore,
    error,
    hasMore: vehicles.length < total,
    loadMore,
    refetch,
  };
}
