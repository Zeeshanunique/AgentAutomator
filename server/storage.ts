import { InsertWorkflow, InsertUser, User, Workflow, InsertApiKey, ApiKey, workflows, users, apiKeys } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workflow methods
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getAllWorkflows(): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, data: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  // API Key methods
  getApiKey(userId: number, provider: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(userId: number, provider: string, apiKey: string): Promise<ApiKey | undefined>;
  deleteApiKey(userId: number, provider: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Workflow methods
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow;
  }
  
  async getAllWorkflows(): Promise<Workflow[]> {
    return await db.select().from(workflows);
  }
  
  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db.insert(workflows).values(insertWorkflow).returning();
    return workflow;
  }
  
  async updateWorkflow(id: number, data: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const [updatedWorkflow] = await db
      .update(workflows)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workflows.id, id))
      .returning();
    
    return updatedWorkflow;
  }
  
  async deleteWorkflow(id: number): Promise<boolean> {
    await db.delete(workflows).where(eq(workflows.id, id));
    return true;
  }
  
  // API Key methods
  async getApiKey(userId: number, provider: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.userId, userId),
        eq(apiKeys.provider, provider)
      ));
    
    return apiKey;
  }
  
  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db
      .insert(apiKeys)
      .values(insertApiKey)
      .returning();
    
    return apiKey;
  }
  
  async updateApiKey(userId: number, provider: string, apiKeyValue: string): Promise<ApiKey | undefined> {
    const [updatedApiKey] = await db
      .update(apiKeys)
      .set({ 
        apiKey: apiKeyValue,
        updatedAt: new Date()
      })
      .where(and(
        eq(apiKeys.userId, userId),
        eq(apiKeys.provider, provider)
      ))
      .returning();
    
    return updatedApiKey;
  }
  
  async deleteApiKey(userId: number, provider: string): Promise<boolean> {
    await db
      .delete(apiKeys)
      .where(and(
        eq(apiKeys.userId, userId),
        eq(apiKeys.provider, provider)
      ));
    
    return true;
  }
}

// Initialize the database with sample data
async function initializeDatabase() {
  // Check if we have any workflows
  const existingWorkflows = await db.select().from(workflows);
  
  if (existingWorkflows.length === 0) {
    // Add sample workflows
    await db.insert(workflows).values([
      {
        name: "Sales Outreach",
        description: "AI-powered sales outreach campaign with personalized messages",
        data: {
          nodes: [],
          edges: []
        }
      },
      {
        name: "Lead Qualification",
        description: "Automatically qualify and score leads based on CRM data",
        data: {
          nodes: [],
          edges: []
        }
      }
    ]);
  }
}

// Initialize the database with sample data
initializeDatabase().catch(console.error);

export const storage = new DatabaseStorage();
