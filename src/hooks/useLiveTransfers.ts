import { useState, useEffect, useRef } from 'react';
import type { Transfer, AccountCreation, LiveEvent, RecentTransfersResponse, TransferWebSocketResponse, AccountCreationWebSocketResponse } from '../types';
import { IGNORED_ADDRESSES } from '../config/ignoredAddresses';
import { getWebSocketService } from '../services/websocket';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useLiveTransfers = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [newEventIds, setNewEventIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const wsService = useRef(getWebSocketService());
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const connectAndSubscribe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch initial recent transfers via HTTP
        const response = await fetch(`${BASE_URL}/live/recent`);
        if (!response.ok) throw new Error('Failed to fetch recent transfers');
        const data: RecentTransfersResponse = await response.json();

        // Filter out ignored addresses, 0 SEND transfers, and format data
        const initialTransfers = data.transfers
          .filter(transfer => 
            !IGNORED_ADDRESSES.has(transfer.to_address.toLowerCase()) &&
            !IGNORED_ADDRESSES.has(transfer.from_address.toLowerCase()) &&
            transfer.amount > 0 // Only include transfers with amount > 0
          )
          .map(transfer => ({
            ...transfer,
            id: transfer.id,
            from_address: transfer.from_address,
            to_address: transfer.to_address,
            amount: transfer.amount.toString(), // Convert number to string
            block_number: transfer.block_number.toString(), // Convert number to string
            transaction_hash: transfer.transaction_hash,
            log_index: transfer.log_index,
            timestamp: new Date(transfer.timestamp+"Z"), // Convert string (+Z, UTC) to Date
            event_type: 'transfer' as const
          }));

        setEvents(initialTransfers);

        // Connect to WebSocket for real-time updates
        await wsService.current.connect();

        // Subscribe to new transfer updates
        const cleanup = wsService.current.on('new_transfer', (message: TransferWebSocketResponse) => {
          try {
            // Filter out ignored addresses and 0 SEND transfers
            if (IGNORED_ADDRESSES.has(message.data.to_address.toLowerCase()) ||
                IGNORED_ADDRESSES.has(message.data.from_address.toLowerCase()) ||
                parseFloat(message.data.amount.toString()) <= 0) {
              return;
            }

            // Trigger the retro signal animation
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 2000);

            // Add new transfer to the list
            setEvents(prevEvents => {
              // Use the id from the message if available, otherwise generate one
              const transferId = message.data.id || (parseInt(message.data.transaction_hash.slice(-8), 16) + message.data.log_index);
              
              // Check if transfer already exists
              const exists = prevEvents.some(t => t.id === transferId);
              if (exists) return prevEvents;

              const newTransfer: Transfer & { event_type: 'transfer' } = {
                id: transferId,
                from_address: message.data.from_address,
                to_address: message.data.to_address,
                amount: message.data.amount.toString(), // Convert number to string
                block_number: message.data.block_number.toString(), // Convert number to string
                transaction_hash: message.data.transaction_hash,
                log_index: message.data.log_index,
                timestamp: new Date(message.data.timestamp),
                event_type: 'transfer'
              };

              // Add to beginning and limit to reasonable number
              const updatedEvents = [newTransfer, ...prevEvents].slice(0, 1000);
              
              // Mark as new for animation
              setNewEventIds(prev => new Set([...prev, newTransfer.id]));
              
              // Clear animation after 2 seconds
              setTimeout(() => {
                setNewEventIds(prev => {
                  const updated = new Set(prev);
                  updated.delete(newTransfer.id);
                  return updated;
                });
              }, 2000);

              return updatedEvents;
            });

            setError(null);
          } catch (err) {
            // Error processing new transfer
            setError(new Error('Failed to process transfer update'));
          }
        });

        // Subscribe to new account creation updates
        const cleanupAccountCreations = wsService.current.on('new_account_creation', (message: AccountCreationWebSocketResponse) => {
          try {
            // Create a unique ID for the account creation event
            const eventId = parseInt(message.data.transaction_hash.slice(-8), 16) + message.data.log_index;
            
            // Check if account creation already exists
            setEvents(prevEvents => {
              const exists = prevEvents.some(e => e.id === eventId);
              
              if (exists) {
                return prevEvents;
              }

              // Trigger the retro signal animation
              setIsAnimating(true);
              setTimeout(() => setIsAnimating(false), 3000);

              const newAccountCreation: AccountCreation = {
                id: eventId,
                created_address: message.data.created_address,
                contract_address: message.data.contract_address,
                key_slot: message.data.key_slot,
                key_hash1: message.data.key_hash1,
                key_hash2: message.data.key_hash2,
                init_dest: message.data.init_dest,
                init_value: message.data.init_value,
                block_number: message.data.block_number,
                transaction_hash: message.data.transaction_hash,
                log_index: message.data.log_index,
                timestamp: new Date(message.data.timestamp),
                event_type: 'account_creation'
              };

              // Add to beginning and limit to reasonable number
              const updatedEvents = [newAccountCreation, ...prevEvents].slice(0, 1000);
              
              // Mark as new for animation
              setNewEventIds(prev => new Set([...prev, newAccountCreation.id]));
              
              // Clear animation after 2 seconds
              setTimeout(() => {
                setNewEventIds(prev => {
                  const updated = new Set(prev);
                  updated.delete(newAccountCreation.id);
                  return updated;
                });
              }, 2000);

              return updatedEvents;
            });

            setError(null);
          } catch (err) {
            // Error processing account creation
            setError(new Error('Failed to process account creation update'));
          }
        });

        cleanupRef.current = () => {
          cleanup();
          cleanupAccountCreations();
        };
        setIsLoading(false);
      } catch (err) {
        // Failed to connect to WebSocket
        setError(err instanceof Error ? err : new Error('Failed to connect'));
        setIsLoading(false);
      }
    };

    connectAndSubscribe();

    // Cleanup function
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const clearEvents = () => {
    setEvents([]);
    setNewEventIds(new Set());
  };

  return {
    events,
    newEventIds,
    isLoading,
    error,
    clearEvents,
    isAnimating
  };
};
