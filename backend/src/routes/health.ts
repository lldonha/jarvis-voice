import { Router, Request, Response } from 'express';
import { healthCheck as n8nHealthCheck } from '../services/n8n.js';
import { healthCheck as groqHealthCheck } from '../services/groq.js';
import { healthCheck as ttsHealthCheck } from '../services/tts.js';
import { logger } from '../middleware/logger.js';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    n8n: boolean;
    groq: boolean;
    tts: boolean;
  };
  version: string;
}

router.get('/', async (_req: Request, res: Response<HealthStatus>) => {
  try {
    // Check all services in parallel
    const [n8nStatus, groqStatus, ttsStatus] = await Promise.all([
      n8nHealthCheck().catch(() => false),
      groqHealthCheck().catch(() => false),
      ttsHealthCheck().catch(() => false),
    ]);

    const services = {
      n8n: n8nStatus,
      groq: groqStatus,
      tts: ttsStatus,
    };

    const allHealthy = Object.values(services).every(Boolean);
    const someHealthy = Object.values(services).some(Boolean);

    const status: HealthStatus = {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services,
      version: '3.0.0',
    };

    const httpStatus = allHealthy ? 200 : someHealthy ? 200 : 503;
    res.status(httpStatus).json(status);
  } catch (error) {
    logger.error('[Health] Error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        n8n: false,
        groq: false,
        tts: false,
      },
      version: '3.0.0',
    });
  }
});

// Simple ping endpoint
router.get('/ping', (_req: Request, res: Response) => {
  res.json({ pong: true, timestamp: new Date().toISOString() });
});

export default router;
