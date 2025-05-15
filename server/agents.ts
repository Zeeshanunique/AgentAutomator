import 'dotenv/config';
import { Request, Response } from 'express';
import { db } from './db';
import { agents, agentApiKeys, agentTasks } from '@shared/agents';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// OpenAI API client
import OpenAI from 'openai';

// Initialize OpenAI with environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get all agents
export async function getAgents(req: Request, res: Response) {
  try {
    const allAgents = await db.select().from(agents);
    res.json(allAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
}

// Get a specific agent by ID
export async function getAgentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const agent = await db.select().from(agents).where(eq(agents.id, parseInt(id))).limit(1);
    
    if (agent.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(agent[0]);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
}

// Create a new agent
export async function createAgent(req: Request, res: Response) {
  try {
    const { name, type, description, config } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    const newAgent = await db.insert(agents).values({
      name,
      type,
      description,
      config: config || {},
      active: true,
    }).returning();
    
    res.status(201).json(newAgent[0]);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
}

// Update an existing agent
export async function updateAgent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, config, active } = req.body;
    
    const updatedAgent = await db.update(agents)
      .set({ 
        name: name, 
        description: description, 
        config: config,
        active: active,
        updatedAt: new Date()
      })
      .where(eq(agents.id, parseInt(id)))
      .returning();
    
    if (updatedAgent.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(updatedAgent[0]);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
}

// Delete an agent
export async function deleteAgent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const deletedAgent = await db.delete(agents)
      .where(eq(agents.id, parseInt(id)))
      .returning();
    
    if (deletedAgent.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
}

// Save an API key for an agent
export async function saveAgentApiKey(req: Request, res: Response) {
  try {
    const { agentId, service, apiKey } = req.body;
    
    if (!agentId || !service || !apiKey) {
      return res.status(400).json({ error: 'Agent ID, service, and API key are required' });
    }
    
    // Check if API key already exists for this agent and service
    const existingKey = await db.select()
      .from(agentApiKeys)
      .where(
        eq(agentApiKeys.agentId, agentId) && 
        eq(agentApiKeys.service, service)
      )
      .limit(1);
    
    if (existingKey.length > 0) {
      // Update existing key
      const updatedKey = await db.update(agentApiKeys)
        .set({ 
          apiKey: apiKey,
          updatedAt: new Date()
        })
        .where(eq(agentApiKeys.id, existingKey[0].id))
        .returning();
      
      return res.json(updatedKey[0]);
    }
    
    // Create new key
    const newKey = await db.insert(agentApiKeys).values({
      agentId,
      service,
      apiKey,
    }).returning();
    
    res.status(201).json(newKey[0]);
  } catch (error) {
    console.error('Error saving API key:', error);
    res.status(500).json({ error: 'Failed to save API key' });
  }
}

// Create a new task for an agent
export async function createAgentTask(req: Request, res: Response) {
  try {
    const { agentId, name, description, input } = req.body;
    
    if (!agentId || !name) {
      return res.status(400).json({ error: 'Agent ID and name are required' });
    }
    
    const newTask = await db.insert(agentTasks).values({
      agentId,
      name,
      description,
      status: 'pending',
      input: input || {},
    }).returning();
    
    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

// Run a specific agent
export async function runAgent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { input } = req.body;
    
    // Get the agent
    const agent = await db.select().from(agents).where(eq(agents.id, parseInt(id))).limit(1);
    
    if (agent.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const agentData = agent[0];
    
    // Create a task for this run
    const taskId = nanoid();
    const task = await db.insert(agentTasks).values({
      agentId: agentData.id,
      name: `Run ${agentData.name}`,
      description: `Automatic run of ${agentData.name}`,
      status: 'in-progress',
      input: input || {},
    }).returning();
    
    // Based on agent type, execute the appropriate logic
    let result;
    
    switch (agentData.type) {
      case 'strategy':
        result = await runStrategyAgent(agentData, input);
        break;
      case 'copyGen':
        result = await runCopyGenAgent(agentData, input);
        break;
      case 'design':
        result = await runDesignAgent(agentData, input);
        break;
      case 'videoGen':
        result = await runVideoGenAgent(agentData, input);
        break;
      case 'approval':
        result = await runApprovalAgent(agentData, input);
        break;
      case 'scheduler':
        result = await runSchedulerAgent(agentData, input);
        break;
      default:
        return res.status(400).json({ error: 'Unknown agent type' });
    }
    
    // Update the task with the result
    await db.update(agentTasks)
      .set({ 
        status: 'completed',
        output: result,
        completedAt: new Date()
      })
      .where(eq(agentTasks.id, task[0].id));
    
    res.json({ 
      taskId: task[0].id,
      result 
    });
  } catch (error) {
    console.error('Error running agent:', error);
    res.status(500).json({ error: 'Failed to run agent' });
  }
}

// Run the Strategy Agent
async function runStrategyAgent(agent: any, input: any) {
  // In a real implementation, this would use the OpenAI API to generate a content strategy
  try {
    const completion = await openai.chat.completions.create({
      model: agent.config.model || "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a marketing strategy expert. Create a content strategy plan based on the provided information." 
        },
        { 
          role: "user", 
          content: `Create a content strategy for: ${input.topic || 'a technology company'}. 
                   Target audience: ${input.audience || 'professionals'}. 
                   Goals: ${input.goals || 'brand awareness, lead generation'}.` 
        }
      ],
      temperature: agent.config.temperature || 0.7,
      max_tokens: agent.config.maxTokens || 2048,
    });
    
    return {
      strategy: completion.choices[0].message.content,
      contentCalendar: generateSampleContentCalendar(),
      toneGuidelines: {
        primary: "Professional",
        secondary: "Friendly",
        avoid: "Overly technical jargon"
      }
    };
  } catch (error) {
    console.error('Error in strategy agent:', error);
    throw new Error('Failed to generate content strategy');
  }
}

// Run the Copy Generation Agent
async function runCopyGenAgent(agent: any, input: any) {
  // In a real implementation, this would use the OpenAI API to generate copy
  try {
    const completion = await openai.chat.completions.create({
      model: agent.config.model || "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are a copywriting expert. Generate engaging copy in a ${agent.config.properties?.toneOfVoice || 'professional'} tone.` 
        },
        { 
          role: "user", 
          content: `Create copy for: ${input.topic || 'a product announcement'}. 
                   Platform: ${input.platform || 'social media'}. 
                   Key points: ${input.keyPoints || 'innovative features, competitive pricing'}.` 
        }
      ],
      temperature: agent.config.temperature || 0.8,
      max_tokens: agent.config.maxTokens || 1024,
    });
    
    return {
      mainCopy: completion.choices[0].message.content,
      hashtags: generateSampleHashtags(input.topic || 'technology'),
      hooks: [
        "Discover how our new solution transforms your workflow",
        "Ready to boost productivity by 40%? Here's how...",
        "The wait is over: Introducing our game-changing platform"
      ]
    };
  } catch (error) {
    console.error('Error in copy generation agent:', error);
    throw new Error('Failed to generate copy');
  }
}

