import { useQuery } from '@tanstack/react-query';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface BalanceBucket {
  key: string;
  displayKey: string;
  label: string;
  count: number;
}

export interface BalanceBucketsData {
  [bucketName: string]: number;
}

export interface BalanceDataWithTimestamp {
  [key: string]: number | string;
  query_timestamp: string;
}

export interface BalanceDataResponse {
  data: BalanceDataWithTimestamp;
  cache_info: {
    last_updated: string;
  };
}

export const useBalances = () => {
  return useQuery({
    queryKey: ['balances'],
    queryFn: async (): Promise<BalanceDataResponse> => {
      const response = await fetch(`${BASE_URL}/accounts_balances`);
      if (!response.ok) throw new Error('Failed to fetch balances data');
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 30, // 30 minutes
  });
};

// Map technical bucket names to nice labels with SEND token indicator
export const BUCKET_MAPPING: Record<string, { label: string }> = {
  '1000-1500': { label: 'Tourist' },
  '1500-3999': { label: 'Casual' },
  '4000-4999': { label: 'Explorer' },
  '5000-5999': { label: 'Member' },
  '6000-7000': { label: 'Trader' },
  '7001-10000': { label: 'Pre-Rich' },
  '10001-20000': { label: 'Rich' },
  '20000+': { label: 'King' },
  '100000-250000': { label: 'Little Whale' },
  '250000-500000': { label: 'Big Whale' },
  '500000+': { label: 'Large Whale' },
};

export const formatBalanceBuckets = (data: BalanceDataWithTimestamp): BalanceBucket[] => {
  return Object.entries(data)
    .filter(([key, value]) => key !== 'query_timestamp' && typeof value === 'number')
    .map(([key, count]) => {
      const mapping = BUCKET_MAPPING[key] || { label: key };
      let displayKey = key;
      if (key === '100000-250000') displayKey = '100K+';
      else if (key === '250000-500000') displayKey = '250K+';
      else if (key === '500000+') displayKey = '500K+';
      return {
        key,
        displayKey,
        label: mapping.label,
        count: count as number,
      };
    })
    .sort((a, b) => {
      // Sort by the numeric value in the key
      const getMinValue = (bucketKey: string) => {
        if (bucketKey.includes('20000+')) {
          return 20001;
        }
        if (bucketKey.includes('500000+')) {
          return 500001;
        }
        const match = bucketKey.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      };
      return getMinValue(a.key) - getMinValue(b.key);
    });
};

// Helper function to calculate time until next update
export const getTimeUntilNextUpdate = (lastUpdated: string): { hours: number; minutes: number; seconds: number; total: number } => {
  const lastUpdate = new Date(lastUpdated).getTime();
  const now = new Date().getTime();
  const twelveHoursInMs = 12 * 60 * 60 * 1000; // 12 hours
  
  const nextUpdate = lastUpdate + twelveHoursInMs;
  const timeUntil = nextUpdate - now;
  
  if (timeUntil <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  const hours = Math.floor(timeUntil / (1000 * 60 * 60));
  const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeUntil % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds, total: timeUntil };
};