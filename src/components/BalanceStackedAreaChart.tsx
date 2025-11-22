import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useBalanceAnalytics, processAnalyticsDataForChart } from '../hooks/useBalanceAnalytics';

interface BalanceStackedAreaChartProps {
  days?: number;
  className?: string;
}

// Create balance range to color mapping
const BALANCE_RANGE_COLORS = {
  '1000-1500': '#3B82F6', // Blue
  '1500-3999': '#10B981', // Green
  '4000-4999': '#F59E0B', // Yellow
  '5000-5999': '#F97316', // Orange
  '6000-7000': '#8B5CF6', // Purple
  '7001-10000': '#EC4899', // Pink
  '10001-20000': '#6366F1', // Indigo
  '20000+': '#EF4444', // Red
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = payload[0]?.payload?.date || label;
    const time = payload[0]?.payload?.time || '';
    
    return (
      <div className="bg-gray-800 shadow-lg p-3 border border-gray-700 rounded-lg">
        <p className="mb-2 text-gray-300 text-sm">
          {date} {time ? `at ${time}` : ''}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
        <div className="mt-2 pt-2 border-gray-600 border-t">
          <p className="font-semibold text-gray-300 text-sm">
            {`Total: ${payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toLocaleString()}`}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend component that shows only balance ranges
const CustomLegend = ({ payload }: any) => {
  if (!payload || payload.length === 0) return null;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="rounded-full w-3 h-3"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300 text-sm">
            {entry.dataKey}
          </span>
        </div>
      ))}
    </div>
  );
};

export const BalanceStackedAreaChart: React.FC<BalanceStackedAreaChartProps> = ({ 
  days = 30, 
  className = '' 
}) => {
  const { data, isLoading, error } = useBalanceAnalytics(days);

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <div className="border-green-400 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mb-2 text-red-400">Failed to load analytics</div>
        <div className="text-gray-400 text-sm">Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mb-2 text-yellow-400">No analytics data available</div>
        <div className="text-gray-400 text-sm">Try adjusting the date range</div>
      </div>
    );
  }

  const chartData = processAnalyticsDataForChart(data.data).filter(record => record.Total > 0);

  if (chartData.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mb-2 text-yellow-400">No valid data points found</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-gray-100 text-lg">
          Balance Bucket Distribution Over Time
        </h3>
        <p className="text-gray-400 text-sm">
          Stacked area showing composition and evolution over {days} days
        </p>
        <div className="mt-2 text-gray-500 text-xs">
          {data.total_records} data points • Updated every 12 hours
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chartData}
            // some custom margin for mobile viewing (eliminated unecessary wide margins)
            margin={{
              top: 10,
              right: 10,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Individual bucket areas using balance ranges */}
            {Object.entries(BALANCE_RANGE_COLORS).map(([bucket, color]) => (
              <Area
                key={bucket}
                type="monotone"
                dataKey={bucket}
                stackId="1"
                stroke={color}
                fill={color}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Custom legend with balance ranges and numbers */}
        <CustomLegend payload={Object.keys(BALANCE_RANGE_COLORS).map(key => ({
          dataKey: key,
          color: BALANCE_RANGE_COLORS[key as keyof typeof BALANCE_RANGE_COLORS]
        }))} />
      </div>
    </div>
  );
};