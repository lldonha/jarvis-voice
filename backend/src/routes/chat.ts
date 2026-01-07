import { Router, Request, Response } from 'express';
import { sendToN8N } from '../services/n8n.js';
import { logger } from '../middleware/logger.js';
import type { ChatRequest, ChatResponse } from '../types/index.js';

const router = Router();

router.post('/', async (req: Request<{}, ChatResponse, ChatRequest>, res: Response<ChatResponse>) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        response: '',
        error: 'Message is required',
      });
      return;
    }

    const session = sessionId || `session_${Date.now()}`;
    
    logger.info(`[Chat] Processing message for session ${session}: ${message.substring(0, 50)}...`);

    const response = await sendToN8N(message, session);

    if (response.success) {
      res.json({
        success: true,
        response: response.response,
        model_used: response.model_used,
        sessionId: session,
      });
    } else {
      res.status(500).json({
        success: false,
        response: response.response,
        error: 'Failed to get response from AI',
      });
    }
  } catch (error) {
    logger.error('[Chat] Error:', error);
    res.status(500).json({
      success: false,
      response: '',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
