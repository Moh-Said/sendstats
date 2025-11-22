import React, { useState, useEffect } from 'react';
import { AreaChart, Area } from 'recharts';
import { useTokenInfo } from '../hooks/useLiveTokenInfo';

export const TokenInfoCard: React.FC = () => {
  const { tokenInfo, isLoading, error } = useTokenInfo();
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const [priceChanged, setPriceChanged] = useState(false);
  const [lastPrice, setLastPrice] = useState<string>('');


  const chartData = tokenInfo?.historical_prices
    ? tokenInfo.historical_prices
        .sort((a, b) => b.offset_hours - a.offset_hours)
        .map(item => ({ time: item.offset_hours, price: item.price_usd }))
    : [];

  useEffect(() => {
    // Check if price has changed
    if (tokenInfo && lastPrice && tokenInfo.price !== lastPrice) {
      setPriceChanged(true);
      // Remove animation after it completes
      setTimeout(() => setPriceChanged(false), 2000);
      setLastPrice(tokenInfo.price);
    } else if (tokenInfo && !lastPrice) {
      setLastPrice(tokenInfo.price);
    }
  }, [tokenInfo, lastPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Reset to 2 minutes when it reaches 0
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 bg-gray-800 mb-6 p-4 rounded-lg">
        <div className="bg-gray-600 rounded-full w-12 h-12 animate-pulse"></div>
        <div className="flex-1">
          <div className="bg-gray-600 mb-2 rounded h-4 animate-pulse"></div>
          <div className="bg-gray-600 rounded w-24 h-3 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !tokenInfo) {
    return (
      <div className="bg-gray-800 mb-6 p-4 rounded-lg">
        <div className="text-gray-400 text-sm">Failed to load token information</div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center lg:order-1 bg-gray-900 lg:mb-6 p-4 rounded-lg lg:w-100">
      <div className="flex items-center gap-4">
        <img
          src={tokenInfo.logo}
          alt="SEND Token"
          className="rounded-full w-10 h-10"
          onError={(e) => {
            // Fallback if logo fails to load
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2ZjEiLz4KPHRleHQgeD0iMjAiIHk9IjI1IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U0VORDwvdGV4dD4KPHN2Zz4K';
          }}
        />
        <div>
          <div className={`font-semibold text-green-400 text-md transition-all duration-500 ${
            priceChanged ? 'scale-110 text-yellow-300 animate-pulse' : ''
          }`}>
            ${Number(tokenInfo.price).toFixed(5)}
          </div>
          <div className="text-gray-400 text-xs">
            SEND Token
          </div>
        </div>
      </div>

          {chartData.length > 0 && (
            <AreaChart width={100} height={50} data={chartData}>
              <Area type="natural" dataKey="price" stroke="#81F0AB" fill="#1A8F43"  />
            </AreaChart>
          )}

      <div className="text-right">
        <div className="mb-1 text-gray-400 text-xs">Next update in</div>
        <div className="font-mono text-green-400 text-sm">
          {formatCountdown(countdown)}
        </div>
      </div>
    </div>
  );
};