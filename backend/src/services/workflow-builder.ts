/**
 * Workflow Builder Service with n8n-MCP
 * Creates workflows via n8n API using n8n-MCP wrapper
 */

interface WorkflowBuilderResponse {
  response: string;
  success: boolean;
  workflowId?: string;
}

/**
 * Create an n8n workflow based on description
 */
export async function createWorkflow(
  message: string,
  _sessionId: string
): Promise<WorkflowBuilderResponse> {
  const startTime = Date.now();

  try {
    console.log(`[Workflow Builder] Processing: ${message.substring(0, 50)}...`);

    // Import n8n-MCP wrapper
    const { callN8NMCPTool } = await import('./n8n-mcp-wrapper.js');

    // Generate workflow name from description
    const workflowName = `Auto: ${message.substring(0, 40).trim()}`;

    // Define basic workflow structure
    const workflowPayload = {
      name: workflowName,
      nodes: [
        {
          id: 'webhook1',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 2.1,
          position: [250, 300],
          parameters: {
            httpMethod: 'POST', // CRITICAL: Always specify!
            path: workflowName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            responseMode: 'responseNode',
            options: {},
          },
          webhookId: workflowName.toLowerCase().replace(/[^a-z0-9]/g, '_'), // CRITICAL: Must match path
        },
        {
          id: 'respond1',
          name: 'Respond to Webhook',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1.1,
          position: [500, 300],
          parameters: {
            respondWith: 'json',
            responseBody: '= {\n  "success": true,\n  "message": "Workflow created by JARVIS"\n}',
          },
        },
      ],
      connections: {
        Webhook: {
          main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]],
        },
      },
      settings: {
        availableInMCP: true, // CRITICAL: Only this setting in v4!
      },
    };

    // Call n8n-MCP to create workflow
    const result = await callN8NMCPTool({
      toolName: 'n8n_create_workflow',
      args: workflowPayload,
    });

    console.log(`[Workflow Builder] Completed in ${Date.now() - startTime}ms`);

    return {
      response: `Workflow created: ${result.id || 'unknown'}`,
      success: true,
      workflowId: result.id,
    };
  } catch (error) {
    console.error(
      `[Workflow Builder] Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return {
      response: error instanceof Error ? error.message : 'Failed to create workflow',
      success: false,
    };
  }
}
