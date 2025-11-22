import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface BinnedSumBin {
  cluster_number: number;
  cluster_min_amount: string;
  cluster_max_amount: string;
  cluster_range_label: string;
  transaction_count: number;
  total_amount: string;
  avg_amount: string;
  min_amount: string;
  max_amount: string;
}

export interface BinnedSumResponse {
  bins: BinnedSumBin[];
}

interface UseBinnedSumOptions {
  binCount?: number;
  enabled?: boolean;
}

export const useBinnedSum = (options: UseBinnedSumOptions = {}) => {
  const { binCount = 50, enabled = true } = options;
  
  const [data, setData] = useState<BinnedSumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/transactions/binned-sum`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (!responseData.clusters || !Array.isArray(responseData.clusters)) {
        throw new Error('Invalid response format: expected clusters array');
      }
      
      const result: BinnedSumBin[] = responseData.clusters;
      
      const formattedResult: BinnedSumResponse = {
        bins: result
      };
      
      setData(formattedResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching binned sum data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [binCount, enabled]);

  return {
    data,
    loading,
    error,
    refetch
  };
};