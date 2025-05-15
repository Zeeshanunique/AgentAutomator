import { Switch, Route } from "wouter";
import Home from "@/pages/home";
import WorkflowEditor from "@/pages/workflow-editor";
import NotFound from "@/pages/not-found";
import MarketingWorkflow from "@/pages/marketing-workflow";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <TooltipProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/marketing-workflow" component={MarketingWorkflow} />
        <Route path="/editor" component={WorkflowEditor} />
        <Route path="/editor/:id" component={WorkflowEditor} />
        <Route component={NotFound} />
      </Switch>
    </TooltipProvider>
  );
}

export default App;
