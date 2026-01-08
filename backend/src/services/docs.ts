/**
 * Docs Service with Librarian Agent
 * Integrates with Oh My OpenCode CLI for documentation search
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DocsResponse {
  response: string;
  success: boolean;
}

/**
 * Search documentation using Oh My OpenCode Librarian agent
 */
export async function searchDocs(
  message: string,
  _sessionId: string
): Promise<DocsResponse> {
  const startTime = Date.now();

  try {
    console.log(`[Docs Service] Processing: ${message.substring(0, 50)}...`);

    // Use Oh My OpenCode CLI with Librarian agent
    const query = message.startsWith('docs:')
      ? message.substring(5).trim()
      : message;

    const command = `opencode run --agent librarian "${query.replace(/"/g, '\\"')}"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 seconds
    });

    if (stderr) {
      throw new Error(stderr);
    }

    console.log(`[Docs Service] Completed in ${Date.now() - startTime}ms`);

    return {
      response: stdout.trim(),
      success: true,
    };
  } catch (error) {
    console.error(
      `[Docs Service] Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return {
      response: error instanceof Error ? error.message : 'Failed to search docs',
      success: false,
    };
  }
}
