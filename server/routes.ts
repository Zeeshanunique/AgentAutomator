import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkflowSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for the workflow builder
  const apiRouter = express.Router();
  
  // API settings and keys
  let openaiApiKey: string | null = null;

  // API key settings endpoint
  apiRouter.post("/settings/apikey", async (req, res) => {
    try {
      const { openai } = req.body;
      if (openai) {
        openaiApiKey = openai;
        res.status(200).json({ message: "API key saved successfully" });
      } else {
        res.status(400).json({ message: "Invalid API key" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to save API key" });
    }
  });

  // Get current API key status (masked)
  apiRouter.get("/settings/apikey", async (req, res) => {
    try {
      res.json({ 
        hasOpenAI: !!openaiApiKey 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API key status" });
    }
  });

  // OpenAI completion endpoint (server-side proxy)
  apiRouter.post("/ai/completion", async (req, res) => {
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
  
  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}

// Need to import express since it's used in the registerRoutes function
import express from "express";
