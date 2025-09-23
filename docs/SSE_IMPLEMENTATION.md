# Server-Sent Events (SSE) Implementation for Community System

## Overview

This document describes the implementation of Server-Sent Events (SSE) for real-time updates in the community system. Users can now see new threads, comments, and likes in real-time without refreshing the page.

## Architecture

### 1. SSE Endpoint (`/api/community/events`)

**File**: `app/api/community/events/route.ts`

- **Purpose**: Establishes SSE connections with clients
- **Features**:
  - Maintains active connections in memory
  - Sends periodic ping messages to keep connections alive
  - Handles connection cleanup on disconnect
  - Broadcasts updates to all connected clients

**Key Functions**:
- `broadcastUpdate(type, data)`: Sends updates to all connected clients
- `getConnectionCount()`: Returns number of active connections

### 2. React Hook (`useSSE`)

**File**: `hooks/useSSE.ts`

- **Purpose**: Provides a React hook for managing SSE connections
- **Features**:
  - Automatic reconnection with configurable attempts
  - Connection status tracking
  - Error handling and recovery
  - Manual connect/disconnect controls

**Hook Interface**:
```typescript
const {
  isConnected,
  connectionStatus,
  reconnectAttempts,
  connect,
  disconnect,
  reconnect
} = useSSE(url, options);
```

### 3. Real-time Updates Integration

**Updated API Endpoints**:
- `POST /api/community/threads` - Broadcasts new threads
- `POST /api/community/comment` - Broadcasts new comments
- `POST /api/community/like` - Broadcasts likes

## Event Types

### 1. Connection Events
- `connected`: Initial connection established
- `ping`: Keep-alive message (every 30 seconds)

### 2. Content Events
- `new_thread`: New thread created
- `new_comment`: New comment added
- `thread_liked`: Thread received a like
- `comment_liked`: Comment received a like

## Implementation Details

### SSE Endpoint Features

```typescript
// Connection management
const connections = new Set<ReadableStreamDefaultController>();

// Broadcast function
export function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString()
  });
  
  const sseData = `data: ${message}\n\n`;
  
  connections.forEach(controller => {
    try {
      controller.enqueue(sseData);
    } catch (error) {
      connections.delete(controller);
    }
  });
}
```

### React Hook Features

```typescript
// Automatic reconnection
const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// Connection status tracking
const [connectionStatus, setConnectionStatus] = useState<
  'connecting' | 'connected' | 'disconnected' | 'error'
>('disconnected');

// Event handling
eventSource.onmessage = (event) => {
  const data: SSEEvent = JSON.parse(event.data);
  onMessage?.(data);
};
```

### Community Page Integration

```typescript
// SSE connection with event handling
const { isConnected, connectionStatus } = useSSE('/api/community/events', {
  onMessage: (event) => {
    switch (event.type) {
      case 'new_thread':
        setThreads(prev => [event.data, ...prev]);
        toast({ title: "New Thread!", description: "..." });
        break;
      case 'new_comment':
        setThreads(prev => prev.map(thread => 
          thread._id === event.data.threadId 
            ? { ...thread, comments: [...thread.comments, event.data.comment] }
            : thread
        ));
        break;
      // ... other event types
    }
  }
});
```

## User Experience Features

### 1. Visual Connection Status
- **Green dot**: Connected and receiving real-time updates
- **Yellow dot**: Connecting...
- **Red dot**: Disconnected
- **Status text**: "Live", "Connecting...", or "Offline"

### 2. Real-time Notifications
- Toast notifications for new threads and comments
- Automatic UI updates without page refresh
- Live like counts and comment counts

### 3. Connection Management
- Automatic reconnection on connection loss
- Configurable reconnection attempts (default: 5)
- Manual reconnect option
- Connection status indicator in header

## Performance Considerations

### 1. Connection Management
- Connections are stored in memory (not persistent across server restarts)
- Automatic cleanup on disconnect
- Periodic ping to detect dead connections

### 2. Broadcasting Efficiency
- Only sends updates to active connections
- Removes failed connections automatically
- JSON serialization for data consistency

### 3. Client-side Optimization
- Automatic reconnection with exponential backoff
- Connection status tracking
- Error handling and recovery

## Security Considerations

### 1. CORS Configuration
```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Cache-Control',
}
```

### 2. Data Validation
- All broadcast data is validated before sending
- User authentication required for actions
- Input sanitization for all user-generated content

## Usage Examples

### 1. Basic Connection
```typescript
const { isConnected } = useSSE('/api/community/events');
```

### 2. With Event Handling
```typescript
const { isConnected, connectionStatus } = useSSE('/api/community/events', {
  onMessage: (event) => {
    console.log('Received:', event.type, event.data);
  },
  onError: (error) => {
    console.error('SSE Error:', error);
  },
  reconnectInterval: 5000,
  maxReconnectAttempts: 3
});
```

### 3. Manual Control
```typescript
const { connect, disconnect, reconnect } = useSSE('/api/community/events');

// Manual operations
const handleReconnect = () => reconnect();
const handleDisconnect = () => disconnect();
```

## Troubleshooting

### 1. Connection Issues
- Check browser console for SSE errors
- Verify server is running and accessible
- Check network connectivity

### 2. Update Issues
- Ensure event types match between client and server
- Check data format consistency
- Verify API endpoints are broadcasting correctly

### 3. Performance Issues
- Monitor connection count
- Check for memory leaks in connection management
- Verify automatic cleanup is working

## Future Enhancements

### 1. Persistent Connections
- Redis-based connection storage
- Cross-server broadcasting
- Connection persistence across restarts

### 2. Advanced Features
- User-specific notifications
- Typing indicators
- Online user count
- Message read receipts

### 3. Scalability
- Load balancing support
- Connection pooling
- Rate limiting
- Message queuing

## Testing

### 1. Manual Testing
1. Open multiple browser tabs to the community page
2. Create a new thread in one tab
3. Verify it appears in real-time in other tabs
4. Test comment creation and likes
5. Test connection status indicators

### 2. Automated Testing
- Unit tests for SSE hook
- Integration tests for API endpoints
- Connection management tests
- Error handling tests

## Conclusion

The SSE implementation provides a robust real-time communication system for the community platform. Users can now experience live updates without page refreshes, creating a more engaging and interactive community experience.

The system is designed to be:
- **Reliable**: Automatic reconnection and error handling
- **Scalable**: Efficient connection management
- **User-friendly**: Clear status indicators and notifications
- **Maintainable**: Clean separation of concerns and comprehensive documentation