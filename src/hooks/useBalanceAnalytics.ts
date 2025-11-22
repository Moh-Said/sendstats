import { useQuery } from '@tanstack/react-query';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface BucketAnalytics {
  id: number;
  recorded_at: string;
  bucket_1000_1500: number;
  bucket_1500_3999: number;
  bucket_4000_4999: number;
  bucket_5000_5999: number;
  bucket_6000_7000: number;
  bucket_7001_10000: number;
  bucket_10001_20000: number;
  bucket_over_20000: number;
  total_accounts: number;
  query_source: string;
}

export interface BalanceAnalyticsResponse {
  period_days: number;
  total_records: number;
  data: BucketAnalytics[];
}

export const useBalanceAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: ['balance-analytics', days],
    queryFn: async (): Promise<BalanceAnalyticsResponse> => {
      const response = await fetch(`${BASE_URL}/analytics/balance-buckets?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch balance analytics');
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 60 * 2, // Refetch every 2 hours
  });
};

// Utility function to process data for charting
export interface ChartDataPoint {
  timestamp: string;
  date: string;
  time: string;
  '1000-1500': number;
  '1500-3999': number;
  '4000-4999': number;
  '5000-5999': number;
  '6000-7000': number;
  '7001-10000': number;
  '10001-20000': number;
  '20000+': number;
  Total: number;
}


export const processAnalyticsDataForChart = (data: BucketAnalytics[]): ChartDataPoint[] => {
  return data
    .filter(record => record.total_accounts > 0) // Filter out empty records
    .map(record => {
      const date = new Date(record.recorded_at);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        timestamp: record.recorded_at,
        date: formattedDate,
        time: formattedTime,
        '1000-1500': record.bucket_1000_1500,
        '1500-3999': record.bucket_1500_3999,
        '4000-4999': record.bucket_4000_4999,
        '5000-5999': record.bucket_5000_5999,
        '6000-7000': record.bucket_6000_7000,
        '7001-10000': record.bucket_7001_10000,
        '10001-20000': record.bucket_10001_20000,
        '20000+': record.bucket_over_20000,
        Total: record.total_accounts,
      };
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};