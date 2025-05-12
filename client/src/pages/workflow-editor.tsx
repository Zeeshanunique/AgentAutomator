import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import PropertyPanel from "@/components/layout/PropertyPanel";
import Canvas from "@/components/workflow/Canvas";
import { useWorkflowStore } from "@/lib/workflowStore";

export default function WorkflowEditor() {
  const { id } = useParams();
  const { 
    setWorkflowId, 
    workflowName, 
    setWorkflowName, 
    setWorkflowDescription, 
    showPropertyPanel, 
    setSidebarCollapsed,
    loadWorkflow
  } = useWorkflowStore();
  
  // Load workflow data if ID is provided
  const { data: workflow, isLoading } = useQuery({
    queryKey: id ? [`/api/workflows/${id}`] : null,
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      setWorkflowId(id);
    }

    // Reset the store on component unmount
    return () => {
      setSidebarCollapsed(false);
    };
  }, [id, setWorkflowId, setSidebarCollapsed]);

  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description);
      if (workflow.data) {
        loadWorkflow(workflow.data);
      }
    }
  }, [workflow, setWorkflowName, setWorkflowDescription, loadWorkflow]);

  if (isLoading && id) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
        <Header title="AI Agent Builder" workflowName={workflowName} user={{ initials: "JS" }} />
        
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          
          <Canvas />
          
          {showPropertyPanel && <PropertyPanel />}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
