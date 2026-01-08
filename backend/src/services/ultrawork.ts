/**
 * Ultrawork Service
 * Integrates with Oh My OpenCode CLI for Ultrawork mode (orchestration)
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface UltraworkResponse {
  response: string;
  success: boolean;
}

/**
 * Execute Ultrawork mode for complex tasks
 * Automatically orchestrates multiple parallel agents
 */
export async function runUltrawork(
  message: string,
  _sessionId: string
): Promise<UltraworkResponse> {
  const startTime = Date.now();

  try {
    console.log(`[Ultrawork Service] Processing: ${message.substring(0, 50)}...`);

    // Use Ultrawork keyword to trigger automatic orchestration
    const prompt = message.startsWith('ulw:')
      ? message.substring(4).trim()
      : message;

    const command = `opencode run "ulw: ${prompt.replace(/"/g, '\\"')}"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // 2 minutes for Ultrawork (orchestration takes longer)
    });

    if (stderr) {
      throw new Error(stderr);
    }

    console.log(`[Ultrawork Service] Completed in ${Date.now() - startTime}ms`);

    return {
      response: stdout.trim(),
      success: true,
    };
  } catch (error) {
    console.error(
      `[Ultrawork Service] Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return {
      response: error instanceof Error ? error.message : 'Ultrawork failed',
      success: false,
    };
  }
}
