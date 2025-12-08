import { useEffect, useState } from 'react';
import { Api } from '../api/Api';
import type { RecipeCollection } from '../api/types';

export function useRecipeLists() {
  const [data, setData] = useState<RecipeCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.getRecipeLists();
      setData(response.results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recipe lists'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
