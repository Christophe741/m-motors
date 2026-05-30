"use client";

import { useState, useEffect, useCallback } from 'react';
import { Option } from '@/lib/types';

interface UseOptionsReturn {
  options: Option[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOptions(): UseOptionsReturn {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/options');

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des options');
      }

      const result = await response.json();
      setOptions(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions,
  };
}
