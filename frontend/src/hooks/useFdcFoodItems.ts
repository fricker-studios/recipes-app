import { useCallback, useEffect, useState } from 'react';
import { Api } from '../api/Api';
import type { FdcFoodItem, FdcFoodItemsParams, PaginatedResponse } from '../api/types';

export function useFdcFoodItems(initialParams?: FdcFoodItemsParams) {
  const [data, setData] = useState<PaginatedResponse<FdcFoodItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<FdcFoodItemsParams>(initialParams || {});

  const fetchData = useCallback(async (fetchParams: FdcFoodItemsParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.getFdcFoodItems(fetchParams);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch food items'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(params);
  }, [params, fetchData]);

  const updateParams = useCallback((newParams: Partial<FdcFoodItemsParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const nextPage = useCallback(() => {
    if (data?.next) {
      const offset = params.offset || 0;
      const limit = params.limit || 25;
      updateParams({ offset: offset + limit });
    }
  }, [data?.next, params.offset, params.limit, updateParams]);

  const previousPage = useCallback(() => {
    if (data?.previous) {
      const offset = params.offset || 0;
      const limit = params.limit || 25;
      updateParams({ offset: Math.max(0, offset - limit) });
    }
  }, [data?.previous, params.offset, params.limit, updateParams]);

  const goToPage = useCallback(
    (page: number) => {
      const limit = params.limit || 25;
      updateParams({ offset: page * limit });
    },
    [params.limit, updateParams]
  );

  return {
    data: data?.results || [],
    count: data?.count || 0,
    loading,
    error,
    hasNext: !!data?.next,
    hasPrevious: !!data?.previous,
    nextPage,
    previousPage,
    goToPage,
    updateParams,
    params,
  };
}
