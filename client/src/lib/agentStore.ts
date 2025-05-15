import { create } from 'zustand';
import { AgentType, AgentConfig, marketingAgents } from '@/types/agents';

interface AgentState {
  // Agent configurations
  agentConfigs: Record<AgentType, AgentConfig>;
  
  // Workflow state
  isRunning: boolean;
  currentStep: number | null;
  workflowResults: Record<string, any>;
  workflowComplete: boolean;
  
  // Actions
  setAgentConfig: (agentType: AgentType, config: AgentConfig) => void;
  toggleAgentActive: (agentType: AgentType, active: boolean) => void;
  startWorkflow: () => void;
  setCurrentStep: (step: number | null) => void;
  addWorkflowResult: (agentType: AgentType, result: any) => void;
  completeWorkflow: () => void;
  resetWorkflow: () => void;
}

// Initialize default configurations from the marketingAgents
const defaultConfigs: Record<AgentType, AgentConfig> = {} as Record<AgentType, AgentConfig>;
marketingAgents.forEach(agent => {
  if (agent.defaultConfig) {
    defaultConfigs[agent.type] = agent.defaultConfig;
  }
});

export const useAgentStore = create<AgentState>((set) => ({
  // Initial state
  agentConfigs: defaultConfigs,
  isRunning: false,
  currentStep: null,
  workflowResults: {},
  workflowComplete: false,
  
  // Actions
  setAgentConfig: (agentType, config) => set(state => ({
    agentConfigs: {
      ...state.agentConfigs,
      [agentType]: config
    }
  })),
  
  toggleAgentActive: (agentType, active) => set(state => ({
    agentConfigs: {
      ...state.agentConfigs,
      [agentType]: {
        ...state.agentConfigs[agentType],
        active
      }
    }
  })),
  
  startWorkflow: () => set({
    isRunning: true,
    workflowResults: {},
    workflowComplete: false,
    currentStep: null
  }),
  
  setCurrentStep: (step) => set({
    currentStep: step
  }),
  
  addWorkflowResult: (agentType, result) => set(state => ({
    workflowResults: {
      ...state.workflowResults,
      [agentType]: {
        ...result,
        timestamp: new Date().toISOString()
      }
    }
  })),
  
  completeWorkflow: () => set({
    isRunning: false,
    workflowComplete: true,
    currentStep: null
  }),
  
  resetWorkflow: () => set({
    isRunning: false,
    currentStep: null,
    workflowResults: {},
    workflowComplete: false
  })
}));
