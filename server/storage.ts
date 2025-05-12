import { InsertWorkflow, InsertUser, User, Workflow } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workflows: Map<number, Workflow>;
  userCurrentId: number;
  workflowCurrentId: number;

  constructor() {
    this.users = new Map();
    this.workflows = new Map();
    this.userCurrentId = 1;
    this.workflowCurrentId = 1;
    
    // Add some example workflows
    this.createWorkflow({
      name: "Sales Outreach",
      description: "AI-powered sales outreach campaign with personalized messages",
      data: {
        nodes: [],
        edges: []
      }
    });
    
    this.createWorkflow({
      name: "Lead Qualification",
      description: "Automatically qualify and score leads based on CRM data",
      data: {
        nodes: [],
        edges: []
      }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Workflow methods
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }
  
  async getAllWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }
  
  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowCurrentId++;
    const now = new Date().toISOString();
    
    const workflow: Workflow = { 
      ...insertWorkflow, 
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.workflows.set(id, workflow);
    return workflow;
  }
  
  async updateWorkflow(id: number, data: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    
    if (!workflow) {
      return undefined;
    }
    
    const updatedWorkflow: Workflow = {
      ...workflow,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }
  
  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }
}

export const storage = new MemStorage();
