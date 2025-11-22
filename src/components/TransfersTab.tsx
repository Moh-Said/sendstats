import React from 'react';
import type { Transfer, AccountCreation, LiveEvent } from '../types';
import { truncateHashOrAddress } from '../utils';
import { ExternalLink } from 'lucide-react';
import { ActivityHeatmap } from './ActivityHeatmap';
import { RetroSignalAnimation } from './RetroSignalAnimation';

interface TransfersTabProps {
  events: LiveEvent[];
  newEventIds: Set<number>;
  isAnimating: boolean;
}

export const TransfersTab: React.FC<TransfersTabProps> = ({ events, newEventIds, isAnimating }) => {
  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className='flex lg:flex-row flex-col gap-2'>
      
      
      <div className="flex-1 space-y-4 order-1 lg:order-0 bg-gray-800 mb-6 p-2 lg:p-6 rounded-lg max-h-200 overflow-y-auto">
        <div className="flex lg:flex-row flex-col justify-between items-center mb-6">
          <h2 className="lg:order-0 font-bold text-gray-100 text-lg">Recent Activity</h2>
          <div className="order-0 lg:order-1 mt-1.5 lg:mt-0">
            <RetroSignalAnimation isAnimating={isAnimating} />
          </div>
        </div>
        
        {events.length === 0 ? (
          <div className="py-8 text-gray-400 text-center">No activity found</div>
        ) : (
          <div className="space-y-3">
            {/* Render All Events in Chronological Order */}
            {sortedEvents.map((event) => {
              if (event.event_type === 'transfer') {
                const transfer = event as Transfer & { event_type: 'transfer' };
                return (
                  <div
                    key={`transfer-${transfer.id}`}
                    className={`bg-gray-800 hover:bg-gray-900 rounded-lg lg:p-4 p-2 border transition-all duration-300 ${
                      newEventIds.has(transfer.id)
                        ? 'border-green-500 shadow-lg shadow-green-500/20 animate-pulse'
                        : 'border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-400 text-sm">Tx:</span>
                          <a
                            href={`https://basescan.org/tx/${transfer.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-blue-400 hover:text-blue-300 text-sm"
                          >
                            {truncateHashOrAddress(transfer.transaction_hash)}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        <div className="mb-1 text-gray-300 text-xs">
                          {transfer.timestamp.toLocaleString()}
                        </div>
                        <div className="font-semibold text-green-400 text-lg">
                          {parseFloat(transfer.amount).toFixed(0)} SEND
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <div className="mb-1 text-gray-400">From:</div>
                        <div className="font-mono text-gray-300">{truncateHashOrAddress(transfer.from_address)}</div>
                        <div className="mt-2 mb-1 text-gray-400">To:</div>
                        <div className="font-mono text-gray-300">{transfer.from_address === transfer.to_address ? "self" : truncateHashOrAddress(transfer.to_address)}</div>
                      </div>
                    </div>
                  </div>
                );
              } else if (event.event_type === 'account_creation') {
                const accountCreation = event as AccountCreation & { event_type: 'account_creation' };
                return (
                  <div
                    key={`creation-${accountCreation.id}`}
                    className={`bg-gray-800 hover:bg-gray-900 rounded-lg lg:p-4 p-2 border transition-all duration-300 ${
                      newEventIds.has(accountCreation.id)
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20 animate-pulse'
                        : 'border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-blue-400 text-sm">New account created</span>
                          <a
                            href={`https://basescan.org/tx/${accountCreation.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-blue-400 hover:text-blue-300 text-sm"
                          >
                            {truncateHashOrAddress(accountCreation.transaction_hash)}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        <div className="mb-1 text-gray-300 text-xs">
                          {accountCreation.timestamp.toLocaleString()}
                        </div>
                        <div className="font-semibold text-blue-400 text-lg">
                          Account Created
                        </div>
                      </div>
                      {/* <div className="text-sm text-right">
                        <div className="mb-1 text-gray-400">Created:</div>
                        <div className="font-mono text-gray-300">{truncateHashOrAddress(accountCreation.created_address)}</div>
                        <div className="mt-2 mb-1 text-gray-400">Contract:</div>
                        <div className="font-mono text-gray-300">{truncateHashOrAddress(accountCreation.contract_address)}</div>
                      </div> */}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        
      </div>
      <ActivityHeatmap  />
    </div>
  );
};