import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Workflow table to store workflow configurations
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: integer("user_id"),
});

// User table (simplified, used for reference with workflows)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// API Keys table to store user API keys for various services
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(), // e.g., 'openai', 'anthropic'
  apiKey: text("api_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define relationships between tables
export const relations = {
  users: {
    workflows: {
      one: users,
      many: workflows,
      relation: 'one-to-many',
      fields: [users.id],
      references: [workflows.userId],
    },
    apiKeys: {
      one: users,
      many: apiKeys,
      relation: 'one-to-many',
      fields: [users.id],
      references: [apiKeys.userId],
    },
  },
};

// Insert schemas
export const insertWorkflowSchema = createInsertSchema(workflows).pick({
  name: true,
  description: true,
  data: true,
  userId: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  userId: true,
  provider: true,
  apiKey: true,
});

// Types
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// Export agent schema
export * from "./agents";
