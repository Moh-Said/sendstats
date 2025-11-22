import { useQuery } from '@tanstack/react-query';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface HeatmapCell {
  hour: number;
  count: number;
  level: number;
}

export interface SimplifiedTransfer {
  id: number;
  amount: number;
  timestamp: string;
}

export interface TransfersResponse {
  transfers: SimplifiedTransfer[];
  count: number;
}

export const useActivityHeatmap = (selectedDate?: Date) => {
  // Use selected date or default to today
  const targetDate = selectedDate || new Date();
  
  // Calculate local date boundaries
  const targetDateLocal = new Date(targetDate);
  targetDateLocal.setHours(0, 0, 0, 0); // Start of selected date in local time
  const nextDayLocal = new Date(targetDateLocal);
  nextDayLocal.setDate(targetDateLocal.getDate() + 1); // Start of next day in local time
  
  // Get the UTC equivalents of our local date boundaries
  const utcStartOfDay = new Date(targetDateLocal.getTime() - (targetDateLocal.getTimezoneOffset() * 60000));
  const startUnixTimestamp = Math.floor(utcStartOfDay.getTime() / 1000);

  return useQuery({
    queryKey: ['activity-heatmap', startUnixTimestamp],
    queryFn: async (): Promise<{ heatmap: HeatmapCell[], transfers: SimplifiedTransfer[] }> => {
      const response = await fetch(`${BASE_URL}/transfers?day=${startUnixTimestamp}`);
      if (!response.ok) throw new Error('Failed to fetch activity data');
      const data: TransfersResponse = await response.json();
      
      // Filter transfers to the correct local date
      const hourCounts: Record<number, number> = {};
      
      data.transfers
        .forEach((transfer: SimplifiedTransfer) => {
          const utcTransferDate = new Date(transfer.timestamp);
          
          // Convert UTC timestamp to local time
          const localTransferDate = new Date(utcTransferDate);
          const localHour = localTransferDate.getHours();
          
          // Check if this transfer falls within our selected local date
          if (localTransferDate >= targetDateLocal && localTransferDate < nextDayLocal) {
            hourCounts[localHour] = (hourCounts[localHour] || 0) + 1;
          }
        });

      // Create 24-hour array with activity levels using local hours
      const heatmap: HeatmapCell[] = [];
      for (let hour = 0; hour < 24; hour++) {
        const count = hourCounts[hour] || 0;
        let level = 0;
        if (count >= 200) level = 4; // darkest green
        else if (count >= 135) level = 3; // dark green
        else if (count >= 70) level = 2; // normal green
        else if (count >= 10) level = 1; // light green
        // level = 0 for no activity

        heatmap.push({ hour, count, level });
      }

      return { heatmap, transfers: data.transfers };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: selectedDate ? false : 1000 * 60 * 5, // Only auto-refresh for today
  });
};