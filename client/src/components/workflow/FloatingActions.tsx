import { Trash2, AlignCenter, LayoutGrid, PlusCircle, Group } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useWorkflowStore } from '@/lib/workflowStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function FloatingActions() {
  const { 
    deleteSelectedElements, 
    alignSelectedNodes, 
    hasSelectedElements,
    autoLayout
  } = useWorkflowStore();

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-md shadow-lg">
      <div className="p-2 flex space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-300 hover:text-white"
              aria-label="Add node"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add node</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-300 hover:text-white"
              onClick={deleteSelectedElements}
              disabled={!hasSelectedElements}
              aria-label="Delete selected"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected</p>
          </TooltipContent>
        </Tooltip>
          
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-300 hover:text-white"
              aria-label="Group nodes"
              disabled={!hasSelectedElements}
            >
              <Group className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Group nodes</p>
          </TooltipContent>
        </Tooltip>
        
        <Separator orientation="vertical" className="h-6 bg-gray-700 mx-1" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-300 hover:text-white"
              onClick={alignSelectedNodes}
              disabled={!hasSelectedElements}
              aria-label="Align nodes"
            >
              <AlignCenter className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Align nodes</p>
          </TooltipContent>
        </Tooltip>
          
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-300 hover:text-white"
              onClick={autoLayout}
              aria-label="Auto-layout"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Auto-layout</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
