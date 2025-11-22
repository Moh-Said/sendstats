import React, { useState, useEffect } from 'react';
import { useBalances, formatBalanceBuckets, getTimeUntilNextUpdate } from '../hooks/useBalances';
import { BalanceStackedAreaChart } from './BalanceStackedAreaChart';
import { TransactionDistributionChart } from './TransactionDistributionChart';

// Import all SVG icons
import TouristIcon from '../assets/tourist.svg';
import CasualIcon from '../assets/casual.svg';
import ExplorerIcon from '../assets/explorer.svg';
import MemberIcon from '../assets/member.svg';
import TraderIcon from '../assets/trader.svg';
import PreRichIcon from '../assets/pre-rich.svg';
import RichIcon from '../assets/rich.svg';
import KingIcon from '../assets/king.svg';
import WhaleIcon from '../assets/whale.svg';

// SVG Icon mapping
const ICON_MAPPING: Record<string, string> = {
  'Tourist': TouristIcon,
  'Casual': CasualIcon,
  'Explorer': ExplorerIcon,
  'Member': MemberIcon,
  'Trader': TraderIcon,
  'Pre-Rich': PreRichIcon,
  'Rich': RichIcon,
  'King': KingIcon,
  'Little Whale': WhaleIcon,
  'Big Whale': WhaleIcon,
  'Large Whale': WhaleIcon
};

export const StatsTab: React.FC = () => {
  const { data, isLoading, error } = useBalances();
  const [timeUntilUpdate, setTimeUntilUpdate] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Update countdown every second
  useEffect(() => {
    if (!data?.cache_info?.last_updated) return;

    const updateCountdown = () => {
      const timeUntil = getTimeUntilNextUpdate(data.cache_info.last_updated);
      setTimeUntilUpdate(timeUntil);
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [data?.cache_info?.last_updated]);

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="border-green-400 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-red-400">Failed to load statistics</div>
        <div className="text-gray-400 text-sm">Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
      </div>
    );
  }

  // Ensure we have valid data
  if (!data?.data) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-yellow-400">No balance data available</div>
      </div>
    );
  }

  const balanceData = data.data;
  const query_timestamp = balanceData.query_timestamp;
  const buckets = formatBalanceBuckets(balanceData);
  // const totalHolders = Object.values(balanceData).filter(val => typeof val === 'number').reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="mb-2 font-bold text-gray-100 text-xl">Token Distribution Analytics</h2>
        
        {/* <div className="inline-flex items-center bg-green-900/50 mt-4 px-4 py-2 rounded-lg"> */}
          {/* <Users className="mr-2 w-5 h-5 text-green-400" /> */}
          {/* <span className="font-semibold text-green-400">{totalHolders.toLocaleString()} Total Holders</span> */}
        {/* </div> */}
      </div>

      {/* Balance Buckets Grid - Compact Layout */}
      <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {buckets.map((bucket) => {
          const count = bucket.count;
          
          return (
            <div
              key={bucket.key}
              className="bg-gray-800 hover:bg-gray-750 p-3 rounded-lg transition-colors"
            >
              <div className="flex justify-center mb-2">
                <img
                  src={ICON_MAPPING[bucket.label]}
                  alt={bucket.label}
                  className="w-6 h-6"

                  style={{ filter: 'brightness(0) saturate(80%) invert(45%) sepia(95%) saturate(1000%) hue-rotate(90deg)' }}
                />
              </div>
              
              <div className="mb-2 text-center">
                <h4 className="font-semibold text-gray-200 text-sm">{bucket.label}</h4>
                <p className="text-gray-500 text-xs">{bucket.displayKey}</p>
              </div>
              
              <div className="text-center">
                <div className="font-bold text-white text-xl">{count}</div>
                {/* <div className="text-gray-400 text-xs">holders</div> */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Stacked Area Chart */}
      <BalanceStackedAreaChart days={15} className="mt-8" />

            {/* Update Status */}
      <div className="text-center">
        <div className="inline-flex items-center bg-gray-800 px-3 py-1 rounded-lg text-gray-400 text-sm">
          <div className="bg-green-500 mr-2 rounded-full w-2 h-2"></div>
          <span>
            Next update in {timeUntilUpdate.hours}h {timeUntilUpdate.minutes}m {timeUntilUpdate.seconds}s
          </span>
        </div>
        {query_timestamp && (
          <div className="mt-2 text-gray-500 text-xs">
            Last updated: {new Date(query_timestamp).toLocaleString()}
          </div>
        )}
      </div>

      {/* Transaction Distribution Chart */}
      <TransactionDistributionChart className="mt-8" />


    </div>
  );
};