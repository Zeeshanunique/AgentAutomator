import { Request, Response } from 'express';
import { db } from './db';
import { agentWorkflows } from '@shared/agents';
import { eq, and } from 'drizzle-orm';

// Get all connections between agents in a workflow
export async function getConnections(req: Request, res: Response) {
  try {
    const { workflowId } = req.params;
    
    if (!workflowId) {
      return res.status(400).json({ error: 'Workflow ID is required' });
    }
    
    const connections = await db.select()
      .from(agentWorkflows)
      .where(eq(agentWorkflows.workflowId, parseInt(workflowId)))
      .orderBy(agentWorkflows.position);
    
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
}

// Create a connection between agents
export async function createConnection(req: Request, res: Response) {
  try {
    const { sourceAgentId, targetAgentId, workflowId, position } = req.body;
    
    if (!sourceAgentId || !targetAgentId || !workflowId) {
      return res.status(400).json({ error: 'Source agent ID, target agent ID, and workflow ID are required' });
    }
    
    // Check if connection already exists
    const existingConnection = await db.select()
      .from(agentWorkflows)
      .where(
        and(
          eq(agentWorkflows.agentId, sourceAgentId),
          eq(agentWorkflows.workflowId, workflowId),
          eq(agentWorkflows.position, position || 0)
        )
      );
    
    if (existingConnection.length > 0) {
      return res.status(400).json({ error: 'Connection already exists' });
    }
    
    // Create the connection
    const newConnection = await db.insert(agentWorkflows)
      .values({
        agentId: sourceAgentId,
        workflowId: parseInt(workflowId),
        position: position || 0
      })
      .returning();
    
    res.status(201).json(newConnection[0]);
  } catch (error) {
    console.error('Error creating connection:', error);
    res.status(500).json({ error: 'Failed to create connection' });
  }
}

// Delete a connection between agents
export async function deleteConnection(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Connection ID is required' });
    }
    
    // Delete the connection
    const deletedConnection = await db.delete(agentWorkflows)
      .where(eq(agentWorkflows.id, parseInt(id)))
      .returning();
    
    if (deletedConnection.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
}

// Update the connections for a workflow
export async function updateWorkflowConnections(req: Request, res: Response) {
  try {
    const { workflowId } = req.params;
    const { connections } = req.body;
    
    if (!workflowId || !connections || !Array.isArray(connections)) {
      return res.status(400).json({ error: 'Workflow ID and connections array are required' });
    }
    
    // Begin a transaction
    const result = await db.transaction(async (tx) => {
      // Delete existing connections for this workflow
      await tx.delete(agentWorkflows)
        .where(eq(agentWorkflows.workflowId, parseInt(workflowId)));
      
      // Insert new connections
      const newConnections = [];
      for (const connection of connections) {
        const { sourceAgentId, targetAgentId, position } = connection;
        
        if (!sourceAgentId || !targetAgentId) {
          throw new Error('Source agent ID and target agent ID are required for each connection');
        }
        
        const inserted = await tx.insert(agentWorkflows)
          .values({
            agentId: sourceAgentId,
            workflowId: parseInt(workflowId),
            position: position || 0
          })
          .returning();
        
        newConnections.push(inserted[0]);
      }
      
      return newConnections;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error updating workflow connections:', error);
    res.status(500).json({ error: 'Failed to update workflow connections' });
  }
}
