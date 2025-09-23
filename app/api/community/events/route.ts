import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      connections.add(controller);
      
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        message: 'Connected to community updates',
        timestamp: new Date().toISOString()
      });
      
      controller.enqueue(`data: ${data}\n\n`);
      
      // Keep connection alive with periodic ping
      const pingInterval = setInterval(() => {
        try {
          const pingData = JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
          });
          controller.enqueue(`data: ${pingData}\n\n`);
        } catch (error) {
          console.error('Error sending ping:', error);
          clearInterval(pingInterval);
          connections.delete(controller);
        }
      }, 30000); // Ping every 30 seconds
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        connections.delete(controller);
        try {
          controller.close();
        } catch (error) {
          console.error('Error closing SSE connection:', error);
        }
      });
    },
    
    cancel() {
      connections.delete(this);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Function to broadcast updates to all connected clients
export function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString()
  });
  
  const sseData = `data: ${message}\n\n`;
  
  // Send to all connected clients
  connections.forEach(controller => {
    try {
      controller.enqueue(sseData);
    } catch (error) {
      console.error('Error broadcasting to client:', error);
      connections.delete(controller);
    }
  });
}

// Function to get connection count
export function getConnectionCount() {
  return connections.size;
}