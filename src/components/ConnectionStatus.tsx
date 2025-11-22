import React, { useState, useEffect, useRef } from 'react';
import { getWebSocketService } from '../services/websocket';

export const ConnectionStatus: React.FC = () => {
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsService = useRef(getWebSocketService());
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const ws = wsService.current;
    
    // Set initial state
    setConnectionState(ws.getConnectionState());
    
    // Subscribe to connection state changes
    const cleanup = ws.onConnectionStateChange((state) => {
      setConnectionState(state);
    });

    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const getStatusDisplay = () => {
    switch (connectionState) {
      case 'connected':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-400',
          text: 'Connected',
          icon: '●'
        };
      case 'connecting':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400',
          text: 'Connecting',
          icon: '○'
        };
      case 'error':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-400',
          text: 'Error',
          icon: '●'
        };
      case 'disconnected':
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-400',
          text: 'Disconnected',
          icon: '●'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${status.bgColor} ${connectionState === 'connecting' ? 'animate-pulse' : ''}`}></div>
      <span className={status.color}>
        {status.text}
      </span>
      {connectionState === 'connecting' && (
        <div className="border border-yellow-400 border-t-transparent rounded-full w-3 h-3 animate-spin"></div>
      )}
    </div>
  );
};