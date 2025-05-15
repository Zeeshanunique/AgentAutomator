-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id INTEGER
);

-- Create agent_api_keys table
CREATE TABLE IF NOT EXISTS agent_api_keys (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL,
  service TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
);

-- Create agent_workflows table
CREATE TABLE IF NOT EXISTS agent_workflows (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL,
  workflow_id INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE,
  FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
);

-- Create agent_tasks table
CREATE TABLE IF NOT EXISTS agent_tasks (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents (type);
CREATE INDEX IF NOT EXISTS idx_agent_api_keys_agent_id ON agent_api_keys (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_agent_id ON agent_workflows (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_workflow_id ON agent_workflows (workflow_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks (status);
