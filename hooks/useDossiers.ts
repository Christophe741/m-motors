"use client";

import { useState, useEffect, useCallback } from 'react';
import { Dossier } from '@/lib/types';

interface UseDossiersParams {
  clientId?: string;
  autoFetch?: boolean;
}

interface UseDossiersReturn {
  dossiers: Dossier[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDossiers({ clientId, autoFetch = true }: UseDossiersParams = {}): UseDossiersReturn {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchDossiers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = clientId
        ? `/api/dossiers?clientId=${clientId}`
        : '/api/dossiers';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des dossiers');
      }

      const result = await response.json();
      setDossiers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setDossiers([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (autoFetch) {
      fetchDossiers();
    }
  }, [autoFetch, fetchDossiers]);

  return {
    dossiers,
    loading,
    error,
    refetch: fetchDossiers,
  };
}
