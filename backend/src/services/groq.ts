import Groq, { toFile } from 'groq-sdk';
import { logger } from '../middleware/logger.js';
import type { TranscribeResponse } from '../types/index.js';

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string = 'audio.webm'
): Promise<TranscribeResponse> {
  try {
    const client = getGroqClient();
    
    logger.info(`[Groq] Transcribing audio file: ${filename} (${audioBuffer.length} bytes)`);

    // Convert Buffer to File-like object for Groq SDK using toFile helper
    const audioFile = await toFile(audioBuffer, filename, { type: 'audio/webm' });

    const transcription = await client.audio.transcriptions.create({
      model: 'whisper-large-v3-turbo',
      file: audioFile,
      language: 'pt', // Portuguese - adjust as needed
      response_format: 'json',
    });

    logger.info(`[Groq] Transcription successful: ${transcription.text.substring(0, 50)}...`);

    return {
      success: true,
      text: transcription.text,
    };
  } catch (error) {
    logger.error('[Groq] Transcription error:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        text: '',
        error: error.message,
      };
    }

    return {
      success: false,
      text: '',
      error: 'Failed to transcribe audio',
    };
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const client = getGroqClient();
    // Simple API check - list models
    await client.models.list();
    return true;
  } catch {
    return false;
  }
}