// Run the Design Agent
async function runDesignAgent(agent: any, input: any) {
  // In a real implementation, this would use DALL-E or another image generation API
  // For now, return mock data
  return {
    designUrl: "https://example.com/generated-design.png",
    variations: [
      "https://example.com/variation-1.png",
      "https://example.com/variation-2.png"
    ],
    dimensions: {
      width: 1200,
      height: 1200
    },
    format: "png"
  };
}

// Run the Video Generation Agent
async function runVideoGenAgent(agent: any, input: any) {
  // In a real implementation, this would use a video generation API
  // For now, return mock data
  return {
    videoUrl: "https://example.com/generated-video.mp4",
    thumbnailUrl: "https://example.com/thumbnail.jpg",
    duration: "00:30",
    resolution: "1080p",
    captions: true
  };
}

// Run the Approval Agent
async function runApprovalAgent(agent: any, input: any) {
  // In a real implementation, this would send notifications to approvers
  // For now, return mock data
  return {
    approvalId: nanoid(),
    status: "pending",
    sentTo: [
      { name: "Marketing Manager", email: "manager@example.com" },
      { name: "Client", email: "client@example.com" }
    ],
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    approvalUrl: "https://example.com/approve/abc123"
  };
}

// Run the Scheduler Agent
async function runSchedulerAgent(agent: any, input: any) {
  // In a real implementation, this would schedule posts via social media APIs
  // For now, return mock data
  return {
    scheduledPosts: [
      {
        platform: "Instagram",
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "scheduled"
      },
      {
        platform: "Twitter",
        scheduledTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        status: "scheduled"
      },
      {
        platform: "LinkedIn",
        scheduledTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        status: "scheduled"
      }
    ],
    optimizedTimes: true,
    analytics: {
      estimatedReach: 5000,
      bestPerformingPlatform: "LinkedIn"
    }
  };
}

// Helper function to generate a sample content calendar
function generateSampleContentCalendar() {
  const today = new Date();
  const calendar = [];
  
  for (let i = 1; i <= 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i * 2);
    
    calendar.push({
      date: date.toISOString().split('T')[0],
      contentType: i % 3 === 0 ? 'Blog Post' : i % 2 === 0 ? 'Social Media' : 'Video',
      topic: `Content item #${i}`,
      platform: i % 3 === 0 ? 'Website' : i % 2 === 0 ? 'Instagram' : 'YouTube',
      status: 'Planned'
    });
  }
  
  return calendar;
}

// Helper function to generate sample hashtags
function generateSampleHashtags(topic: string) {
  const baseHashtags = ['#Marketing', '#ContentStrategy', '#DigitalMarketing', '#SocialMedia'];
  const topicHashtags = [`#${topic.replace(/\s+/g, '')}`, `#${topic.replace(/\s+/g, '')}Tips`];
  
  return [...baseHashtags, ...topicHashtags];
}
