import { useEffect, useState } from 'react';
import { Api } from '../api/Api';
import type { RecipeListItem, RecipesParams } from '../api/types';

export function useRecipes(params?: RecipesParams) {
  const [data, setData] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.getRecipes(params);
      setData(response.results);
      setCount(response.count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recipes'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return { data, loading, error, count, refetch: fetchData };
}
