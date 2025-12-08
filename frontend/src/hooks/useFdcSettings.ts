import { useEffect, useState } from 'react';
import { Api } from '../api/Api';
import type { FdcSettings } from '../api/types';

export function useFdcSettings() {
  const [data, setData] = useState<FdcSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.getFdcSettings();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
