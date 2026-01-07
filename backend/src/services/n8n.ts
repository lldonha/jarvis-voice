import axios from 'axios';
import { logger } from '../middleware/logger.js';
import type { N8NWebhookPayload, N8NWebhookResponse } from '../types/index.js';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.lldonha.com/webhook/jarvis-chat';
const TIMEOUT_MS = 60000; // 60 seconds for LLM responses

export async function sendToN8N(
  message: string,
  sessionId: string
): Promise<N8NWebhookResponse> {
  const payload: N8NWebhookPayload = {
    message,
    sessionId,
    timestamp: new Date().toISOString(),
  };

  logger.info(`[n8n] Sending message to webhook: ${message.substring(0, 50)}...`);

  try {
    const response = await axios.post<N8NWebhookResponse>(
      N8N_WEBHOOK_URL,
      payload,
      {
        timeout: TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info(`[n8n] Response received, model: ${response.data.model_used || 'unknown'}`);

    return {
      success: true,
      response: response.data.response || response.data.toString(),
      model_used: response.data.model_used,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`[n8n] Axios error: ${error.message}`);
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          response: 'Request timeout. The AI is taking too long to respond.',
        };
      }

      if (error.response) {
        return {
          success: false,
          response: `n8n error: ${error.response.status} - ${error.response.statusText}`,
        };
      }

      return {
        success: false,
        response: `Connection error: ${error.message}`,
      };
    }

    logger.error(`[n8n] Unknown error:`, error);
    return {
      success: false,
      response: 'An unexpected error occurred.',
    };
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    // Just check if the URL is accessible
    const response = await axios.get(N8N_WEBHOOK_URL.replace('/webhook/', '/'), {
      timeout: 5000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
}
