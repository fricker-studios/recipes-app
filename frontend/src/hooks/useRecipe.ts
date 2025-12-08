import { useEffect, useState } from 'react';
import { Api } from '../api/Api';
import type { RecipeDetail } from '../api/types';

export function useRecipe(id: number | null) {
  const [data, setData] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (id === null) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await Api.getRecipe(id);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recipe'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, loading, error, refetch: fetchData };
}
