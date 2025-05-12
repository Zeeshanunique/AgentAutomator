import { db } from "./server/db";
import { users, workflows, apiKeys } from "./shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

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

    // Add initial user (if none exists)
    const users = await db.execute(/* sql */`SELECT * FROM users LIMIT 1`);
    if (users.rowCount === 0) {
      await db.execute(/* sql */`
        INSERT INTO users (username, password) 
        VALUES ('admin', 'password')
      `);
      console.log("Created default user");
    }

    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

runMigration().finally(() => {
  process.exit(0);
});