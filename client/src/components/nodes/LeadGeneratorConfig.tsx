import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface LeadGeneratorConfigProps {
  nodeId: string;
  initialData: {
    targetAudience?: string;
    minimumScore?: number;
    outputFormat?: string;
    industryVertical?: string;
  };
  onUpdate: (data: Record<string, any>) => void;
}

export default function LeadGeneratorConfig({
  nodeId,
  initialData,
  onUpdate
}: LeadGeneratorConfigProps) {
  const { toast } = useToast();
  const [targetAudience, setTargetAudience] = useState(initialData.targetAudience || '');
  const [industryVertical, setIndustryVertical] = useState(initialData.industryVertical || 'technology');
  const [minimumScore, setMinimumScore] = useState(initialData.minimumScore || 60);
  const [outputFormat, setOutputFormat] = useState(initialData.outputFormat || 'csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewLeads, setPreviewLeads] = useState<any[]>([]);
  
  // Function to update node data
  const saveSettings = () => {
    onUpdate({
      targetAudience,
      minimumScore,
      outputFormat,
      industryVertical
    });
    
    toast({
      title: "Settings saved",
      description: "Lead generator settings have been updated",
    });
  };
  
  // Function to generate leads preview
  const generatePreview = async () => {
    try {
      setIsGenerating(true);
      
      // In a real implementation, this would call a service to generate leads
      // For demo, we'll use a simulated response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a preview of leads
      const demoLeads = [
        {
          name: "John Smith",
          company: "Acme Inc",
          title: "CTO",
          email: "john.smith@acmeinc.com",
          phone: "555-123-4567",
          score: 92
        },
        {
          name: "Sarah Johnson",
          company: "TechGrowth LLC",
          title: "Marketing Director",
          email: "sarah.j@techgrowth.com",
          phone: "555-987-6543",
          score: 85
        },
        {
          name: "Michael Chen",
          company: "Innovate Systems",
          title: "Product Manager",
          email: "m.chen@innovatesys.com",
          phone: "555-456-7890",
          score: 78
        }
      ];
      
      setPreviewLeads(demoLeads);
      
      toast({
        title: "Preview Generated",
        description: `Found ${demoLeads.length} qualified leads that match your criteria`,
      });
    } catch (error) {
      console.error("Error generating leads:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate lead preview",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Target Audience</Label>
          <Textarea
            placeholder="Describe your ideal customer profile (e.g., B2B SaaS companies with 50-200 employees in the US)"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="min-h-[100px] bg-gray-800 border-gray-700"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select value={industryVertical} onValueChange={setIndustryVertical}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="real-estate">Real Estate</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="block mb-1">Minimum Lead Score: {minimumScore}</Label>
          <Slider
            value={[minimumScore]}
            min={40}
            max={100}
            step={5}
            onValueChange={(values) => setMinimumScore(values[0])}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>40</span>
            <span>70</span>
            <span>100</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="output-format">Output Format</Label>
          <Select value={outputFormat} onValueChange={setOutputFormat}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select output format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV File</SelectItem>
              <SelectItem value="json">JSON Data</SelectItem>
              <SelectItem value="crm">CRM Import</SelectItem>
              <SelectItem value="email">Email Template</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={saveSettings}
            className="flex-1"
            variant="default"
          >
            Save Settings
          </Button>
          <Button 
            onClick={generatePreview} 
            disabled={isGenerating}
            className="flex-1"
            variant="outline"
          >
            {isGenerating ? "Generating..." : "Generate Preview"}
          </Button>
        </div>
      </div>
      
      {previewLeads.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lead Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium">Name</th>
                    <th className="px-2 py-1.5 text-left font-medium">Company</th>
                    <th className="px-2 py-1.5 text-left font-medium">Position</th>
                    <th className="px-2 py-1.5 text-left font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {previewLeads.map((lead, index) => (
                    <tr key={index} className="border-b border-gray-700 last:border-0">
                      <td className="px-2 py-1.5">{lead.name}</td>
                      <td className="px-2 py-1.5">{lead.company}</td>
                      <td className="px-2 py-1.5">{lead.title}</td>
                      <td className="px-2 py-1.5">
                        <span 
                          className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                            lead.score >= 80 ? 'bg-green-900 text-green-200' : 
                            lead.score >= 60 ? 'bg-yellow-900 text-yellow-200' : 
                            'bg-red-900 text-red-200'
                          }`}
                        >
                          {lead.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}