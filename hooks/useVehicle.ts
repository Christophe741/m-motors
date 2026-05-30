"use client";

import { useState, useEffect, useCallback } from 'react';
import { Vehicule } from '@/lib/types';

interface UseVehicleReturn {
  vehicle: Vehicule | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVehicle(vehicleId: string | null): UseVehicleReturn {
  const [vehicle, setVehicle] = useState<Vehicule | null>(null);
  const [loading, setLoading] = useState(!!vehicleId);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du véhicule');
      }

      const result = await response.json();
      setVehicle(result.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  return {
    vehicle,
    loading,
    error,
    refetch: fetchVehicle,
  };
}
