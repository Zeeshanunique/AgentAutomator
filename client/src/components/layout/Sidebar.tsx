import { useState } from "react";
import { ChevronsLeft, ChevronsRight, ChevronDown, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkflowStore } from "@/lib/workflowStore";
import { NodeCategory, NodeDefinition, allNodeDefinitions } from "@/types/workflow";

export default function Sidebar() {
  const { isSidebarCollapsed, setSidebarCollapsed } = useWorkflowStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Sales Tools": true,
    "Marketing Tools": true,
    "AI Models": true,
    "Data Sources": true,
    "Processing": true,
    "Outputs": true
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryNodes = (category: NodeCategory) => {
    return allNodeDefinitions.filter(node => 
      node.category === category && 
      (searchTerm === "" || node.label.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const recentlyUsedNodes = [
    allNodeDefinitions.find(node => node.type === "gpt4"),
    allNodeDefinitions.find(node => node.type === "crm"),
    allNodeDefinitions.find(node => node.type === "email")
  ].filter(Boolean) as NodeDefinition[];

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  if (isSidebarCollapsed) {
    return (
      <aside className="bg-gray-900 w-16 border-r border-gray-700 flex flex-col z-10">
        <div className="p-4 flex justify-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Only show icons in collapsed state */}
          <div className="flex flex-col items-center space-y-4">
            <Button variant="ghost" size="icon" className="text-primary">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-gray-900 w-[280px] border-r border-gray-700 flex flex-col z-10">
      {/* Sidebar header with collapse button */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-medium">Components</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          aria-label="Collapse sidebar"
        >
          <ChevronsLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search components..." 
            className="w-full bg-gray-800 border-gray-700 pl-10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Component categories and items */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Sales Tools Category */}
        <CategorySection 
          title="Sales Tools" 
          isExpanded={expandedCategories["Sales Tools"]} 
          onToggle={() => toggleCategory("Sales Tools")}
          nodes={getCategoryNodes("sales")}
        />

        {/* Marketing Tools Category */}
        <CategorySection 
          title="Marketing Tools" 
          isExpanded={expandedCategories["Marketing Tools"]} 
          onToggle={() => toggleCategory("Marketing Tools")}
          nodes={getCategoryNodes("marketing")}
        />

        {/* AI Models Category */}
        <CategorySection 
          title="AI Models" 
          isExpanded={expandedCategories["AI Models"]} 
          onToggle={() => toggleCategory("AI Models")}
          nodes={getCategoryNodes("ai")}
        />

        {/* Data Sources Category */}
        <CategorySection 
          title="Data Sources" 
          isExpanded={expandedCategories["Data Sources"]} 
          onToggle={() => toggleCategory("Data Sources")}
          nodes={getCategoryNodes("data")}
        />

        {/* Processing Category */}
        <CategorySection 
          title="Processing" 
          isExpanded={expandedCategories["Processing"]} 
          onToggle={() => toggleCategory("Processing")}
          nodes={getCategoryNodes("processing")}
        />

        {/* Outputs Category */}
        <CategorySection 
          title="Outputs" 
          isExpanded={expandedCategories["Outputs"]} 
          onToggle={() => toggleCategory("Outputs")}
          nodes={getCategoryNodes("output")}
        />
      </div>

      {/* Recently used components */}
      <div className="border-t border-gray-700 p-4">
        <h3 className="text-xs font-medium text-gray-400 mb-3">RECENTLY USED</h3>
        <div className="space-y-2">
          {recentlyUsedNodes.map((node) => (
            <div key={node.type} className="flex items-center text-sm text-gray-300 hover:text-white">
              <div className={`w-1.5 h-4 rounded-sm mr-2 bg-${node.color}`}></div>
              <span>{node.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function CategorySection({ 
  title, 
  isExpanded, 
  onToggle, 
  nodes 
}: { 
  title: string; 
  isExpanded: boolean; 
  onToggle: () => void; 
  nodes: NodeDefinition[] 
}) {
  const { onDragStart } = useWorkflowStore();

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center px-2 py-1.5 text-sm font-medium text-gray-300 cursor-pointer"
        onClick={onToggle}
      >
        <span className="flex-1">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
      </div>
      {isExpanded && (
        <div className="space-y-1">
          {nodes.map((node) => (
            <div 
              key={node.type}
              data-node-type={node.type}
              className="node-item flex items-center px-3 py-2 text-sm rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 mb-2"
              draggable
              onDragStart={(event) => onDragStart(event, node)}
            >
              <div className={`w-2 h-6 rounded-sm mr-3 bg-${node.color}`}></div>
              <span>{node.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
