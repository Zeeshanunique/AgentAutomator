import { useState } from 'react';
import { useReactFlow } from 'reactflow';
import { ChevronLeft, ChevronRight, RotateCcw, Scissors, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflowStore } from '@/lib/workflowStore';
import { Separator } from '@/components/ui/separator';

export default function ToolBar() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [zoomLevel, setZoomLevel] = useState('100%');
  const { undoAction, redoAction, canUndo, canRedo, savedWorkflows } = useWorkflowStore();

  const handleZoomChange = (value: string) => {
    setZoomLevel(value);
    const zoomFactor = parseInt(value) / 100;
    const flow = document.querySelector('.react-flow');
    if (flow) {
      // @ts-ignore - reactflow doesn't expose setZoom directly
      flow.__rf?.setZoom(zoomFactor);
    }
  };

  const handleFitView = () => {
    fitView({ padding: 0.2 });
    // Update zoom level display after fitting
    setTimeout(() => {
      const flow = document.querySelector('.react-flow');
      if (flow && flow.__rf?.getZoom) {
        const currentZoom = Math.round(flow.__rf.getZoom() * 100);
        setZoomLevel(`${currentZoom}%`);
      }
    }, 100);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-2 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={undoAction}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={redoAction}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-gray-700" />

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {}}
            aria-label="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {}}
            aria-label="Cut connection"
          >
            <Scissors className="h-5 w-5" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-gray-700" />

        <Select value={zoomLevel} onValueChange={handleZoomChange}>
          <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700">
            <SelectValue placeholder="Zoom level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50%">50%</SelectItem>
            <SelectItem value="75%">75%</SelectItem>
            <SelectItem value="100%">100%</SelectItem>
            <SelectItem value="125%">125%</SelectItem>
            <SelectItem value="150%">150%</SelectItem>
            <SelectItem value="200%">200%</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-gray-800 rounded-md p-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={zoomOut}
            aria-label="Zoom out"
            className="text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </Button>
          <div className="flex items-center px-2 space-x-1">
            <span className="text-sm text-gray-300">{zoomLevel}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={zoomIn}
            aria-label="Zoom in"
            className="text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleFitView}
            aria-label="Fit view"
            className="text-gray-300"
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>

        <Button 
          className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 flex items-center" 
          onClick={() => window.alert('Workflow execution functionality would be implemented here')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Run Workflow
        </Button>
      </div>
    </div>
  );
}
