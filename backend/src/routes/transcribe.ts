import { Router, Request, Response } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/groq.js';
import { logger } from '../middleware/logger.js';
import type { TranscribeResponse } from '../types/index.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max (Groq limit)
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'audio/webm',
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/m4a',
      'audio/mp4',
      'audio/ogg',
      'audio/flac',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedMimes.join(', ')}`));
    }
  },
});

router.post(
  '/',
  upload.single('audio'),
  async (req: Request, res: Response<TranscribeResponse>) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          text: '',
          error: 'No audio file provided',
        });
        return;
      }

      logger.info(`[Transcribe] Processing audio: ${req.file.originalname || 'audio'} (${req.file.size} bytes)`);

      const result = await transcribeAudio(
        req.file.buffer,
        req.file.originalname || 'audio.webm'
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      logger.error('[Transcribe] Error:', error);
      res.status(500).json({
        success: false,
        text: '',
        error: error instanceof Error ? error.message : 'Failed to transcribe audio',
      });
    }
  }
);

export default router;
