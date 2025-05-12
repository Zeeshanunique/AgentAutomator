import { useEffect, useState } from 'react';
import { useReactFlow, useViewport } from 'reactflow';
import { useWorkflowStore } from '@/lib/workflowStore';
import { getNodeColor } from '@/types/workflow';

/**
 * Custom MiniMap component that shows a simplified overview of the workflow canvas
 * and provides navigation capabilities
 */
export default function MiniMap() {
  const { nodes } = useWorkflowStore();
  const { transform } = useViewport();
  const { setViewport, getViewport, getNodes, fitView } = useReactFlow();
  const [isDragging, setIsDragging] = useState(false);
  
  // Get canvas dimensions to calculate viewport indicator
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
    scale: 1,
  });

  // Initialize canvas dimensions
  useEffect(() => {
    const reactFlowContainer = document.querySelector('.react-flow');
    if (reactFlowContainer) {
      const { width, height } = reactFlowContainer.getBoundingClientRect();
      setCanvasDimensions({
        width,
        height,
        scale: transform[2] || 1,
      });
    }
    
    // Update dimensions on resize
    const handleResize = () => {
      const reactFlowContainer = document.querySelector('.react-flow');
      if (reactFlowContainer) {
        const { width, height } = reactFlowContainer.getBoundingClientRect();
        setCanvasDimensions({
          width,
          height,
          scale: transform[2] || 1,
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [transform]);

  // Update minimap when viewport changes
  useEffect(() => {
    const onViewportChange = () => {
      const { x, y, zoom } = getViewport();
      setCanvasDimensions(prev => ({
        ...prev,
        scale: zoom,
      }));
    };
    
    // Add an event listener to the react-flow container
    const reactFlowContainer = document.querySelector('.react-flow');
    if (reactFlowContainer) {
      reactFlowContainer.addEventListener('wheel', onViewportChange);
      reactFlowContainer.addEventListener('mouseup', onViewportChange);
    }
    
    return () => {
      if (reactFlowContainer) {
        reactFlowContainer.removeEventListener('wheel', onViewportChange);
        reactFlowContainer.removeEventListener('mouseup', onViewportChange);
      }
    };
  }, [getViewport]);

  // Calculate minimap scale and dimensions
  const MINIMAP_WIDTH = 180;
  const MINIMAP_HEIGHT = 120;
  
  // Handle dragging the viewport indicator
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const minimap = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - minimap.left) / MINIMAP_WIDTH;
    const y = (e.clientY - minimap.top) / MINIMAP_HEIGHT;
    
    // Get the bounds of all nodes to calculate the total workflow area
    const allNodes = getNodes();
    if (allNodes.length === 0) return;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    allNodes.forEach(node => {
      const nodeWidth = node.width || 200;
      const nodeHeight = node.height || 100;
      
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });
    
    const workflowWidth = maxX - minX + 200; // Add some padding
    const workflowHeight = maxY - minY + 200;
    
    // Calculate the center position to set the viewport
    const centerX = minX + (workflowWidth * x) - (canvasDimensions.width / 2 / canvasDimensions.scale);
    const centerY = minY + (workflowHeight * y) - (canvasDimensions.height / 2 / canvasDimensions.scale);
    
    setViewport({ x: -centerX, y: -centerY, zoom: canvasDimensions.scale });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Cleanup mouse event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Calculate the visible viewport rectangle position based on current view
  const { x, y, zoom } = getViewport();
  
  // Check if we have valid dimensions
  if (canvasDimensions.width === 0 || canvasDimensions.height === 0) {
    return null;
  }

  return (
    <div 
      className="absolute bottom-4 right-4 w-[180px] h-[120px] bg-gray-900 border border-gray-700 rounded-md shadow-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="w-full h-full p-2 relative">
        <div 
          className="w-full h-full bg-gray-800 rounded cursor-move"
          onMouseDown={handleMouseDown}
        >
          {/* Render simplified node representations */}
          {nodes.map((node) => {
            const color = getNodeColor(node.type);
            
            // Calculate relative position within minimap
            const allNodes = getNodes();
            if (allNodes.length === 0) return null;
            
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            
            allNodes.forEach(n => {
              const nodeWidth = n.width || 200;
              const nodeHeight = n.height || 100;
              
              minX = Math.min(minX, n.position.x);
              minY = Math.min(minY, n.position.y);
              maxX = Math.max(maxX, n.position.x + nodeWidth);
              maxY = Math.max(maxY, n.position.y + nodeHeight);
            });
            
            const workflowWidth = maxX - minX + 200;
            const workflowHeight = maxY - minY + 200;
            
            const relX = (node.position.x - minX) / workflowWidth;
            const relY = (node.position.y - minY) / workflowHeight;
            
            return (
              <div
                key={node.id}
                className={`absolute w-1.5 h-3 rounded-sm bg-${color}`}
                style={{
                  left: `${relX * 100}%`,
                  top: `${relY * 100}%`,
                }}
              />
            );
          })}
          
          {/* Viewport indicator */}
          <div 
            className="absolute border-2 border-primary/50 rounded"
            style={{
              // Calculate position and size of the viewport indicator
              left: '0',
              top: '0',
              width: '100%',
              height: '100%',
              transform: `scale(${1/zoom})`,
              transformOrigin: '0 0',
            }}
          />
        </div>
      </div>
    </div>
  );
}
