import React, { useState, useEffect } from 'react';
import { AgentCard } from './AgentCard';
import { marketingAgents, AgentDefinition, AgentConfig, AgentType } from '@/types/agents';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, ArrowRight, Check, Play, Save, X, Link2Off, Trash2, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MarketingWorkflow() {
  // State for agent connections
  const [connections, setConnections] = useState<boolean[]>([true, true, true, true, true]);
  
  // State for agent configurations
  const [agentConfigs, setAgentConfigs] = useState<Record<AgentType, AgentConfig>>({
    strategy: marketingAgents[0].defaultConfig!,
    copyGen: marketingAgents[1].defaultConfig!,
    design: marketingAgents[2].defaultConfig!,
    videoGen: marketingAgents[3].defaultConfig!,
    approval: marketingAgents[4].defaultConfig!,
    scheduler: marketingAgents[5].defaultConfig!
  });
  
  // State for agent configuration dialog
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [editedConfig, setEditedConfig] = useState<AgentConfig | null>(null);
  
  // State for workflow execution
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [workflowResults, setWorkflowResults] = useState<Record<string, any>>({});
  const [workflowComplete, setWorkflowComplete] = useState(false);
  const [executionPath, setExecutionPath] = useState<number[]>([]);
  
  // Handle opening the configuration dialog
  const handleEditAgent = (agent: AgentDefinition) => {
    setSelectedAgent(agent);
    setEditedConfig({...agentConfigs[agent.type]});
    setConfigDialogOpen(true);
  };
  
  // Handle saving agent configuration
  const handleSaveConfig = () => {
    if (selectedAgent && editedConfig) {
      setAgentConfigs(prev => ({
        ...prev,
        [selectedAgent.type]: editedConfig
      }));
      setConfigDialogOpen(false);
    }
  };
  
  // Handle toggling agent active state
  const handleToggleActive = (agentType: string, active: boolean) => {
    setAgentConfigs(prev => ({
      ...prev,
      [agentType as AgentType]: {
        ...prev[agentType as AgentType],
        active
      }
    }));
  };
  
  // Handle running a single agent
  const handleRunAgent = (agentType: string) => {
    // In a real implementation, this would call the agent's API
    alert(`Running ${agentType} agent`);
  };
  
  // Handle toggling a connection between agents
  const toggleConnection = (index: number) => {
    setConnections(prev => {
      const newConnections = [...prev];
      newConnections[index] = !newConnections[index];
      return newConnections;
    });
  };

  // Calculate the execution path based on active agents and connections
  const calculateExecutionPath = () => {
    const path: number[] = [];
    const activeAgentTypes: AgentType[] = [];
    
    // Get all active agents
    const allAgents = marketingAgents
      .filter(agent => agentConfigs[agent.type].active)
      .map((agent, index) => ({ type: agent.type, index }));
    
    // Start with the first agent if active
    if (allAgents.length > 0) {
      path.push(allAgents[0].index);
      activeAgentTypes.push(allAgents[0].type);
      
      // Add subsequent agents only if the connection is active
      for (let i = 1; i < allAgents.length; i++) {
        const prevAgentIndex = marketingAgents.findIndex(a => a.type === allAgents[i-1].type);
        if (connections[prevAgentIndex]) {
          path.push(allAgents[i].index);
          activeAgentTypes.push(allAgents[i].type);
        }
      }
    }
    
    return { path, activeAgentTypes };
  };

  // Handle running the full workflow
  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setWorkflowResults({});
    setWorkflowComplete(false);
    
    // Calculate execution path
    const { path, activeAgentTypes } = calculateExecutionPath();
    setExecutionPath(path);
    
    // Simulate workflow execution
    for (let i = 0; i < activeAgentTypes.length; i++) {
      const agentType = activeAgentTypes[i];
      const originalIndex = marketingAgents.findIndex(a => a.type === agentType);
      setCurrentStep(originalIndex);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add simulated result
      setWorkflowResults(prev => ({
        ...prev,
        [agentType]: {
          success: true,
          timestamp: new Date().toISOString(),
          output: `Sample output from ${agentType} agent`
        }
      }));
    }
    
    setCurrentStep(null);
    setWorkflowComplete(true);
    setIsRunning(false);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Marketing Content Workflow</h1>
          <p className="text-gray-400">Create and publish marketing content using AI agents</p>
        </div>
        <Button 
          onClick={handleRunWorkflow} 
          disabled={isRunning}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isRunning ? (
            <>Running Workflow...</>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Complete Workflow
            </>
          )}
        </Button>
      </div>
      
      {workflowComplete && (
        <Alert className="mb-6 bg-green-900/20 border-green-800">
          <Check className="h-4 w-4 text-green-400" />
          <AlertTitle>Workflow Complete</AlertTitle>
          <AlertDescription>
            All agents have successfully completed their tasks.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketingAgents.map((agent, index) => (
          <div 
            key={agent.type} 
            className={`${currentStep === index ? "ring-2 ring-blue-500" : ""} 
                       ${executionPath.includes(index) ? "bg-gray-800/50" : ""} 
                       rounded-lg transition-all duration-200`}
          >
            <AgentCard 
              agent={agent}
              config={agentConfigs[agent.type]}
              onEdit={handleEditAgent}
              onToggleActive={handleToggleActive}
              onRun={handleRunAgent}
            />
            {index < marketingAgents.length - 1 && (
              <div className="flex justify-center my-2 items-center relative">
                {connections[index] ? (
                  <div className="group">
                    <div className="flex items-center relative">
                      {/* Connection line */}
                      <div 
                        className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-gray-700 to-blue-500 transform -translate-y-1/2 group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          toggleConnection(index);
                          // Recalculate execution path after toggling
                          setTimeout(() => {
                            const { path } = calculateExecutionPath();
                            setExecutionPath(path);
                          }, 0);
                        }}
                      ></div>
                      
                      {/* Arrow */}
                      <ArrowRight 
                        className={`h-6 w-6 z-10 ${executionPath.includes(index) && executionPath.includes(index+1) ? 'text-blue-500' : 'text-gray-700'} group-hover:text-blue-500 transition-colors duration-200`} 
                      />
                      
                      {/* Delete button that appears on hover */}
                      <div 
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                        onClick={() => {
                          toggleConnection(index);
                          // Recalculate execution path after toggling
                          setTimeout(() => {
                            const { path } = calculateExecutionPath();
                            setExecutionPath(path);
                          }, 0);
                        }}
                      >
                        <div className="bg-red-600 rounded-full p-1 shadow-lg cursor-pointer hover:bg-red-700 transition-colors">
                          <Trash2 className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      toggleConnection(index);
                      // Recalculate execution path after toggling
                      setTimeout(() => {
                        const { path } = calculateExecutionPath();
                        setExecutionPath(path);
                      }, 0);
                    }}
                    className="w-full h-px bg-gray-800 hover:bg-gray-600 cursor-pointer relative flex items-center justify-center transition-all duration-200"
                  >
                    <div className="absolute bg-gray-900 rounded-full p-1 hover:bg-gray-800">
                      <Plus className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Agent Configuration Dialog */}
      {selectedAgent && (
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedAgent.emoji}</span> 
                Configure {selectedAgent.label}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Customize how this agent operates in your workflow
              </DialogDescription>
            </DialogHeader>
            
            {editedConfig && (
              <Tabs defaultValue="general" className="mt-4">
                <TabsList className="bg-gray-800">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="ai">AI Settings</TabsTrigger>
                  <TabsTrigger value="api">API Keys</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name</Label>
                    <Input 
                      id="name" 
                      value={editedConfig.name} 
                      onChange={(e) => setEditedConfig({...editedConfig, name: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={editedConfig.description || ''} 
                      onChange={(e) => setEditedConfig({...editedConfig, description: e.target.value})}
                      className="bg-gray-800 border-gray-700 min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Active in Workflow</Label>
                    <Switch 
                      id="active" 
                      checked={editedConfig.active} 
                      onCheckedChange={(checked) => setEditedConfig({...editedConfig, active: checked})}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="ai" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <Select 
                      value={editedConfig.model || 'gpt-4'} 
                      onValueChange={(value) => setEditedConfig({...editedConfig, model: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="temperature">Temperature: {editedConfig.temperature?.toFixed(1) || '0.7'}</Label>
                    </div>
                    <Slider 
                      id="temperature"
                      min={0} 
                      max={1} 
                      step={0.1}
                      value={[editedConfig.temperature || 0.7]} 
                      onValueChange={(value) => setEditedConfig({...editedConfig, temperature: value[0]})}
                      className="py-4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input 
                      id="maxTokens" 
                      type="number"
                      value={editedConfig.maxTokens || 2048} 
                      onChange={(e) => setEditedConfig({...editedConfig, maxTokens: parseInt(e.target.value)})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="api" className="space-y-4 mt-4">
                  {selectedAgent.tools.map((tool, index) => {
                    const apiKeyName = tool.toLowerCase().replace(/\s+/g, '_');
                    return (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={apiKeyName}>{tool} API Key</Label>
                        <Input 
                          id={apiKeyName} 
                          type="password"
                          value={editedConfig.apiKeys?.[apiKeyName] || ''} 
                          onChange={(e) => setEditedConfig({
                            ...editedConfig, 
                            apiKeys: {...(editedConfig.apiKeys || {}), [apiKeyName]: e.target.value}
                          })}
                          className="bg-gray-800 border-gray-700"
                          placeholder={`Enter your ${tool} API key`}
                        />
                      </div>
                    );
                  })}
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 mt-4">
                  {/* Agent-specific properties */}
                  {selectedAgent.type === 'strategy' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="planningHorizon">Planning Horizon</Label>
                        <Select 
                          value={editedConfig.properties?.planningHorizon || '3 months'} 
                          onValueChange={(value) => setEditedConfig({
                            ...editedConfig, 
                            properties: {...(editedConfig.properties || {}), planningHorizon: value}
                          })}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Select planning horizon" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="1 month">1 Month</SelectItem>
                            <SelectItem value="3 months">3 Months</SelectItem>
                            <SelectItem value="6 months">6 Months</SelectItem>
                            <SelectItem value="1 year">1 Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {selectedAgent.type === 'copyGen' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="toneOfVoice">Tone of Voice</Label>
                        <Select 
                          value={editedConfig.properties?.toneOfVoice || 'professional'} 
                          onValueChange={(value) => setEditedConfig({
                            ...editedConfig, 
                            properties: {...(editedConfig.properties || {}), toneOfVoice: value}
                          })}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="humorous">Humorous</SelectItem>
                            <SelectItem value="authoritative">Authoritative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {/* Add more agent-specific properties here */}
                </TabsContent>
              </Tabs>
            )}
            
            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setConfigDialogOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveConfig}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
