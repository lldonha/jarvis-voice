import axios from 'axios';
import { logger } from '../middleware/logger.js';
import type { TTSResponse } from '../types/index.js';

const KOKORO_URL = process.env.KOKORO_URL || 'http://localhost:8880';
const TTS_PROVIDER = process.env.TTS_PROVIDER || 'edge'; // 'kokoro' or 'edge'

interface KokoroRequest {
  text: string;
  voice: string;
  speed?: number;
}

export async function synthesizeSpeech(
  text: string,
  voice: string = 'bf_emma',
  speed: number = 1.0
): Promise<TTSResponse> {
  if (TTS_PROVIDER === 'kokoro') {
    return synthesizeWithKokoro(text, voice, speed);
  }
  
  // Default to Edge TTS (requires edge-tts npm package or API)
  return synthesizeWithEdgeTTS(text, voice, speed);
}

async function synthesizeWithKokoro(
  text: string,
  voice: string,
  speed: number
): Promise<TTSResponse> {
  try {
    logger.info(`[Kokoro TTS] Synthesizing: ${text.substring(0, 50)}...`);

    const payload: KokoroRequest = {
      text,
      voice,
      speed,
    };

    const response = await axios.post(
      `${KOKORO_URL}/api/v1/tts`,
      payload,
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );

    logger.info(`[Kokoro TTS] Audio generated: ${response.data.byteLength} bytes`);

    return {
      success: true,
      audioData: Buffer.from(response.data),
    };
  } catch (error) {
    logger.error('[Kokoro TTS] Error:', error);

    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Kokoro TTS error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'Failed to synthesize speech',
    };
  }
}

async function synthesizeWithEdgeTTS(
  text: string,
  _voice: string,
  _speed: number
): Promise<TTSResponse> {
  try {
    logger.info(`[Edge TTS] Synthesizing: ${text.substring(0, 50)}...`);

    // Edge TTS via external API (you could use @andresaya/edge-tts npm package)
    // For now, return a placeholder - implement based on your preferred method
    
    // Option 1: Use edge-tts npm package
    // import { EdgeTTS } from '@andresaya/edge-tts';
    // const tts = new EdgeTTS();
    // await tts.synthesize(text, voice);
    // const audioBuffer = await tts.toBuffer();
    
    // Option 2: Use external Edge TTS API if available
    
    logger.warn('[Edge TTS] Not fully implemented - returning placeholder');
    
    return {
      success: false,
      error: 'Edge TTS not fully implemented. Install Kokoro or configure Edge TTS API.',
    };
  } catch (error) {
    logger.error('[Edge TTS] Error:', error);
    return {
      success: false,
      error: 'Failed to synthesize speech with Edge TTS',
    };
  }
}

export async function getAvailableVoices(): Promise<string[]> {
  if (TTS_PROVIDER === 'kokoro') {
    // Kokoro voices
    return [
      'af_bella', 'af_heart', 'af_nicole', 'af_sky', 'af_sarah',
      'am_adam', 'am_michael', 'bf_emma', 'bf_alice', 'bm_george',
    ];
  }
  
  // Edge TTS voices (subset)
  return [
    'en-US-AriaNeural', 'en-US-GuyNeural', 'en-US-JennyNeural',
    'pt-BR-FranciscaNeural', 'pt-BR-AntonioNeural',
  ];
}

export async function healthCheck(): Promise<boolean> {
  if (TTS_PROVIDER === 'kokoro') {
    try {
      const response = await axios.get(`${KOKORO_URL}/api/v1/admin/status`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
  
  // Edge TTS is always "available" (external service)
  return true;
}
