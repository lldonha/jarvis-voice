import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { logger, requestLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initializeWebSocket } from './services/websocket.js';

// Routes
import chatRouter from './routes/chat.js';
import transcribeRouter from './routes/transcribe.js';
import ttsRouter from './routes/tts.js';
import healthRouter from './routes/health.js';

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

// Middleware - CORS with multiple origins support
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3003')
  .split(',')
  .map(url => url.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`[CORS] Blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for development
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/transcribe', transcribeRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/health', healthRouter);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'JARVIS Voice Assistant API',
    version: '3.0.0',
    status: 'running',
    endpoints: {
      chat: 'POST /api/chat',
      transcribe: 'POST /api/transcribe',
      tts: 'POST /api/tts',
      health: 'GET /api/health',
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);

httpServer.listen(PORT, () => {
  logger.info(`🚀 JARVIS Backend running on http://localhost:${PORT}`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🔗 n8n webhook: ${process.env.N8N_WEBHOOK_URL || 'not configured'}`);
  logger.info(`🎤 Groq API: ${process.env.GROQ_API_KEY ? 'configured' : 'not configured'}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.warn('Forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
