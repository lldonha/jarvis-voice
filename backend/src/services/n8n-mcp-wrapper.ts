/**
 * N8N MCP Wrapper Service
 * Encapsulates all n8n-MCP interactions with error handling and retry logic
 */

import axios, { AxiosError } from 'axios';
import { logger } from '../middleware/logger.js';

/**
 * Configuration
 */
const N8N_API_BASE = process.env.N8N_API_URL || 'https://n8n.lldonha.com/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

/**
 * Helper function to build full API URL
 */
function buildApiUrl(endpoint: string): string {
  return `${N8N_API_BASE}/${endpoint}`;
}

/**
 * Helper function to get axios config with authentication
 */
function getAxiosConfig() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (N8N_API_KEY) {
    headers['X-N8N-API-KEY'] = N8N_API_KEY;
  }
  
  return {
    headers,
    timeout: 30000, // 30 seconds default
  };
}

/**
 * Helper function to handle n8n-MCP errors gracefully
 */
function handleMcpError(error: unknown, context: string): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.code === 'ECONNABORTED') {
      logger.error(`[n8n-mcp] Request timeout: ${context}`);
      throw new Error('Request timeout - server took too long to respond');
    }
    
    if (axiosError.response) {
      const status = axiosError.response.status;

      if (status === 401) {
        logger.error(`[n8n-mcp] Unauthorized: ${context}`);
        throw new Error('API key is invalid or expired');
      }
      
      if (status === 403) {
        logger.error(`[n8n-mcp] Forbidden: ${context}`);
        throw new Error('You do not have permission for this operation');
      }
      
      if (status === 404) {
        logger.warn(`[n8n-mcp] Not found: ${context}`);
        throw new Error('Resource not found');
      }
      
      if (status === 429) {
        logger.error(`[n8n-mcp] Rate limited: ${context}`);
        throw new Error('Too many requests - please try again later');
      }
      
      if (status >= 500) {
        logger.error(`[n8n-mcp] Server error (${status}): ${context}`);
        throw new Error('Server error - please try again later');
      }
    }
  }
  
  logger.error(`[n8n-mcp] Unknown error: ${context}`, error);
  throw new Error(`n8n-MCP request failed: ${context}`);
}

/**
 * N8N MCP Tools
 * Wrappers around n8n-mcp tools with type safety
 */

/**
 * Validate a workflow before creation
 */
export async function validateWorkflow(
  name: string,
  nodes: any[],
  connections: any,
  settings?: Record<string, any>
): Promise<{ valid: boolean; errors: string[] }> {
  logger.info(`[n8n-mcp] Validating workflow: ${name}`);
  
  try {
    const response = await axios.post(
      buildApiUrl('workflows/validate'),
      { name, nodes, connections, settings },
      getAxiosConfig()
    );
    
    const data = response.data;
    
    if (data.success) {
      logger.info(`[n8n-mcp] Workflow "${name}" is valid`);
      return { valid: true, errors: [] };
    } else {
      const errors = data.errors || [];
      logger.error(`[n8n-mcp] Workflow "${name}" validation failed:`, errors);
      return { valid: false, errors: errors.map((e: any) => e.message || e.toString()) };
    }
  } catch (error) {
    return handleMcpError(error, `validateWorkflow(${name})`);
  }
}

/**
 * Create a new workflow
 */
export async function createWorkflow(
  name: string,
  nodes: any[],
  connections: any,
  settings?: Record<string, any>
): Promise<{ success: boolean; workflow_id?: string; message: string }> {
  logger.info(`[n8n-mcp] Creating workflow: ${name}`);
  
  try {
    const response = await axios.post(
      buildApiUrl('workflows'),
      { name, nodes, connections, settings },
      getAxiosConfig()
    );
    
    const data = response.data;
    
    if (data.success) {
      logger.info(`[n8n-mcp] Workflow "${name}" created with ID: ${data.id}`);
      return { success: true, workflow_id: data.id, message: `Workflow created successfully` };
    } else {
      const errors = data.errors || [];
      logger.error(`[n8n-mcp] Workflow "${name}" creation failed:`, errors);
      throw new Error(`Failed to create workflow: ${errors.join(', ')}`);
    }
  } catch (error) {
    return handleMcpError(error, `createWorkflow(${name})`);
  }
}

/**
 * Update a workflow (partial update)
 */
export async function updateWorkflow(
  id: string,
  operations: any[]
): Promise<{ success: boolean; message: string }> {
  logger.info(`[n8n-mcp] Updating workflow: ${id}`);
  
  try {
    const response = await axios.post(
      buildApiUrl(`workflows/${id}`),
      { operations },
      getAxiosConfig()
    );
    
    const data = response.data;
    
    if (data.success) {
      logger.info(`[n8n-mcp] Workflow "${id}" updated successfully`);
      return { success: true, message: 'Workflow updated successfully' };
    } else {
      const errors = data.errors || [];
      logger.error(`[n8n-mcp] Workflow "${id}" update failed:`, errors);
      throw new Error(`Failed to update workflow: ${errors.join(', ')}`);
    }
  } catch (error) {
    return handleMcpError(error, `updateWorkflow(${id})`);
  }
}

/**
 * Activate a workflow
 */
