/**
 * Debug Service with Oracle Agent
 * Integrates with Oh My OpenCode CLI for code debugging
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DebugResponse {
  response: string;
  success: boolean;
}

/**
 * Debug code or error using Oh My OpenCode Oracle agent
 */
export async function debugCode(
  message: string,
  _sessionId: string
): Promise<DebugResponse> {
  const startTime = Date.now();

  try {
    console.log(`[Debug Service] Processing: ${message.substring(0, 50)}...`);

    // Use Oh My OpenCode CLI with Oracle agent
    const prompt = message.startsWith('debug:')
      ? `Debug this error and explain fix:\n\n${message.substring(6).trim()}`
      : `Debug this code and suggest improvements:\n\n${message}`;

    const command = `opencode run --agent oracle "${prompt.replace(/"/g, '\\"')}"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 seconds
    });

    if (stderr) {
      throw new Error(stderr);
    }

    console.log(`[Debug Service] Completed in ${Date.now() - startTime}ms`);

    return {
      response: stdout.trim(),
      success: true,
    };
  } catch (error) {
    console.error(
      `[Debug Service] Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return {
      response: error instanceof Error ? error.message : 'Failed to debug code',
      success: false,
    };
  }
}
