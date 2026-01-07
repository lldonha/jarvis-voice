import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../middleware/logger.js';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '../types/index.js';

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

export function initializeWebSocket(httpServer: HTTPServer): Server {
  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    }
  );

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    logger.info(`[WebSocket] Client connected: ${socket.id}`);

    // Send connection confirmation
    socket.emit('connected');

    // Handle chat messages via WebSocket (alternative to REST)
    socket.on('chat', async (data) => {
      logger.info(`[WebSocket] Chat message from ${socket.id}: ${data.message.substring(0, 50)}...`);
      
      try {
        // Import dynamically to avoid circular dependency
        const { sendToN8N } = await import('./n8n.js');
        const response = await sendToN8N(data.message, data.sessionId);

        if (response.success) {
          socket.emit('message', {
            id: `msg_${Date.now()}`,
            content: response.response,
            role: 'assistant',
          });
        } else {
          socket.emit('error', { message: response.response });
        }
      } catch (error) {
        logger.error('[WebSocket] Chat error:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`[WebSocket] Client disconnected: ${socket.id} (${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`[WebSocket] Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('[WebSocket] Server initialized');
  return io;
}

export function getIO(): Server | null {
  return io;
}

export function broadcastMessage(event: keyof ServerToClientEvents, data: any): void {
  if (io) {
    io.emit(event, data);
  }
}

export function sendToSocket(
  socketId: string,
  event: keyof ServerToClientEvents,
  data: any
): void {
  if (io) {
    io.to(socketId).emit(event, data);
  }
}