export async function activateWorkflow(
  id: string,
  versionId?: string
): Promise<{ success: boolean; message: string }> {
  logger.info(`[n8n-mcp] Activating workflow: ${id}`);
  
  try {
    const response = await axios.post(
      buildApiUrl(`workflows/${id}/activate`),
      { versionId },
      getAxiosConfig()
    );
    
    const data = response.data;
    
    if (data.success) {
      logger.info(`[n8n-mcp] Workflow "${id}" activated successfully`);
      return { success: true, message: 'Workflow activated successfully' };
    } else {
      const errors = data.errors || [];
      logger.error(`[n8n-mcp] Workflow "${id}" activation failed:`, errors);
      throw new Error(`Failed to activate workflow: ${errors.join(', ')}`);
    }
  } catch (error) {
    return handleMcpError(error, `activateWorkflow(${id})`);
  }
}

/**
 * Test a workflow (execute webhook)
 */
export async function testWebhook(
  webhookPath: string,
  data?: any
): Promise<{ success: boolean; status?: number; message?: string }> {
  logger.info(`[n8n-mcp] Testing webhook: /webhook/${webhookPath}`);
  
  try {
    const response = await axios.post(
      buildApiUrl(`workflows/test`),
      { webhookPath, data },
      getAxiosConfig()
    );
    
    const result = response.data;
    logger.info(`[n8n-mcp] Webhook test result:`, result);
    
    return result;
  } catch (error) {
    return handleMcpError(error, `testWebhook(${webhookPath})`);
  }
}

/**
 * List workflows
 */
export async function listWorkflows(
  filter?: { tags?: string[]; active?: boolean }
): Promise<{ success: boolean; workflows: any[] }> {
  const tags = filter?.tags || [];
  const active = filter?.active !== undefined ? filter.active : undefined;
  const params: any = {};
  
  if (tags.length > 0) params.tags = tags;
  if (active !== undefined) params.active = active;
  
  logger.info(`[n8n-mcp] Listing workflows with filter:`, params);
  
  try {
    const response = await axios.get(
      buildApiUrl('workflows'),
      {
        ...getAxiosConfig(),
        params,
      }
    );
    
    const data = response.data;
    
    if (data.success) {
      logger.info(`[n8n-mcp] Found ${data.workflows.length} workflows`);
      return { success: true, workflows: data.workflows };
    } else {
      throw new Error('Failed to list workflows');
    }
  } catch (error) {
    return handleMcpError(error, `listWorkflows()`);
  }
}

/**
 * Get workflow details
 */
export async function getWorkflow(
  id: string
): Promise<{ success: boolean; workflow?: any }> {
  logger.info(`[n8n-mcp] Getting workflow: ${id}`);
  
  try {
    const response = await axios.get(
      buildApiUrl(`workflows/${id}`),
      getAxiosConfig()
    );
    
    const data = response.data;
    
    if (data.success) {
      logger.info(`[n8n-mcp] Workflow retrieved: ${data.workflow.name}`);
      return { success: true, workflow: data.workflow };
    } else {
      throw new Error(`Failed to get workflow: ${id}`);
    }
  } catch (error) {
    return handleMcpError(error, `getWorkflow(${id})`);
  }
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(
  id: string
): Promise<{ success: boolean; message: string }> {
  logger.info(`[n8n-mcp] Deleting workflow: ${id}`);
  
  try {
    const response = await axios.delete(
      buildApiUrl(`workflows/${id}`),
      getAxiosConfig()
    );
    
    if (response.status === 204) {
      logger.info(`[n8n-mcp] Workflow "${id}" deleted successfully`);
      return { success: true, message: 'Workflow deleted successfully' };
    } else {
      throw new Error(`Failed to delete workflow: ${id}`);
    }
  } catch (error) {
    return handleMcpError(error, `deleteWorkflow(${id})`);
  }
}

/**
 * Execute workflow via webhook (for chat)
 */
export async function executeWorkflow(
  webhookPath: string,
  data: any
): Promise<{ success: boolean; response: string }> {
  logger.info(`[n8n-mcp] Executing workflow: /webhook/${webhookPath}`);
  
  try {
    const response = await axios.post(
      buildApiUrl(`webhook/${webhookPath}`),
      data,
      getAxiosConfig()
    );
    
    const result = response.data;
    logger.info(`[n8n-mcp] Workflow execution result:`, result);
    
    return result;
  } catch (error) {
    return handleMcpError(error, `executeWorkflow(${webhookPath})`);
  }
}

// Helper function for webhook URLs
export function getWorkflowWebhookUrl(_workflowId: string, webhookPath: string): string {
  return `https://n8n.lldonha.com/webhook/${webhookPath}`;
}

export function getWebhookUrl(workflowId: string): string {
  return `${N8N_API_BASE}/webhook/${workflowId}`;
}

/**
 * Call n8n-MCP tool (generic wrapper for any MCP tool)
 * This is used by workflow-builder.js to create workflows via API
 */
export async function callN8NMCPTool({ toolName, args = {} }: { toolName: string; args?: Record<string, any> }): Promise<any> {
  try {
    logger.info(`[n8n-mcp] Calling tool: ${toolName}`);

    // Map tool names to n8n API endpoints
    switch (toolName) {
      case 'n8n_create_workflow':
        // Create workflow via n8n API
        const response = await axios.post(
          buildApiUrl('workflows'),
          {
            name: args.name,
            nodes: args.nodes,
            connections: args.connections,
            settings: args.settings || { availableInMCP: true },
          },
          getAxiosConfig()
        );

        const data = response.data;

        if (data.success) {
          logger.info(`[n8n-mcp] Workflow created: ${data.id}`);
          return data;
        } else {
          throw new Error(data.message || 'Failed to create workflow');
        }

      default:
        throw new Error(`Unknown n8n-MCP tool: ${toolName}`);
    }
  } catch (error) {
    return handleMcpError(error, `callN8NMCPTool(${toolName})`);
  }
}
