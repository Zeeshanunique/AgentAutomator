import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Agents table to store different agent configurations
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // StrategyAgent, CopyGenAgent, DesignAgent, etc.
  description: text("description"),
  config: jsonb("config").notNull().default({}), // Store agent-specific configuration
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: integer("user_id"),
});

// Agent API Keys table to store API keys specific to agents
export const agentApiKeys = pgTable("agent_api_keys", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  service: text("service").notNull(), // OpenAI, Canva, Buffer, etc.
  apiKey: text("api_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Agent Workflows table to connect agents to workflows
export const agentWorkflows = pgTable("agent_workflows", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  workflowId: integer("workflow_id").notNull(),
  position: integer("position").notNull().default(0), // Order in the workflow
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Agent Tasks table to store tasks assigned to agents
export const agentTasks = pgTable("agent_tasks", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, in-progress, completed, failed
  input: jsonb("input").notNull().default({}),
  output: jsonb("output").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertAgentSchema = createInsertSchema(agents).pick({
  name: true,
  type: true,
  description: true,
  config: true,
  active: true,
  userId: true,
});

export const insertAgentApiKeySchema = createInsertSchema(agentApiKeys).pick({
  agentId: true,
  service: true,
  apiKey: true,
});

export const insertAgentWorkflowSchema = createInsertSchema(agentWorkflows).pick({
  agentId: true,
  workflowId: true,
  position: true,
});

export const insertAgentTaskSchema = createInsertSchema(agentTasks).pick({
  agentId: true,
  name: true,
  description: true,
  status: true,
  input: true,
});

// Types
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgentApiKey = z.infer<typeof insertAgentApiKeySchema>;
export type AgentApiKey = typeof agentApiKeys.$inferSelect;
export type InsertAgentWorkflow = z.infer<typeof insertAgentWorkflowSchema>;
export type AgentWorkflow = typeof agentWorkflows.$inferSelect;
export type InsertAgentTask = z.infer<typeof insertAgentTaskSchema>;
export type AgentTask = typeof agentTasks.$inferSelect;
