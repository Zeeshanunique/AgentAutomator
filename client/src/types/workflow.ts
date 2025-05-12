import { Node, Edge } from 'reactflow';

export type NodeCategory = 'ai' | 'data' | 'processing' | 'output' | 'sales' | 'marketing';

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
  // Ad Generator properties
  adType?: string;
  audience?: string;
  cta?: string;
  industryVertical?: string;
  // Campaign Planner properties
  campaignType?: string;
  duration?: string;
  channels?: string[];
  budget?: number;
  kpis?: string[];
  // Content Writer properties
  tone?: string;
  targetWordCount?: number;
  seoKeywords?: string[];
  includeImages?: boolean;
  // Lead Generator properties
  targetAudience?: string;
  minimumScore?: number;
  outputFormat?: string;
  // Outreach Sequence properties
  steps?: number;
  channel?: string;
  followUpDays?: number;
  personalizationLevel?: string;
  // Sales Analytics properties
  metrics?: string[];
  period?: string;
  visualization?: string;
  // Google Sheets properties
  sheetId?: string;
  range?: string;
  authentication?: string;
  refreshInterval?: string;
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
    type: 'ad-generator',
    label: 'Ad Generator',
    category: 'marketing',
    color: 'primary',
    defaultData: {
      label: 'Ad Generator',
      color: 'primary',
      name: 'Social Media Ad Creator',
      platform: 'facebook',
      adType: 'image',
      audience: 'professionals',
      cta: 'Learn More',
      industryVertical: 'technology'
    }
  },
  {
    type: 'campaign-planner',
    label: 'Campaign Planner',
    category: 'marketing',
    color: 'nodeBlue',
    defaultData: {
      label: 'Campaign Planner',
      color: 'nodeBlue',
      name: 'Marketing Campaign Planner',
      campaignType: 'product-launch',
      duration: '4 weeks',
      channels: ['email', 'social', 'paid-ads'],
      budget: 5000,
      kpis: ['leads', 'conversions', 'engagement']
    }
  },
  {
    type: 'content-writer',
    label: 'Content Writer',
    category: 'marketing',
    color: 'nodeAmber',
    defaultData: {
      label: 'Content Writer',
      color: 'nodeAmber',
      name: 'AI Content Creator',
      contentType: 'blog-post',
      tone: 'professional',
      targetWordCount: 1200,
      seoKeywords: [],
      includeImages: true
    }
  },
  {
    type: 'lead-generator',
    label: 'Lead Generator',
    category: 'sales',
    color: 'nodeGreen',
    defaultData: {
      label: 'Lead Generator',
      color: 'nodeGreen',
      name: 'Sales Lead Generator',
      source: 'google-sheets',
      targetAudience: 'enterprise',
      minimumScore: 80,
      outputFormat: 'prioritized'
    }
  },
  {
    type: 'outreach-sequence',
    label: 'Outreach Sequence',
    category: 'sales',
    color: 'nodeBlue',
    defaultData: {
      label: 'Outreach Sequence',
      color: 'nodeBlue',
      name: 'Sales Outreach Sequence',
      steps: 3,
      channel: 'email',
      followUpDays: 3,
      personalizationLevel: 'high'
    }
  },
  {
    type: 'sales-analytics',
    label: 'Sales Analytics',
    category: 'sales',
    color: 'primary',
    defaultData: {
      label: 'Sales Analytics',
      color: 'primary',
      name: 'Sales Performance Analyzer',
      metrics: ['conversion', 'revenue', 'pipeline'],
      period: 'monthly',
      visualization: 'chart'
    }
  },
  {
    type: 'google-sheets',
    label: 'Google Sheets',
    category: 'data',
    color: 'nodeGreen',
    defaultData: {
      label: 'Google Sheets',
      color: 'nodeGreen',
      name: 'Leads Data Source',
      sheetId: '',
      range: 'A1:Z1000',
      authentication: 'oauth',
      refreshInterval: 'hourly'
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
