import { useEffect, useRef, useState } from 'react';

interface SSEEvent {
  type: string;
  data?: any;
  message?: string;
  timestamp: string;
}

interface UseSSEOptions {
  onMessage?: (event: SSEEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useSSE(url: string, options: UseSSEOptions = {}) {
  const {
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualClose = useRef(false);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');
    
    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        onOpen?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          console.log('SSE message received:', data);
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        setConnectionStatus('error');
        
        // Only call onError if it's a real error, not just connection issues
        if (eventSource.readyState === EventSource.CLOSED) {
          onError?.(error);
        }

        // Attempt to reconnect if not manually closed
        if (!isManualClose.current && reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);
          setConnectionStatus('connecting');
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          setConnectionStatus('disconnected');
        }
      };

      eventSource.addEventListener('close', () => {
        console.log('SSE connection closed');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onClose?.();
      });

    } catch (error) {
      console.error('Error creating SSE connection:', error);
      setConnectionStatus('error');
      onError?.(error as Event);
    }
  };

  const disconnect = () => {
    isManualClose.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const reconnect = () => {
    isManualClose.current = false;
    setReconnectAttempts(0);
    connect();
  };

  useEffect(() => {
    // Add a small delay to ensure the server is ready
    const timeoutId = setTimeout(() => {
      connect();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      disconnect();
    };
  }, [url]);

  return {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    connect,
    disconnect,
    reconnect
  };
}