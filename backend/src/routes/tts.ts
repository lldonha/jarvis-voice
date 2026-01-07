import { Router, Request, Response } from 'express';
import { synthesizeSpeech, getAvailableVoices } from '../services/tts.js';
import { logger } from '../middleware/logger.js';
import type { TTSRequest, TTSResponse } from '../types/index.js';

const router = Router();

router.post('/', async (req: Request<{}, TTSResponse, TTSRequest>, res: Response) => {
  try {
    const { text, voice, speed } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Text is required',
      });
      return;
    }

    logger.info(`[TTS] Synthesizing: ${text.substring(0, 50)}... (voice: ${voice || 'default'})`);

    const result = await synthesizeSpeech(text, voice, speed);

    if (result.success && result.audioData) {
      // Send audio as binary response
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': result.audioData.length.toString(),
      });
      res.send(result.audioData);
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to synthesize speech',
      });
    }
  } catch (error) {
    logger.error('[TTS] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to synthesize speech',
    });
  }
});

router.get('/voices', async (_req: Request, res: Response) => {
  try {
    const voices = await getAvailableVoices();
    res.json({
      success: true,
      voices,
    });
  } catch (error) {
    logger.error('[TTS] Error getting voices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available voices',
    });
  }
});

export default router;
