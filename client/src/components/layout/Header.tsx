import { useState } from "react";
import { Link } from "wouter";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWorkflowStore } from "@/lib/workflowStore";
import { Moon, Sun, HelpCircle, SaveAll, Settings } from "lucide-react";
import ApiKeyDialog from "@/components/settings/ApiKeyDialog";

type HeaderProps = {
  title: string;
  workflowName?: string;
  user: {
    initials: string;
  };
  showSaveButton?: boolean;
};

export default function Header({ title, workflowName, user, showSaveButton = true }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    workflowId, 
    workflowName: storeWorkflowName, 
    getWorkflowData 
  } = useWorkflowStore();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const workflowData = getWorkflowData();
      
      if (workflowId) {
        await apiRequest("PUT", `/api/workflows/${workflowId}`, { data: workflowData });
        toast({
          title: "Success",
          description: "Workflow saved successfully",
        });
      } else {
        // If no ID, create a new workflow
        const response = await apiRequest("POST", "/api/workflows", { 
          name: storeWorkflowName || "Untitled Workflow",
          data: workflowData
        });
        const data = await response.json();
        window.history.replaceState(null, "", `/editor/${data.id}`);
        toast({
          title: "Success",
          description: "Workflow created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
            <h1 className="text-xl font-semibold">{title}</h1>
          </Link>
          <span className="text-sm bg-secondary/10 text-secondary px-2 py-0.5 rounded">Beta</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <ApiKeyDialog />
            <Button variant="ghost" size="icon" aria-label="Help">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {showSaveButton && (
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isSaving ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  <>
                    <SaveAll className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            )}
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
              {user.initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
