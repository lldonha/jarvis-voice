import { Router, Request, Response } from 'express';
import { logger } from '../middleware/logger.js';
import { routeRequest } from '../services/router.js';
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

    // Use router to detect intent and route appropriately
    const routeResponse = await routeRequest(message, session);

    if (routeResponse.success) {
      res.json({
        success: true,
        response: routeResponse.response,
        tool_used: routeResponse.tool_used,
        model_used: routeResponse.model_used,
        sessionId: session,
      });
    } else {
      res.status(500).json({
        success: false,
        response: routeResponse.response,
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
