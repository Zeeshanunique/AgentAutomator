import { db } from "./server/db";
import { users, workflows, apiKeys } from "./shared/schema";
import { agents, agentApiKeys, agentWorkflows, agentTasks } from "./shared/agents";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import fs from 'fs';
import path from 'path';

// We need to run the migrations
async function runMigration() {
  console.log("Running migrations...");
  try {
    // Create the necessary tables
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS workflows (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        user_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        provider TEXT NOT NULL,
        api_key TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Run agent tables migration from SQL file
    const agentMigrationPath = path.join(process.cwd(), 'migrations', '01_create_agent_tables.sql');
    if (fs.existsSync(agentMigrationPath)) {
      const agentMigrationSQL = fs.readFileSync(agentMigrationPath, 'utf8');
      await db.execute(agentMigrationSQL);
      console.log("Applied agent tables migration");
    } else {
      console.warn("Agent migration file not found at:", agentMigrationPath);
    }

    // Add initial user (if none exists)
    const users = await db.execute(/* sql */`SELECT * FROM users LIMIT 1`);
    if (users.rowCount === 0) {
      await db.execute(/* sql */`
        INSERT INTO users (username, password) 
        VALUES ('admin', 'password')
      `);
      console.log("Created default user");
    }
    
    // Add initial marketing agents (if none exist)
    const existingAgents = await db.execute(/* sql */`SELECT * FROM agents LIMIT 1`);
    if (existingAgents.rowCount === 0) {
      // Insert the six marketing agents
      await db.execute(/* sql */`
        INSERT INTO agents (name, type, description, config, active) VALUES 
        ('Content Strategy Planner', 'strategy', 'Plans content strategy, tone, and calendar', '{"model":"gpt-4","temperature":0.7,"maxTokens":2048,"properties":{"planningHorizon":"3 months","contentTypes":["blog","social","email","video"],"targetAudience":"professionals","contentGoals":["engagement","conversion","brand awareness"]}}', true),
        ('Content Copy Generator', 'copyGen', 'Generates captions, hooks, and hashtags', '{"model":"gpt-4","temperature":0.8,"maxTokens":1024,"properties":{"toneOfVoice":"professional","contentLength":"medium","includeHashtags":true,"hashtagCount":5,"includeEmojis":true}}', true),
        ('Visual Content Designer', 'design', 'Creates static visuals, carousels, and memes', '{"properties":{"designStyle":"modern","colorPalette":"brand","imageRatio":"1:1","includeText":true,"textPlacement":"center","outputFormats":["png","jpg"]}}', true),
        ('Video Content Creator', 'videoGen', 'Generates or edits short videos and reels', '{"properties":{"videoDuration":"30 seconds","resolution":"1080p","aspectRatio":"9:16","includeSubtitles":true,"includeVoiceover":true,"voiceGender":"female","musicType":"upbeat"}}', true),
        ('Content Approval Manager', 'approval', 'Routes drafts for internal and client approval', '{"properties":{"approvalWorkflow":"sequential","approvers":["internal-team","client"],"notificationChannel":"slack","reminderFrequency":"24 hours","autoApproveAfter":"72 hours"}}', true),
        ('Content Publishing Scheduler', 'scheduler', 'Schedules and posts content across platforms', '{"properties":{"platforms":["instagram","facebook","twitter","linkedin"],"postFrequency":"optimal","timeZone":"UTC","bestTimeToPost":true,"recycleContent":false}}', true)
      `);
      console.log("Created default marketing agents");
    }

    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

runMigration().finally(() => {
  process.exit(0);
});