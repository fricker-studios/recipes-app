import { useCallback, useEffect, useState } from 'react';
import { Api } from '../api/Api';
import type { Ingredient, PaginatedResponse } from '../api/types';

export interface IngredientsParams {
  search?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

export function useIngredients(initialParams?: IngredientsParams) {
  const [data, setData] = useState<PaginatedResponse<Ingredient> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<IngredientsParams>(initialParams || {});

  const fetchData = useCallback(async (fetchParams: IngredientsParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await Api.getIngredients(fetchParams);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch ingredients'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(params);
  }, [params, fetchData]);

  const updateParams = useCallback((newParams: Partial<IngredientsParams>) => {
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
