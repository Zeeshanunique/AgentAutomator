import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Panel,
  NodeDragHandler,
  Connection,
  EdgeChange,
  NodeChange,
  OnConnectStartParams,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/lib/workflowStore';
import ToolBar from './ToolBar';
import FloatingActions from './FloatingActions';
import { CustomNodes } from './NodeTypes';
import { getNodeColor } from '@/types/workflow';

export default function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    addNode,
    setSelectedNode,
    setShowPropertyPanel,
  } = useWorkflowStore();
  
  const connectingNodeId = useRef<string | null>(null);
  const connectingHandleId = useRef<string | null>(null);
  const connectingHandleType = useRef<'source' | 'target' | null>(null);
  
  const { project, screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const nodeDefinition = event.dataTransfer.getData('application/reactflow/nodeDefinition');
      
      // Check if the dropped element is valid
      if (!type || typeof type !== 'string') {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeDefinitionObj = JSON.parse(nodeDefinition);
      addNode(nodeDefinitionObj, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeDragStop: NodeDragHandler = useCallback((_, node) => {
    // When a node is dragged and stopped, update its position in the store
    // This is already handled by onNodesChange
  }, []);

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setShowPropertyPanel(true);
  }, [setSelectedNode, setShowPropertyPanel]);

  const onConnectStart = useCallback(
    (_: React.MouseEvent, { nodeId, handleId, handleType }: OnConnectStartParams) => {
      connectingNodeId.current = nodeId ?? null;
      connectingHandleId.current = handleId ?? null;
      connectingHandleType.current = handleType ?? null;
    },
    []
  );

  const onConnectEnd = useCallback(() => {
    connectingNodeId.current = null;
    connectingHandleId.current = null;
    connectingHandleType.current = null;
  }, []);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <ToolBar />
      
      <div className="flex-1 overflow-hidden bg-gray-800 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange as (changes: NodeChange[]) => void}
          onEdgesChange={onEdgesChange as (changes: EdgeChange[]) => void}
          onConnect={onConnect as (connection: Connection) => void}
          onNodeClick={handleNodeClick}
          onNodeDragStop={onNodeDragStop}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
          nodeTypes={CustomNodes}
          defaultEdgeOptions={{
            animated: true,
            style: {
              stroke: '#CBD5E1',
              strokeWidth: 2,
            },
          }}
        >
          <Background color="#CBD5E1" gap={16} size={1} className="grid-canvas" />
          <Controls className="bg-gray-900 border border-gray-700 rounded-md overflow-hidden" />
          <MiniMap
            nodeColor={(node) => {
              const color = getNodeColor(node.type);
              return color === 'primary' ? '#6366F1' :
                     color === 'secondary' ? '#EC4899' :
                     color === 'nodeGreen' ? '#34D399' :
                     color === 'nodeAmber' ? '#F59E0B' :
                     color === 'nodeBlue' ? '#3B82F6' : '#CBD5E1';
            }}
            className="bg-gray-900 border border-gray-700 rounded-md overflow-hidden"
            maskColor="rgba(31, 41, 55, 0.5)"
          />
          <Panel position="bottom-left">
            <FloatingActions />
          </Panel>
        </ReactFlow>
      </div>
    </main>
  );
}
