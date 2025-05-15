import { z } from "zod";

// Agent types
export type AgentType = 
  | 'strategy' 
  | 'copyGen' 
  | 'design' 
  | 'videoGen' 
  | 'approval' 
  | 'scheduler';

// Agent categories
export type AgentCategory = 'marketing';

// Base agent interface
export interface AgentDefinition {
  type: AgentType;
  label: string;
  emoji: string;
  category: AgentCategory;
  color: string;
  description: string;
  tools: string[];
  defaultConfig?: AgentConfig;
}

// Agent configuration interface
export interface AgentConfig {
  name: string;
  description?: string;
  active: boolean;
  // AI model properties
  model?: string;
  temperature?: number;
  maxTokens?: number;
  // API keys
  apiKeys?: Record<string, string>;
  // Agent-specific properties
  properties?: Record<string, any>;
}

// Marketing workflow agents
export const marketingAgents: AgentDefinition[] = [
  {
    type: 'strategy',
    label: 'Strategy Agent',
    emoji: '🧠',
    category: 'marketing',
    color: 'blue',
    description: 'Plans content strategy, tone, and calendar',
    tools: ['OpenAI GPT-4', 'Claude', 'Gemini', 'Google Calendar', 'Notion', 'Trello', 'Airtable'],
    defaultConfig: {
      name: 'Content Strategy Planner',
      description: 'Plans content strategy, tone, and calendar for marketing campaigns',
      active: true,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048,
      properties: {
        planningHorizon: '3 months',
        contentTypes: ['blog', 'social', 'email', 'video'],
        targetAudience: 'professionals',
        contentGoals: ['engagement', 'conversion', 'brand awareness']
      }
    }
  },
  {
    type: 'copyGen',
    label: 'Copy Generation Agent',
    emoji: '✍️',
    category: 'marketing',
    color: 'amber',
    description: 'Generates captions, hooks, hashtags',
    tools: ['OpenAI GPT-4', 'Claude', 'Gemini', 'RiteTag API', 'Grammarly API'],
    defaultConfig: {
      name: 'Content Copy Generator',
      description: 'Generates engaging captions, hooks, and hashtags for marketing content',
      active: true,
      model: 'gpt-4',
      temperature: 0.8,
      maxTokens: 1024,
      properties: {
        toneOfVoice: 'professional',
        contentLength: 'medium',
        includeHashtags: true,
        hashtagCount: 5,
        includeEmojis: true
      }
    }
  },
  {
    type: 'design',
    label: 'Design Agent',
    emoji: '🎨',
    category: 'marketing',
    color: 'green',
    description: 'Creates static visuals, carousels, memes',
    tools: ['Canva API', 'DALL·E', 'Midjourney', 'Stable Diffusion', 'Remove.bg', 'Cleanup.pictures', 'Brandfetch API'],
    defaultConfig: {
      name: 'Visual Content Designer',
      description: 'Creates static visuals, carousels, and memes for marketing campaigns',
      active: true,
      properties: {
        designStyle: 'modern',
        colorPalette: 'brand',
        imageRatio: '1:1',
        includeText: true,
        textPlacement: 'center',
        outputFormats: ['png', 'jpg']
      }
    }
  },
  {
    type: 'videoGen',
    label: 'Video Generation Agent',
    emoji: '🎬',
    category: 'marketing',
    color: 'red',
    description: 'Generates or edits short videos, reels',
    tools: ['Descript API', 'Runway ML API', 'Lumen5', 'Pictory', 'ElevenLabs', 'Play.ht', 'Synthesia', 'HeyGen'],
    defaultConfig: {
      name: 'Video Content Creator',
      description: 'Generates or edits short videos and reels for marketing campaigns',
      active: true,
      properties: {
        videoDuration: '30 seconds',
        resolution: '1080p',
        aspectRatio: '9:16',
        includeSubtitles: true,
        includeVoiceover: true,
        voiceGender: 'female',
        musicType: 'upbeat'
      }
    }
  },
  {
    type: 'approval',
    label: 'Approval Agent',
    emoji: '✅',
    category: 'marketing',
    color: 'purple',
    description: 'Routes drafts for internal/client approval',
    tools: ['Slack API', 'Discord API', 'Gmail API', 'Notion', 'Trello', 'Airtable', 'Google Sheets'],
    defaultConfig: {
      name: 'Content Approval Manager',
      description: 'Routes drafts for internal and client approval',
      active: true,
      properties: {
        approvalWorkflow: 'sequential',
        approvers: ['internal-team', 'client'],
        notificationChannel: 'slack',
        reminderFrequency: '24 hours',
        autoApproveAfter: '72 hours'
      }
    }
  },
  {
    type: 'scheduler',
    label: 'Scheduler Agent',
    emoji: '📆',
    category: 'marketing',
    color: 'indigo',
    description: 'Schedules and posts content across platforms',
    tools: ['Buffer API', 'Hootsuite API', 'Meta Graph API', 'Twitter API', 'LinkedIn API', 'YouTube API', 'TikTok API'],
    defaultConfig: {
      name: 'Content Publishing Scheduler',
      description: 'Schedules and posts content across multiple platforms',
      active: true,
      properties: {
        platforms: ['instagram', 'facebook', 'twitter', 'linkedin'],
        postFrequency: 'optimal',
        timeZone: 'UTC',
        bestTimeToPost: true,
        recycleContent: false
      }
    }
  }
];

// Helper function to get agent by type
export function getAgentByType(type: AgentType): AgentDefinition | undefined {
  return marketingAgents.find(agent => agent.type === type);
}

// Helper function to get the appropriate color for an agent
export function getAgentColor(type: AgentType): string {
  const agent = getAgentByType(type);
  return agent ? agent.color : 'gray';
}

// Zod schema for agent configuration
export const agentConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  model: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
  apiKeys: z.record(z.string()).optional(),
  properties: z.record(z.any()).optional()
});

export type AgentConfigSchema = z.infer<typeof agentConfigSchema>;
