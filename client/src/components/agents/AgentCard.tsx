import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Play, Edit } from "lucide-react";
import { AgentDefinition, AgentConfig } from '@/types/agents';

interface AgentCardProps {
  agent: AgentDefinition;
  config?: AgentConfig;
  onEdit: (agent: AgentDefinition) => void;
  onToggleActive: (agentType: string, active: boolean) => void;
  onRun: (agentType: string) => void;
}

export function AgentCard({ agent, config, onEdit, onToggleActive, onRun }: AgentCardProps) {
  const isActive = config?.active ?? agent.defaultConfig?.active ?? false;
  
  return (
    <Card className="bg-gray-900 border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">{agent.emoji}</span> {agent.label}
          </CardTitle>
          <Switch 
            checked={isActive} 
            onCheckedChange={(checked) => onToggleActive(agent.type, checked)}
            className={`data-[state=checked]:bg-${agent.color}-600`}
          />
        </div>
        <CardDescription className="text-gray-400">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Integrated Tools</h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.tools.slice(0, 3).map((tool, index) => (
                <Badge key={index} variant="outline" className="bg-gray-800 text-xs">
                  {tool}
                </Badge>
              ))}
              {agent.tools.length > 3 && (
                <Badge variant="outline" className="bg-gray-800 text-xs">
                  +{agent.tools.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          {config && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Configuration</h4>
              <p className="text-sm truncate">{config.name}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-300 border-gray-700 hover:bg-gray-800"
          onClick={() => onEdit(agent)}
        >
          <Settings className="mr-1 h-4 w-4" />
          Configure
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          className={`bg-${agent.color}-600 hover:bg-${agent.color}-700`}
          disabled={!isActive}
          onClick={() => onRun(agent.type)}
        >
          <Play className="mr-1 h-4 w-4" />
          Run
        </Button>
      </CardFooter>
    </Card>
  );
}
