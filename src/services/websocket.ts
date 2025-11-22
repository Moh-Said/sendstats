import type { 
  WebSocketMessage, 
  SubscribeMessage, 
  WebSocketResponse
} from '../types';

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private connectionStateHandlers: Set<(state: 'connecting' | 'connected' | 'disconnected' | 'error') => void> = new Set();
  private currentState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';

  constructor(url?: string) {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    this.url = url || baseUrl.replace('http', 'ws') + '/live';
  }

  // Connection state management
  private setState(newState: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    this.currentState = newState;
    this.connectionStateHandlers.forEach(handler => {
      try {
        handler(newState);
      } catch (error) {
        console.error('Error in connection state handler:', error);
      }
    });
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.setState('connecting');
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          this.setState('connected');
          this.reconnectAttempts = 0;
          
          // Subscribe to topics and get initial data
          this.subscribe('transfers');
          this.subscribe('account_creations');
          
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketResponse = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.socket.onclose = (event) => {
          // WebSocket disconnected, attempting to reconnect...
          this.socket = null;
          this.setState('disconnected');
          
          // Attempt to reconnect if not manually closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              this.connect();
            }, Math.min(this.reconnectDelay * this.reconnectAttempts, 30000)); // Cap at 30 seconds
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.setState('error');
          reject(error);
        };
      } catch (error) {
        this.setState('error');
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // WebSocket not connected, message queued
    }
  }

  subscribe(topic: 'transfers' | 'account_creations'): void {
    const subscribeMessage: SubscribeMessage = {
      type: 'subscribe',
      topic
    };
    this.send(subscribeMessage);
  }

  

  on(type: 'new_transfer' | 'new_account_creation', handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return cleanup function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  private handleMessage(message: WebSocketResponse): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    return this.currentState;
  }

  onConnectionStateChange(handler: (state: 'connecting' | 'connected' | 'disconnected' | 'error') => void): () => void {
    this.connectionStateHandlers.add(handler);
    
    // Return cleanup function
    return () => {
      this.connectionStateHandlers.delete(handler);
    };
  }
}

// Singleton instance
let wsService: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!wsService) {
    wsService = new WebSocketService();
  }
  return wsService;
};