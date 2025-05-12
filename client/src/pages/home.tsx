import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";

function CreateWorkflowDialog({ onWorkflowCreated }: { onWorkflowCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async () => {
    try {
      await apiRequest("POST", "/api/workflows", { 
        name: name || "Untitled Workflow", 
        description
      });
      setName("");
      setDescription("");
      setIsOpen(false);
      onWorkflowCreated();
    } catch (error) {
      console.error("Failed to create workflow:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>New Workflow</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new workflow</DialogTitle>
          <DialogDescription>
            Create a new AI agent workflow. You can customize it in the editor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              placeholder="My Workflow" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              placeholder="Workflow description (optional)" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const { data: workflows = [], refetch } = useQuery<any[]>({
    queryKey: ['/api/workflows'],
  });

  const handleWorkflowCreated = () => {
    refetch();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header title="AI Agent Builder" user={{ initials: "JS" }} showSaveButton={false} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Workflows</h1>
          <CreateWorkflowDialog onWorkflowCreated={handleWorkflowCreated} />
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-lg font-medium mb-2">No workflows yet</h2>
            <p className="text-muted-foreground mb-6">Create your first workflow to get started</p>
            <CreateWorkflowDialog onWorkflowCreated={handleWorkflowCreated} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{workflow.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{workflow.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Last edited: {new Date(workflow.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/editor/${workflow.id}`}>
                    <Button variant="outline" className="w-full">Open</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
