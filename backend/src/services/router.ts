/**
 * Detects intent of user's message to determine which route to take
 */
import { ToolName } from '../types/index.js';

export function detectIntent(message: string): string {
  const lower = message.toLowerCase();

  // Criar workflow
  if (/(?:^|\s)(?:crie|criar|create|new workflow|criação)(?:\s|$)/i.test(lower)) {
    return 'create-workflow';
  }

  // Debug
  if (/(?:^|\s)(?:debug:|erro|erro:|corrija|fix)(?:\s|$)/i.test(lower)) {
    return 'debug';
  }

  // Docs
  if (/(?:^|\s)(?:docs:|documentação|como uso|como usar|pesquise|estude)(?:\s|$)/i.test(lower)) {
    return 'docs';
  }

  // Ultrawork
  if (/(?:^|\s)(?:ulw:|ultrawork|orquestra|orchestra)(?:\s|$)/i.test(lower)) {
    return 'ultrawork';
  }

  // Padrão = chat
  return 'chat';
}

export interface RouteResponse {
  success: boolean;
  response: string;
  tool_used?: ToolName;
  model_used?: string;
  execution_time_ms?: number;
  workflowId?: string;
}

/**
 * Route request based on intent detection
 */
export async function routeRequest(
  message: string,
  sessionId: string
): Promise<RouteResponse> {
  const startTime = Date.now();
  const intent = detectIntent(message);

  try {
    switch (intent) {
      case 'debug': {
        const { debugCode } = await import('./debug.js');
        const result = await debugCode(message, sessionId);

        return {
          success: result.success,
          response: result.response,
          tool_used: 'claude',
          model_used: 'claude-opus-4.5',
          execution_time_ms: Date.now() - startTime,
        };
      }

      case 'docs': {
        const { searchDocs } = await import('./docs.js');
        const result = await searchDocs(message, sessionId);

        return {
          success: result.success,
          response: result.response,
          tool_used: 'openCode',
          model_used: 'glm-4.7-free',
          execution_time_ms: Date.now() - startTime,
        };
      }

      case 'ultrawork': {
        const { runUltrawork } = await import('./ultrawork.js');
        const result = await runUltrawork(message, sessionId);

        return {
          success: result.success,
          response: result.response,
          tool_used: 'openCode',
          model_used: 'claude-opus-4.5',
          execution_time_ms: Date.now() - startTime,
        };
      }

      case 'create-workflow': {
        const { createWorkflow } = await import('./workflow-builder.js');
        const result = await createWorkflow(message, sessionId);

        return {
          success: result.success,
          response: result.response,
          tool_used: 'openCode',
          model_used: 'n8n',
          execution_time_ms: Date.now() - startTime,
          workflowId: result.workflowId,
        };
      }

      case 'chat':
      default:
        const { sendToN8N } = await import('./n8n.js');
        const response = await sendToN8N(message, sessionId);

        return {
          success: response.success,
          response: response.response || '',
          tool_used: 'openCode',
          model_used: response.model_used || 'llama-3.1-8b-instant',
          execution_time_ms: Date.now() - startTime,
        };
    }
  } catch (error) {
    return {
      success: false,
      response: error instanceof Error ? error.message : 'Unknown error occurred',
      execution_time_ms: Date.now() - startTime,
    };
  }
}
