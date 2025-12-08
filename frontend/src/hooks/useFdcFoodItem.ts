import { useEffect, useState } from 'react';
import { Api } from '../api/Api';
import type { FdcFoodItemDetail } from '../api/types';

export function useFdcFoodItem(id: number | null) {
  const [data, setData] = useState<FdcFoodItemDetail | null>(null);
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
      const response = await Api.getFdcFoodItem(id);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch food item'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, loading, error, refetch: fetchData };
}
