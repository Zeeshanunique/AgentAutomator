import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkflowSchema, insertApiKeySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { getAgents, getAgentById, createAgent, updateAgent, deleteAgent, saveAgentApiKey, createAgentTask, runAgent } from "./agents";
import { getConnections, createConnection, deleteConnection, updateWorkflowConnections } from "./connections";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for the workflow builder
  const apiRouter = express.Router();
  
  // Default user ID for demo/single user mode
  const DEFAULT_USER_ID = 1;

  // API key settings endpoint - store OpenAI API key in the database
  apiRouter.post("/settings/apikey", async (req, res) => {
    try {
      const { openai } = req.body;
      if (!openai) {
        return res.status(400).json({ message: "Invalid API key" });
      }
      
      // Check if we already have an OpenAI API key for this user
      const existingApiKey = await storage.getApiKey(DEFAULT_USER_ID, 'openai');
      
      if (existingApiKey) {
        // Update the existing key
        const updatedApiKey = await storage.updateApiKey(DEFAULT_USER_ID, 'openai', openai);
        return res.status(200).json({ message: "API key updated successfully" });
      } else {
        // Create a new key entry
        const apiKey = await storage.createApiKey({
          userId: DEFAULT_USER_ID,
          provider: 'openai',
          apiKey: openai
        });
        return res.status(201).json({ message: "API key saved successfully" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to save API key" });
    }
  });

  // Get current API key status (masked)
  apiRouter.get("/settings/apikey", async (req, res) => {
    try {
      const openaiApiKey = await storage.getApiKey(DEFAULT_USER_ID, 'openai');
      
      res.json({ 
        hasOpenAI: !!openaiApiKey
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API key status" });
    }
  });

  // Get API key (for internal use, returns the actual key)
  async function getStoredApiKey(provider: string): Promise<string | null> {
    try {
      const apiKeyRecord = await storage.getApiKey(DEFAULT_USER_ID, provider);
      return apiKeyRecord ? apiKeyRecord.apiKey : null;
    } catch (error) {
      console.error(`Error retrieving ${provider} API key:`, error);
      return null;
    }
  }

  // OpenAI completion endpoint (server-side proxy)
  apiRouter.post("/ai/completion", async (req, res) => {
    const openaiApiKey = await getStoredApiKey('openai');
    
    if (!openaiApiKey) {
      return res.status(400).json({ error: { message: "OpenAI API key not configured on server" } });
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.error });
      }
      
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message || "Failed to call OpenAI API" } });
    }
  });

  // OpenAI image generation endpoint (server-side proxy)
  apiRouter.post("/ai/image", async (req, res) => {
    const openaiApiKey = await getStoredApiKey('openai');
    
    if (!openaiApiKey) {
      return res.status(400).json({ error: { message: "OpenAI API key not configured on server" } });
    }

    try {
      const { prompt } = req.body;
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.error });
      }
      
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message || "Failed to call OpenAI API" } });
    }
  });
  
  // Get all workflows
  apiRouter.get("/workflows", async (req, res) => {
    try {
      const workflows = await storage.getAllWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });
  
  // Get a specific workflow
  apiRouter.get("/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }
      
      const workflow = await storage.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });
  
  // Create a new workflow
  apiRouter.post("/workflows", async (req, res) => {
    try {
      const validationResult = insertWorkflowSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const workflow = await storage.createWorkflow(validationResult.data);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(500).json({ message: "Failed to create workflow" });
    }
  });
  
  // Update an existing workflow
  apiRouter.put("/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }
      
      // Partial validation since we're allowing partial updates
      const workflow = await storage.updateWorkflow(id, req.body);
      
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workflow" });
    }
  });
  
  // Delete a workflow
  apiRouter.delete("/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }
      
      const success = await storage.deleteWorkflow(id);
      
      if (!success) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  });
  
  // Google Sheets Integration
  apiRouter.post("/integrations/google-sheets/fetch", async (req, res) => {
    try {
      const { sheetId, range } = req.body;
      
      // Validate required parameters
      if (!sheetId) {
        return res.status(400).json({ error: { message: "Missing sheet ID" } });
      }

      // For our demo, we'll return some sample data
      // In a real implementation, this would call the Google Sheets API
      const sampleData = [
        {
          name: "John Smith",
          company: "Acme Corp",
          email: "john.smith@acmecorp.com",
          phone: "555-123-4567",
          industry: "Technology",
          leadSource: "Website",
          leadScore: 85,
          lastContact: "2023-10-15"
        },
        {
          name: "Sarah Johnson",
          company: "Global Industries",
          email: "sarah.j@globalind.com",
          phone: "555-987-6543",
          industry: "Manufacturing",
          leadSource: "LinkedIn",
          leadScore: 72,
          lastContact: "2023-11-02"
        },
        {
          name: "Michael Chang",
          company: "Innovate Solutions",
          email: "mchang@innovatesol.com",
          phone: "555-111-2222",
          industry: "Technology",
          leadSource: "Referral",
          leadScore: 90,
          lastContact: "2023-11-10"
        },
        {
          name: "Emily Davis",
          company: "Summit Healthcare",
          email: "e.davis@summithc.org",
          phone: "555-444-5555",
          industry: "Healthcare",
          leadSource: "Trade Show",
          leadScore: 68,
          lastContact: "2023-10-28"
        },
        {
          name: "Robert Wilson",
          company: "Urban Financial",
          email: "rwilson@urbanfin.com",
          phone: "555-777-8888",
          industry: "Finance",
          leadSource: "Webinar",
          leadScore: 76,
          lastContact: "2023-11-05"
        }
      ];
      
      // Send sample data response
      res.json({ data: sampleData });
    } catch (error) {
      console.error("Google Sheets integration error:", error);
      res.status(500).json({ error: { message: "Failed to fetch data from Google Sheets" } });
    }
  });

  // Agent endpoints
  apiRouter.get("/agents", getAgents);
  apiRouter.get("/agents/:id", getAgentById);
  apiRouter.post("/agents", createAgent);
  apiRouter.put("/agents/:id", updateAgent);
  apiRouter.delete("/agents/:id", deleteAgent);
  apiRouter.post("/agents/api-keys", saveAgentApiKey);
  apiRouter.post("/agents/:id/run", runAgent);
  apiRouter.post("/agents/tasks", createAgentTask);
  
  // Connection endpoints
  apiRouter.get("/connections/:workflowId", getConnections);
  apiRouter.post("/connections", createConnection);
  apiRouter.delete("/connections/:id", deleteConnection);
  apiRouter.put("/connections/workflow/:workflowId", updateWorkflowConnections);

  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}

// Need to import express since it's used in the registerRoutes function
import express from "express";
