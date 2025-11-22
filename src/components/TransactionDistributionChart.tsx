import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useBinnedSum } from '../hooks/useBinnedSum';

interface TransactionDistributionChartProps {
  className?: string;
  binCount?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface ChartDataPoint {
  cluster_number: number;
  cluster_min_amount: string;
  cluster_max_amount: string;
  cluster_range_label: string;
  transaction_count: number;
  total_amount: string;
  avg_amount: string;
  min_amount: string;
  max_amount: string;
  count: number;
  label: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    const totalAmount = parseFloat(data.total_amount);
    
    return (
      <div className="bg-gray-800 shadow-lg p-4 border border-gray-700 rounded-lg max-w-sm">
        <div className="mb-2">
          <h4 className="font-semibold text-green-400 text-sm">Range: {data.cluster_range_label}</h4>
        </div>
        <div className="space-y-1 text-xs">
          <div className="text-gray-300">
            <span className="text-gray-400">Transactions:</span> {data.transaction_count.toLocaleString()}
          </div>
          <div className="text-gray-300">
            <span className="text-gray-400">Total Volume:</span> {Intl.NumberFormat('fr-Fr').format(Number(totalAmount.toFixed((0))))} SEND
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const TransactionDistributionChart: React.FC<TransactionDistributionChartProps> = ({
  className = ''
}) => {
  const { data, loading, error } = useBinnedSum({});

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <div className="border-green-400 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mb-2 text-red-400">Failed to load transaction histogram</div>
        <div className="text-gray-400 text-sm">Error: {error}</div>
      </div>
    );
  }

  if (!data?.bins || data.bins.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mb-2 text-yellow-400">No transaction histogram data available</div>
        <div className="text-gray-400 text-sm">Try checking back later</div>
      </div>
    );
  }

  // Prepare data for histogram - use cluster label as X and transaction count as Y
  const chartData: ChartDataPoint[] = data.bins.map(bin => {
    const transactionCount = bin.transaction_count;
    
    return {
      ...bin,
      count: transactionCount, // Y-axis: transaction count
      label: bin.cluster_range_label // X-axis: cluster range label
    };
  }).filter(item => item.count > 0);

  if (chartData.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mb-2 text-yellow-400">No valid data points for visualization</div>
      </div>
    );
  }

  // Calculate total volume
  const totalVolume = data.bins.reduce((sum, bin) => sum + parseFloat(bin.total_amount), 0);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-gray-100 text-lg">
          Transaction Amount Histogram
        </h3>
        <p className="text-gray-400 text-sm">
          Transaction frequency across different amount ranges
        </p>
        <div className="mt-2 text-gray-500 text-xs">
          X-axis: Amount ranges • Y-axis: Number of transactions • 30 days (if available)
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -10,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="label"
              stroke="#9CA3AF"
              fontSize={10}
              tick={{ fill: '#9CA3AF' }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
              domain={[1, 'dataMax']}
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                if (value >= 100) return `${value}`;
                return value.toString();
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="count" 
              fill="#3B82F6"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="gap-4 grid grid-cols-2">
        <div className="bg-gray-800 p-3 rounded-lg text-center">
          <div className="font-bold text-green-400 text-2xl">
            {data.bins.reduce((sum, bin) => sum + bin.transaction_count, 0).toLocaleString()}
          </div>
          <div className="text-gray-400 text-xs">Total Transactions</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg text-center">
          <div className="font-bold text-blue-400 text-2xl">
            {Intl.NumberFormat('fr-Fr').format(Number(totalVolume.toFixed(0)))}
          </div>
          <div className="text-gray-400 text-xs">Total Volume (SEND)</div>
        </div>
      </div>
    </div>
  );
};
