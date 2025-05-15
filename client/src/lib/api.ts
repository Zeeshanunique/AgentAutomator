import { AgentType, AgentConfig } from '@/types/agents';

// Base API URL
const API_BASE_URL = '/api';

// Agent API endpoints
const AGENTS_ENDPOINT = `${API_BASE_URL}/agents`;

// Connection API endpoints
const CONNECTIONS_ENDPOINT = `${API_BASE_URL}/connections`;

// Generic API request function with error handling
async function apiRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  // For DELETE requests that return 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Agent API functions
export const agentApi = {
  // Get all agents
  getAgents: () => apiRequest<any[]>(AGENTS_ENDPOINT),

  // Get a specific agent
  getAgent: (id: number) => apiRequest<any>(`${AGENTS_ENDPOINT}/${id}`),

  // Create a new agent
  createAgent: (data: {
    name: string;
    type: AgentType;
    description?: string;
    config?: AgentConfig;
  }) => apiRequest<any>(AGENTS_ENDPOINT, 'POST', data),

  // Update an existing agent
  updateAgent: (id: number, data: {
    name?: string;
    description?: string;
    config?: AgentConfig;
    active?: boolean;
  }) => apiRequest<any>(`${AGENTS_ENDPOINT}/${id}`, 'PUT', data),

  // Delete an agent
  deleteAgent: (id: number) => apiRequest<void>(`${AGENTS_ENDPOINT}/${id}`, 'DELETE'),

  // Save an API key for an agent
  saveApiKey: (data: {
    agentId: number;
    service: string;
    apiKey: string;
  }) => apiRequest<any>(`${AGENTS_ENDPOINT}/api-keys`, 'POST', data),

  // Run an agent
  runAgent: (id: number, input: any) => apiRequest<any>(`${AGENTS_ENDPOINT}/${id}/run`, 'POST', { input }),

  // Create a task for an agent
  createTask: (data: {
    agentId: number;
    name: string;
    description?: string;
    input?: any;
  }) => apiRequest<any>(`${AGENTS_ENDPOINT}/tasks`, 'POST', data),
};

// OpenAI API functions
export const openaiApi = {
  // Get completion from OpenAI
  getCompletion: (data: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
  }) => apiRequest<any>(`${API_BASE_URL}/ai/completion`, 'POST', data),

  // Generate image with DALL-E
  generateImage: (prompt: string) => 
    apiRequest<any>(`${API_BASE_URL}/ai/image`, 'POST', { prompt }),
};

// Connection API functions
export const connectionApi = {
  // Get all connections for a workflow
  getConnections: (workflowId: number) => 
    apiRequest<any[]>(`${CONNECTIONS_ENDPOINT}/${workflowId}`),
  
  // Create a new connection
  createConnection: (data: {
    sourceAgentId: number;
    targetAgentId: number;
    workflowId: number;
    position?: number;
  }) => apiRequest<any>(CONNECTIONS_ENDPOINT, 'POST', data),
  
  // Delete a connection
  deleteConnection: (id: number) => 
    apiRequest<void>(`${CONNECTIONS_ENDPOINT}/${id}`, 'DELETE'),
  
  // Update all connections for a workflow
  updateWorkflowConnections: (workflowId: number, connections: Array<{
    sourceAgentId: number;
    targetAgentId: number;
    position?: number;
  }>) => apiRequest<any[]>(`${CONNECTIONS_ENDPOINT}/workflow/${workflowId}`, 'PUT', { connections }),
};

// Settings API functions
export const settingsApi = {
  // Save OpenAI API key
  saveOpenAIKey: (openai: string) => 
    apiRequest<any>(`${API_BASE_URL}/settings/apikey`, 'POST', { openai }),
  
  // Get API key status
  getApiKeyStatus: () => 
    apiRequest<{ hasOpenAI: boolean }>(`${API_BASE_URL}/settings/apikey`),
};
