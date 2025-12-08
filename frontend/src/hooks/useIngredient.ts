import { useEffect, useState } from 'react';
import { Api } from '../api/Api';
import type { Ingredient } from '../api/types';

export function useIngredient(id: number | null) {
  const [data, setData] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await Api.getIngredient(id);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch ingredient'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, loading, error };
}
