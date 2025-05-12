import { Node, Edge } from 'reactflow';

export type NodeCategory = 'ai' | 'data' | 'processing' | 'output';

export interface NodeDefinition {
  type: string;
  label: string;
  category: NodeCategory;
  color: string;
  defaultData?: NodeData;
}

export interface NodeData {
  label: string;
  color: string;
  name?: string;
  // AI model properties
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  modelVersion?: string;
  // CRM properties
  source?: string;
  entity?: string;
  // Email properties
  template?: string;
  sendVia?: string;
  // Filter properties
  condition?: string;
  // Custom LLM properties
  modelUrl?: string;
  apiKey?: string;
  // CMS properties
  cmsType?: string;
  contentType?: string;
  // Database properties
  database?: string;
  table?: string;
  // Transform properties
  transformation?: string;
  // Merge properties
  mergeStrategy?: string;
  // Social media properties
  platform?: string;
  postType?: string;
  // Webhook properties
  webhookUrl?: string;
  method?: string;
  // Advanced settings
  streamResponse?: boolean;
  responseFormat?: string;
}

export interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  data: WorkflowData;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get the appropriate color for a node type
export function getNodeColor(type: string): string {
  switch (type) {
    case 'gpt4':
    case 'claude':
      return 'nodeBlue';
    case 'crm':
    case 'cms':
    case 'database':
      return 'nodeGreen';
    case 'email':
    case 'social':
      return 'nodeAmber';
    case 'custom-llm':
    case 'webhook':
      return 'secondary';
    case 'filter':
    case 'transform':
    case 'merge':
      return 'primary';
    default:
      return 'primary';
  }
}

// Node definitions (pre-built nodes)
export const allNodeDefinitions: NodeDefinition[] = [
  {
    type: 'gpt4',
    label: 'GPT-4 Model',
    category: 'ai',
    color: 'nodeBlue',
    defaultData: {
      label: 'GPT-4 Model',
      color: 'nodeBlue',
      name: 'GPT-4 Sales Assistant',
      systemPrompt: 'You are a sales assistant. Analyze the lead data and generate a personalized outreach message. Focus on their industry needs and pain points.',
      temperature: 0.7,
      maxTokens: 2048,
      modelVersion: 'gpt-4-turbo',
      streamResponse: true,
      responseFormat: 'text'
    }
  },
  {
    type: 'claude',
    label: 'Claude Agent',
    category: 'ai',
    color: 'nodeAmber',
    defaultData: {
      label: 'Claude Agent',
      color: 'nodeAmber',
      name: 'Claude Assistant',
      systemPrompt: 'You are Claude, an AI assistant for sales. Help generate sales content.',
      temperature: 0.7,
      maxTokens: 2048,
      streamResponse: true,
      responseFormat: 'text'
    }
  },
  {
    type: 'custom-llm',
    label: 'Custom LLM',
    category: 'ai',
    color: 'secondary',
    defaultData: {
      label: 'Custom LLM',
      color: 'secondary',
      name: 'Custom Language Model',
      modelUrl: 'https://api.company.ai/v1/models/sales-1',
      apiKey: '',
      streamResponse: false,
      responseFormat: 'json'
    }
  },
  {
    type: 'crm',
    label: 'CRM Connector',
    category: 'data',
    color: 'nodeGreen',
    defaultData: {
      label: 'CRM Connector',
      color: 'nodeGreen',
      name: 'Salesforce CRM',
      source: 'Salesforce',
      entity: 'Leads'
    }
  },
  {
    type: 'cms',
    label: 'CMS Content',
    category: 'data',
    color: 'nodeGreen',
    defaultData: {
      label: 'CMS Content',
      color: 'nodeGreen',
      name: 'WordPress Content',
      cmsType: 'WordPress',
      contentType: 'Blog Posts'
    }
  },
  {
    type: 'database',
    label: 'Database',
    category: 'data',
    color: 'nodeGreen',
    defaultData: {
      label: 'Database',
      color: 'nodeGreen',
      name: 'PostgreSQL Database',
      database: 'PostgreSQL',
      table: 'customers'
    }
  },
  {
    type: 'filter',
    label: 'Filter Data',
    category: 'processing',
    color: 'primary',
    defaultData: {
      label: 'Filter Data',
      color: 'primary',
      name: 'Lead Filter',
      condition: 'leadScore > 70 && lastContact < 30 days'
    }
  },
  {
    type: 'transform',
    label: 'Transform',
    category: 'processing',
    color: 'primary',
    defaultData: {
      label: 'Transform',
      color: 'primary',
      name: 'Data Transformer',
      transformation: 'data => ({ ...data, score: data.score * 1.5 })'
    }
  },
  {
    type: 'merge',
    label: 'Merge Data',
    category: 'processing',
    color: 'primary',
    defaultData: {
      label: 'Merge Data',
      color: 'primary',
      name: 'Data Merger',
      mergeStrategy: 'combine'
    }
  },
  {
    type: 'email',
    label: 'Email Generator',
    category: 'output',
    color: 'nodeAmber',
    defaultData: {
      label: 'Email Generator',
      color: 'nodeAmber',
      name: 'Email Outreach',
      template: 'Outreach-B2B',
      sendVia: 'Marketing Cloud'
    }
  },
  {
    type: 'social',
    label: 'Social Media Post',
    category: 'output',
    color: 'nodeAmber',
    defaultData: {
      label: 'Social Media Post',
      color: 'nodeAmber',
      name: 'LinkedIn Post',
      platform: 'LinkedIn',
      postType: 'Article'
    }
  },
  {
    type: 'webhook',
    label: 'Webhook',
    category: 'output',
    color: 'secondary',
    defaultData: {
      label: 'Webhook',
      color: 'secondary',
      name: 'API Webhook',
      webhookUrl: 'https://example.com/webhook',
      method: 'POST'
    }
  }
];
