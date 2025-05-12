import { create } from 'zustand';
import { 
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges,
  XYPosition
} from 'reactflow';
import { produce } from 'immer';
import { NodeDefinition, NodeData, WorkflowData } from '@/types/workflow';
import { nanoid } from 'nanoid';

interface WorkflowState {
  // Workflow management
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  
  // Canvas state
  nodes: Node[];
  edges: Edge[];
  
  // UI state
  isSidebarCollapsed: boolean;
  showPropertyPanel: boolean;
  selectedNode: Node | null;
  undoStack: WorkflowData[];
  redoStack: WorkflowData[];
  savedWorkflows: string[];
  
  // Properties for state management
  canUndo: boolean;
  canRedo: boolean;
  hasSelectedElements: boolean;
  
  // Methods for workflow management
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string) => void;
  loadWorkflow: (workflow: WorkflowData) => void;
  getWorkflowData: () => WorkflowData;
  
  // Methods for node management
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  addNode: (nodeDefinition: NodeDefinition, position: XYPosition) => void;
  updateNodeData: (nodeId: string, data: NodeData) => void;
  deleteSelectedElements: () => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  
  // Methods for UI state management
  setSidebarCollapsed: (collapsed: boolean) => void;
  setShowPropertyPanel: (show: boolean) => void;
  setSelectedNode: (node: Node | null) => void;
  
  // Methods for drag and drop
  onDragStart: (event: React.DragEvent, nodeDefinition: NodeDefinition) => void;
  
  // Methods for layout
  alignSelectedNodes: () => void;
  autoLayout: () => void;
  
  // Methods for undo/redo
  saveState: () => void;
  undoAction: () => void;
  redoAction: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Workflow management state
  workflowId: null,
  workflowName: 'Untitled Workflow',
  workflowDescription: '',
  
  // Canvas state
  nodes: [],
  edges: [],
  
  // UI state
  isSidebarCollapsed: false,
  showPropertyPanel: false,
  selectedNode: null,
  undoStack: [],
  redoStack: [],
  savedWorkflows: [],
  
  // Computed properties
  get canUndo() {
    return get().undoStack.length > 0;
  },
  get canRedo() {
    return get().redoStack.length > 0;
  },
  get hasSelectedElements() {
    return get().nodes.some(node => node.selected) || get().edges.some(edge => edge.selected);
  },
  
  // Methods for workflow management
  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),
  setWorkflowDescription: (description) => set({ workflowDescription: description }),
  
  loadWorkflow: (workflow) => {
    set({
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      undoStack: [],
      redoStack: []
    });
  },
  
  getWorkflowData: () => ({
    nodes: get().nodes,
    edges: get().edges
  }),
  
  // Methods for node management
  onNodesChange: (changes) => {
    const { saveState } = get();
    saveState();
    
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes) => {
    const { saveState } = get();
    saveState();
    
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection) => {
    const { saveState } = get();
    saveState();
    
    set({
      edges: addEdge({
        ...connection,
        type: 'default',
        animated: true,
        style: { stroke: '#CBD5E1', strokeWidth: 2 }
      }, get().edges),
    });
  },
  
  onNodeClick: (_, node) => {
    set({
      selectedNode: node,
      showPropertyPanel: true,
    });
  },
  
  addNode: (nodeDefinition, position) => {
    const { saveState } = get();
    saveState();
    
    const newNode: Node = {
      id: `${nodeDefinition.type}-${nanoid(6)}`,
      type: nodeDefinition.type,
      position,
      data: {
        ...nodeDefinition.defaultData
      },
    };
    
    set({
      nodes: [...get().nodes, newNode]
    });
  },
  
  updateNodeData: (nodeId, data) => {
    const { saveState } = get();
    saveState();
    
    set({
      nodes: get().nodes.map(node => 
        node.id === nodeId ? { ...node, data } : node
      ),
      selectedNode: get().selectedNode?.id === nodeId 
        ? { ...get().selectedNode, data } 
        : get().selectedNode
    });
  },
  
  deleteSelectedElements: () => {
    const { saveState } = get();
    saveState();
    
    set({
      nodes: get().nodes.filter(node => !node.selected),
      edges: get().edges.filter(edge => !edge.selected)
    });
  },
  
  deleteNode: (nodeId: string) => {
    const { saveState } = get();
    saveState();
    
    // Remove the node
    set({
      nodes: get().nodes.filter(node => node.id !== nodeId),
      // Also remove any connected edges
      edges: get().edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      )
    });
  },
  
  duplicateNode: (nodeId: string) => {
    const { saveState } = get();
    saveState();
    
    const sourceNode = get().nodes.find(node => node.id === nodeId);
    if (!sourceNode) return;
    
    // Create a new node based on the source node
    const newNode: Node = {
      id: `${sourceNode.type}-${nanoid(6)}`,
      type: sourceNode.type,
      position: {
        x: sourceNode.position.x + 50,
        y: sourceNode.position.y + 50
      },
      data: { ...sourceNode.data }
    };
    
    set({
      nodes: [...get().nodes, newNode]
    });
  },
  
  // Methods for UI state management
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setShowPropertyPanel: (show) => set({ showPropertyPanel: show }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  // Methods for drag and drop
  onDragStart: (event, nodeDefinition) => {
    // Store node type and data in the drag event
    event.dataTransfer.setData('application/reactflow/type', nodeDefinition.type);
    event.dataTransfer.setData('application/reactflow/nodeDefinition', JSON.stringify(nodeDefinition));
    event.dataTransfer.effectAllowed = 'move';
  },
  
  // Methods for layout
  alignSelectedNodes: () => {
    const selectedNodes = get().nodes.filter(node => node.selected);
    if (selectedNodes.length <= 1) return;
    
    const { saveState } = get();
    saveState();
    
    // Find average X position
    const avgX = selectedNodes.reduce((sum, node) => sum + node.position.x, 0) / selectedNodes.length;
    
    set({
      nodes: get().nodes.map(node => {
        if (node.selected) {
          return {
            ...node,
            position: {
              ...node.position,
              x: avgX
            }
          };
        }
        return node;
      })
    });
  },
  
  autoLayout: () => {
    const { saveState } = get();
    saveState();
    
    // Simple horizontal layout - more complex layouts would be implemented here
    const nodes = [...get().nodes];
    const edges = [...get().edges];
    
    // Group nodes by their type to create "layers"
    const typeToLayer: Record<string, number> = {
      crm: 0,
      cms: 0,
      database: 0,
      filter: 1,
      transform: 1,
      merge: 1,
      gpt4: 2,
      claude: 2,
      'custom-llm': 2,
      email: 3,
      social: 3,
      webhook: 3
    };
    
    // Group nodes by layer
    const layers: Node[][] = [[], [], [], []];
    nodes.forEach(node => {
      const layer = typeToLayer[node.type] || 0;
      layers[layer].push(node);
    });
    
    // Position nodes in each layer
    const layerWidth = 320; // horizontal spacing between layers
    const nodeHeight = 200; // approximate height of nodes
    const nodeSpacing = 50; // vertical spacing between nodes
    
    layers.forEach((layerNodes, layerIndex) => {
      layerNodes.forEach((node, nodeIndex) => {
        node.position = {
          x: layerIndex * layerWidth + 100,
          y: nodeIndex * (nodeHeight + nodeSpacing) + 100
        };
      });
    });
    
    set({ nodes, edges });
  },
  
  // Methods for undo/redo
  saveState: () => {
    // Save current state to undo stack
    const currentState: WorkflowData = {
      nodes: JSON.parse(JSON.stringify(get().nodes)),
      edges: JSON.parse(JSON.stringify(get().edges))
    };
    
    set({
      undoStack: [...get().undoStack, currentState],
      redoStack: [] // Clear redo stack on new action
    });
  },
  
  undoAction: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    
    // Save current state to redo stack
    const currentState: WorkflowData = {
      nodes: get().nodes,
      edges: get().edges
    };
    
    // Pop the last state from the undo stack
    const newUndoStack = [...undoStack];
    const prevState = newUndoStack.pop();
    
    if (prevState) {
      set({
        nodes: prevState.nodes,
        edges: prevState.edges,
        undoStack: newUndoStack,
        redoStack: [...get().redoStack, currentState]
      });
    }
  },
  
  redoAction: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;
    
    // Save current state to undo stack
    const currentState: WorkflowData = {
      nodes: get().nodes,
      edges: get().edges
    };
    
    // Pop the last state from the redo stack
    const newRedoStack = [...redoStack];
    const nextState = newRedoStack.pop();
    
    if (nextState) {
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        undoStack: [...get().undoStack, currentState],
        redoStack: newRedoStack
      });
    }
  }
}));
