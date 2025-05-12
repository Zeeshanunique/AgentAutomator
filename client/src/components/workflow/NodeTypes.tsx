import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { getNodeColor } from '@/types/workflow';
import { useWorkflowStore } from '@/lib/workflowStore';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Trash2, Copy, Edit, ExternalLink } from "lucide-react";

const NodeContent = ({ data, type, id }: { data: any, type: string, id: string }) => {
  const color = getNodeColor(type);
  const { setSelectedNode, setShowPropertyPanel } = useWorkflowStore();
  
  const handleEdit = () => {
    // Find the node in the store and set it as selected
    const nodes = useWorkflowStore.getState().nodes;
    const node = nodes.find((node: any) => node.id === id);
    if (node) {
      setSelectedNode(node);
      setShowPropertyPanel(true);
    }
  };
  
  const deleteNode = (nodeId: string) => {
    useWorkflowStore.getState().deleteNode(nodeId);
  };
  
  const duplicateNode = (nodeId: string) => {
    useWorkflowStore.getState().duplicateNode(nodeId);
  };
  
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-md shadow-lg w-full">
      {/* Node header */}
      <div className={`flex items-center justify-between p-3 border-b border-gray-700 bg-${color}/10`}>
        <div className="flex items-center">
          <div className={`w-2 h-6 bg-${color} rounded-sm mr-2.5`}></div>
          <span className="font-medium text-sm">{data.label}</span>
        </div>
        <div className="flex space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-white p-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-gray-200">
              <DropdownMenuItem 
                className="flex items-center hover:bg-gray-700"
                onClick={handleEdit}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center hover:bg-gray-700"
                onClick={() => duplicateNode && duplicateNode(id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center hover:bg-gray-700 text-red-400"
                onClick={() => deleteNode && deleteNode(id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Node body - content varies by node type */}
      <div className="p-3 text-sm">
        {type === 'gpt4' && (
          <>
            <div className="mb-3">
              <span className="text-gray-400 block mb-1.5">System Prompt</span>
              <div className="bg-gray-800 p-2 rounded font-mono text-xs h-20 overflow-y-auto">
                {data.systemPrompt || "You are a sales assistant. Analyze the lead data and generate a personalized outreach message."}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Temperature</span>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={data.temperature || 0.7} 
                  className="w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  readOnly
                />
                <span className="ml-2 font-mono text-xs">{data.temperature?.toFixed(1) || "0.7"}</span>
              </div>
            </div>
          </>
        )}
        
        {type === 'ad-generator' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Platform</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded capitalize">{data.platform || "Facebook"}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Ad Type</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded capitalize">{data.adType || "Image"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Audience</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded capitalize">{data.audience || "Professionals"}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-gray-400">Call to Action</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.cta || "Learn More"}</span>
            </div>
          </>
        )}
        
        {type === 'campaign-planner' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Campaign Type</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded capitalize">{data.campaignType?.replace('-', ' ') || "Product Launch"}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Duration</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.duration || "4 weeks"}</span>
            </div>
            <div className="mb-3">
              <span className="text-gray-400 block mb-1.5">Channels</span>
              <div className="flex flex-wrap gap-1">
                {(data.channels || ['email', 'social', 'paid-ads']).map((channel, index) => (
                  <span key={index} className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded capitalize">
                    {channel.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Budget</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">${data.budget || 5000}</span>
            </div>
          </>
        )}
        
        {type === 'content-writer' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Content Type</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded capitalize">{data.contentType?.replace('-', ' ') || "Blog Post"}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Tone</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded capitalize">{data.tone || "Professional"}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Word Count</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.targetWordCount || 1200}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Include Images</span>
              <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                data.includeImages !== false ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                {data.includeImages !== false ? 'Yes' : 'No'}
              </span>
            </div>
          </>
        )}

        {type === 'crm' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Source</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.source || "Salesforce"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Entity</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.entity || "Leads"}</span>
            </div>
          </>
        )}

        {type === 'email' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Template</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.template || "Outreach-B2B"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Send via</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.sendVia || "Marketing Cloud"}</span>
            </div>
          </>
        )}

        {type === 'filter' && (
          <>
            <div className="mb-3">
              <span className="text-gray-400 block mb-1.5">Condition</span>
              <div className="bg-gray-800 p-2 rounded font-mono text-xs">
                {data.condition || "leadScore > 70 && lastContact < 30 days"}
              </div>
            </div>
          </>
        )}

        {type === 'claude' && (
          <>
            <div className="mb-3">
              <span className="text-gray-400 block mb-1.5">System Prompt</span>
              <div className="bg-gray-800 p-2 rounded font-mono text-xs h-20 overflow-y-auto">
                {data.systemPrompt || "You are Claude, an AI assistant for sales. Help generate sales content."}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Temperature</span>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={data.temperature || 0.7} 
                  className="w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  readOnly
                />
                <span className="ml-2 font-mono text-xs">{data.temperature?.toFixed(1) || "0.7"}</span>
              </div>
            </div>
          </>
        )}

        {type === 'custom-llm' && (
          <>
            <div className="mb-3">
              <span className="text-gray-400 block mb-1.5">Model URL</span>
              <div className="bg-gray-800 p-2 rounded font-mono text-xs">
                {data.modelUrl || "https://api.company.ai/v1/models/sales-1"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">API Key</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">••••••••</span>
            </div>
          </>
        )}

        {type === 'cms' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">CMS Type</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.cmsType || "WordPress"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Content Type</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.contentType || "Blog Posts"}</span>
            </div>
          </>
        )}

        {type === 'database' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Database</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.database || "PostgreSQL"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Table</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.table || "customers"}</span>
            </div>
          </>
        )}

        {type === 'transform' && (
          <>
            <div className="mb-3">
              <span className="text-gray-400 block mb-1.5">Transformation</span>
              <div className="bg-gray-800 p-2 rounded font-mono text-xs">
                {data.transformation || "data => ({ ...data, score: data.score * 1.5 })"}
              </div>
            </div>
          </>
        )}

        {type === 'merge' && (
          <>
            <div className="mb-3">
              <span className="text-gray-400 block mb-1.5">Merge Strategy</span>
              <div className="bg-gray-800 p-2 rounded font-mono text-xs">
                {data.mergeStrategy || "combine"}
              </div>
            </div>
          </>
        )}

        {type === 'social' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Platform</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.platform || "LinkedIn"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Post Type</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.postType || "Article"}</span>
            </div>
          </>
        )}

        {type === 'webhook' && (
          <>
            <div className="mb-3">
              <span className="text-gray-400 block mb-1.5">Webhook URL</span>
              <div className="bg-gray-800 p-2 rounded font-mono text-xs">
                {data.webhookUrl || "https://example.com/webhook"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Method</span>
              <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{data.method || "POST"}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Generic node component that wraps all node types
const GenericNode = memo(({ data, type, id }: { data: any, type: string, id: string }) => {
  // Determine which handles to show based on node type
  const showInputHandle = !['crm', 'cms', 'database'].includes(type);
  const showOutputHandle = !['email', 'webhook', 'social'].includes(type);
  
  // Get the color for the handles
  const color = getNodeColor(type);
  const handleStyle = { borderColor: `var(--${color})` };
  
  return (
    <>
      {showInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={handleStyle}
          className="!w-6 !h-6 !-left-3 !transform !-translate-y-1/2 bg-gray-800 border-2 flex items-center justify-center"
        >
          <div className={`w-2 h-2 bg-${color} rounded-full`}></div>
        </Handle>
      )}
      
      <NodeContent data={data} type={type} id={id} />
      
      {showOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={handleStyle}
          className="!w-6 !h-6 !-right-3 !transform !-translate-y-1/2 bg-gray-800 border-2 flex items-center justify-center"
        >
          <div className={`w-2 h-2 bg-${color} rounded-full`}></div>
        </Handle>
      )}
    </>
  );
});

// Create a map of all custom node types
export const CustomNodes = {
  gpt4: (props: any) => <GenericNode {...props} id={props.id} type="gpt4" />,
  claude: (props: any) => <GenericNode {...props} id={props.id} type="claude" />,
  'custom-llm': (props: any) => <GenericNode {...props} id={props.id} type="custom-llm" />,
  'ad-generator': (props: any) => <GenericNode {...props} id={props.id} type="ad-generator" />,
  'campaign-planner': (props: any) => <GenericNode {...props} id={props.id} type="campaign-planner" />,
  'content-writer': (props: any) => <GenericNode {...props} id={props.id} type="content-writer" />,
  crm: (props: any) => <GenericNode {...props} id={props.id} type="crm" />,
  cms: (props: any) => <GenericNode {...props} id={props.id} type="cms" />,
  database: (props: any) => <GenericNode {...props} id={props.id} type="database" />,
  filter: (props: any) => <GenericNode {...props} id={props.id} type="filter" />,
  transform: (props: any) => <GenericNode {...props} id={props.id} type="transform" />,
  merge: (props: any) => <GenericNode {...props} id={props.id} type="merge" />,
  email: (props: any) => <GenericNode {...props} id={props.id} type="email" />,
  social: (props: any) => <GenericNode {...props} id={props.id} type="social" />,
  webhook: (props: any) => <GenericNode {...props} id={props.id} type="webhook" />,
};
