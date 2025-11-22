import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TokenInfo } from '../types';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useTokenInfo = () => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Use React Query for data fetching and caching
  const { data: tokenInfo, isLoading, error, refetch } = useQuery({
    queryKey: ['token-info'],
    queryFn: async (): Promise<TokenInfo> => {
      const response = await fetch(`${BASE_URL}/price`);
      if (!response.ok) throw new Error('Failed to fetch token info');
      const data = await response.json();
      setLastUpdate(new Date());
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });

  const refreshTokenInfo = () => {
    refetch();
  };

  return {
    tokenInfo,
    isLoading,
    error,
    lastUpdate,
    refreshTokenInfo
  };
};