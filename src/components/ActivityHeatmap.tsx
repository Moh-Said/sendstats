import React, { useEffect, useState } from 'react';
import { useActivityHeatmap, type HeatmapCell } from '../hooks/useActivityHeatmap';


const getLevelColor = (level: number): string => {
  switch (level) {
    case 1: return 'bg-green-300'; // light green
    case 2: return 'bg-green-500'; // normal green
    case 3: return 'bg-green-700'; // dark green
    case 4: return 'bg-green-900'; // darkest green
    default: return 'bg-[#a8a5a599]'; // no activity
  }
};

const formatHour = (hour: number): string => {
  return hour.toString().padStart(2, '0') + ':00';
};

export const ActivityHeatmap: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data, isLoading, error } = useActivityHeatmap(selectedDate);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);



  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  // Calculate date range (7 days back from today)
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 7);

  const canGoBack = selectedDate > minDate;
  const canGoForward = selectedDate < today && !isToday;

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev' && canGoBack) {
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
    } else if (direction === 'next' && canGoForward) {
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
    }
    setSelectedHour(null); // Reset selected hour when changing date
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const heatmap = data?.heatmap || [];
  const heatmapTransfers = data?.transfers || [];

  useEffect(() => {
    if (!selectedHour) return;

    const timeoutId = setTimeout(() => setSelectedHour(null), 20000);
    return () => clearTimeout(timeoutId);
  }, [selectedHour]);

  if (isLoading) {
    return (
      <div className="bg-gray-800 mb-6 p-2 lg:p-6 rounded-lg">
        <h3 className="mb-4 font-semibold text-gray-100 text-lg">24-Hour Activity</h3>
        <div className="animate-pulse">
          <div className="gap-1 grid grid-cols-8 grid-rows-3 w-fit">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="bg-gray-600 rounded-sm w-6 h-6"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 mb-6 p-6 rounded-lg">
        <h3 className="mb-4 font-semibold text-gray-100 text-lg">24-Hour Activity</h3>
        <div className="text-gray-400">Failed to load activity data</div>
      </div>
    );
  }

  if (!heatmap) return null;


  return (
    <div className="flex flex-col items-center bg-gray-800 mb-2 p-2 lg:p-6 rounded-lg h-fit">
      {/* Date Navigation */}
      <div className="flex justify-between items-center gap-2 mb-4 w-full">
        <button
          onClick={() => navigateDate('prev')}
          disabled={!canGoBack}
          className={`px-1 py-1 rounded text-xs  font-mono transition-colors ${
            canGoBack
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          ‹‹
        </button>

        <h3 className="font-semibold text-gray-100 text-xs">
          {formatDate(selectedDate)}
        </h3>

        <button
          onClick={() => navigateDate('next')}
          disabled={!canGoForward}
          className={`px-1 py-1 rounded text-xs font-mono transition-colors ${
            canGoForward
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          ››
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        {/* Heatmap grid - 3 rows × 8 columns */}
        <div className="gap-1 grid grid-cols-8 grid-rows-3 w-fit">
          {heatmap.map((cell: HeatmapCell) => (
            <div
              key={cell.hour}
              onClick={() => {
                setSelectedHour(cell.hour);
              }}
              className={`w-6 h-6 rounded-sm transition-colors duration-200 hover:ring-2 hover:ring-gray-400 hover:ring-opacity-50 cursor-pointer ${
                selectedHour === cell.hour ? 'ring-2 ring-green-400 ring-opacity-100' : ''
              } ${getLevelColor(cell.level)}`}
              title={`${cell.count} transaction${cell.count !== 1 ? 's' : ''} at ${formatHour(cell.hour)}`}
            />
          ))}
        </div>
      </div>

      {/* Hour Details */}
      {selectedHour !== null && heatmap && (
        <div className="bg-gray-800 mt-6 p-3 border border-gray-700 rounded-md w-full text-center">
          {(() => {
            // Calculate local date boundaries for the selected date
            const targetDateLocal = new Date(selectedDate);
            targetDateLocal.setHours(0, 0, 0, 0);
            const nextDayLocal = new Date(targetDateLocal);
            nextDayLocal.setDate(targetDateLocal.getDate() + 1);

            // Filter transfers for the selected hour from the 24h data (using local time)
            const hourTransfers = heatmapTransfers.filter((transfer: any) => {
              const utcTransferDate = new Date(transfer.timestamp);
              const localTransferDate = new Date(utcTransferDate);
              const hour = localTransferDate.getHours();
              // Check if this transfer falls within the selected local date
              return hour === selectedHour && localTransferDate >= targetDateLocal && localTransferDate < nextDayLocal;
            });

            // Calculate total volume
            const totalVolume = hourTransfers.reduce((sum, transfer) => {
              return sum + transfer.amount;
            }, 0);

            return (
              <div className="text-xs">
                <div className="mb-2 text-gray-300 text-center underline">
                  From {formatHour(selectedHour)} to {formatHour((selectedHour + 1) % 24)}
                </div>
                <div>
                   <span className='font-semibold text-yellow-400'>{hourTransfers.length}</span> transactions
                </div>
                <div className="">
                  <span className='font-semibold text-green-400'>{totalVolume.toFixed(0)} SEND</span> was exchanged
                </div>
                <div>
                  <span className='mt-3 text-[0.5rem]'>Thresholds: 10 {"<"} 70 {"<"} 135 {"<"} 200</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};