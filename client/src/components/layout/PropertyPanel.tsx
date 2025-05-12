import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useWorkflowStore } from "@/lib/workflowStore";
import { NodeData } from "@/types/workflow";

export default function PropertyPanel() {
  const { selectedNode, updateNodeData, setShowPropertyPanel } = useWorkflowStore();
  const [localNodeData, setLocalNodeData] = useState<NodeData | null>(null);

  useEffect(() => {
    if (selectedNode) {
      setLocalNodeData(selectedNode.data);
    }
  }, [selectedNode]);

  const handleClose = () => {
    setShowPropertyPanel(false);
  };

  const handleUpdate = () => {
    if (selectedNode && localNodeData) {
      updateNodeData(selectedNode.id, localNodeData);
    }
  };

  const handleReset = () => {
    if (selectedNode) {
      setLocalNodeData(selectedNode.data);
    }
  };

  const handleChange = (key: string, value: any) => {
    if (localNodeData) {
      setLocalNodeData({
        ...localNodeData,
        [key]: value
      });
    }
  };

  if (!selectedNode || !localNodeData) {
    return null;
  }

  return (
    <aside className="w-[320px] bg-gray-900 border-l border-gray-700 flex flex-col">
      {/* Panel header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-medium">Properties</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close properties panel">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Properties content based on node type */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`w-2 h-6 rounded-sm mr-2.5 bg-${selectedNode.data.color}`}></div>
            <h3 className="font-medium">{selectedNode.data.label}</h3>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="node-name" className="block text-sm font-medium mb-1">Node Name</Label>
              <Input
                id="node-name"
                value={localNodeData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-gray-800 border-gray-700"
              />
            </div>

            {/* Render different property fields based on node type */}
            {selectedNode.type === 'gpt4' && (
              <>
                <div>
                  <Label htmlFor="model-version" className="block text-sm font-medium mb-1">Model Version</Label>
                  <Select
                    value={localNodeData.modelVersion || 'gpt-4-turbo'}
                    onValueChange={(value) => handleChange('modelVersion', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                      <SelectItem value="gpt-4">gpt-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="system-prompt" className="block text-sm font-medium mb-1">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    rows={6}
                    className="w-full bg-gray-800 border-gray-700 font-mono text-sm resize-none"
                    value={localNodeData.systemPrompt || ''}
                    onChange={(e) => handleChange('systemPrompt', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="temperature" className="block text-sm font-medium mb-1">
                    Temperature: {(localNodeData.temperature || 0.7).toFixed(1)}
                  </Label>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[localNodeData.temperature || 0.7]}
                    onValueChange={(value) => handleChange('temperature', value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>0.5</span>
                    <span>1</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="max-tokens" className="block text-sm font-medium mb-1">Max Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={localNodeData.maxTokens || 2048}
                    onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                    className="w-full bg-gray-800 border-gray-700"
                  />
                </div>
              </>
            )}
            
            {selectedNode.type === 'ad-generator' && (
              <>
                <div>
                  <Label htmlFor="platform" className="block text-sm font-medium mb-1">Platform</Label>
                  <Select
                    value={localNodeData.platform || 'facebook'}
                    onValueChange={(value) => handleChange('platform', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ad-type" className="block text-sm font-medium mb-1">Ad Type</Label>
                  <Select
                    value={localNodeData.adType || 'image'}
                    onValueChange={(value) => handleChange('adType', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select ad type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image Ad</SelectItem>
                      <SelectItem value="video">Video Ad</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                      <SelectItem value="story">Story Ad</SelectItem>
                      <SelectItem value="text">Text Ad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="audience" className="block text-sm font-medium mb-1">Target Audience</Label>
                  <Select
                    value={localNodeData.audience || 'professionals'}
                    onValueChange={(value) => handleChange('audience', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professionals">Professionals</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="parents">Parents</SelectItem>
                      <SelectItem value="executives">Executives</SelectItem>
                      <SelectItem value="small-business">Small Business Owners</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cta" className="block text-sm font-medium mb-1">Call to Action</Label>
                  <Select
                    value={localNodeData.cta || 'learn-more'}
                    onValueChange={(value) => handleChange('cta', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select CTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learn-more">Learn More</SelectItem>
                      <SelectItem value="sign-up">Sign Up</SelectItem>
                      <SelectItem value="contact-us">Contact Us</SelectItem>
                      <SelectItem value="buy-now">Buy Now</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                      <SelectItem value="get-started">Get Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="industry" className="block text-sm font-medium mb-1">Industry Vertical</Label>
                  <Select
                    value={localNodeData.industryVertical || 'technology'}
                    onValueChange={(value) => handleChange('industryVertical', value)}
                  >
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
              </>
            )}
            
            {selectedNode.type === 'campaign-planner' && (
              <>
                <div>
                  <Label htmlFor="campaign-type" className="block text-sm font-medium mb-1">Campaign Type</Label>
                  <Select
                    value={localNodeData.campaignType || 'product-launch'}
                    onValueChange={(value) => handleChange('campaignType', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product-launch">Product Launch</SelectItem>
                      <SelectItem value="lead-generation">Lead Generation</SelectItem>
                      <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                      <SelectItem value="event-promotion">Event Promotion</SelectItem>
                      <SelectItem value="sales-promotion">Sales Promotion</SelectItem>
                      <SelectItem value="content-distribution">Content Distribution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration" className="block text-sm font-medium mb-1">Duration</Label>
                  <Select
                    value={localNodeData.duration || '4 weeks'}
                    onValueChange={(value) => handleChange('duration', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 week">1 Week</SelectItem>
                      <SelectItem value="2 weeks">2 Weeks</SelectItem>
                      <SelectItem value="4 weeks">4 Weeks</SelectItem>
                      <SelectItem value="6 weeks">6 Weeks</SelectItem>
                      <SelectItem value="3 months">3 Months</SelectItem>
                      <SelectItem value="6 months">6 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget" className="block text-sm font-medium mb-1">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={localNodeData.budget || 5000}
                    onChange={(e) => handleChange('budget', parseInt(e.target.value))}
                    className="w-full bg-gray-800 border-gray-700"
                  />
                </div>
              </>
            )}
            
            {selectedNode.type === 'content-writer' && (
              <div className="mt-2">
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <h3 className="font-medium">Content Writer Configuration</h3>
                  <p className="text-sm text-gray-400">Generate blog posts, emails, and other content</p>
                </div>
                
                <ContentGeneratorConfig
                  nodeId={selectedNode.id}
                  initialData={localNodeData}
                  onUpdate={(newData) => {
                    for (const [key, value] of Object.entries(newData)) {
                      handleChange(key, value);
                    }
                  }}
                />
              </div>
            )}
            
            {selectedNode.type === 'google-sheets' && (
              <div className="mt-2">
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <h3 className="font-medium">Google Sheets Integration</h3>
                  <p className="text-sm text-gray-400">Connect to Google Sheets to import lead data</p>
                </div>
                
                <GoogleSheetsConfigPanel
                  nodeId={selectedNode.id}
                  initialData={localNodeData}
                  onUpdate={(newData) => {
                    for (const [key, value] of Object.entries(newData)) {
                      handleChange(key, value);
                    }
                  }}
                />
              </div>
            )}

            {selectedNode.type === 'crm' && (
              <>
                <div>
                  <Label htmlFor="source" className="block text-sm font-medium mb-1">Source</Label>
                  <Select
                    value={localNodeData.source || 'salesforce'}
                    onValueChange={(value) => handleChange('source', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salesforce">Salesforce</SelectItem>
                      <SelectItem value="hubspot">HubSpot</SelectItem>
                      <SelectItem value="zoho">Zoho CRM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="entity" className="block text-sm font-medium mb-1">Entity</Label>
                  <Select
                    value={localNodeData.entity || 'leads'}
                    onValueChange={(value) => handleChange('entity', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leads">Leads</SelectItem>
                      <SelectItem value="contacts">Contacts</SelectItem>
                      <SelectItem value="opportunities">Opportunities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedNode.type === 'email' && (
              <>
                <div>
                  <Label htmlFor="template" className="block text-sm font-medium mb-1">Template</Label>
                  <Select
                    value={localNodeData.template || 'outreach-b2b'}
                    onValueChange={(value) => handleChange('template', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outreach-b2b">Outreach-B2B</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sendVia" className="block text-sm font-medium mb-1">Send via</Label>
                  <Select
                    value={localNodeData.sendVia || 'marketing-cloud'}
                    onValueChange={(value) => handleChange('sendVia', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing-cloud">Marketing Cloud</SelectItem>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedNode.type === 'filter' && (
              <>
                <div>
                  <Label htmlFor="condition" className="block text-sm font-medium mb-1">Condition</Label>
                  <Textarea
                    id="condition"
                    className="w-full bg-gray-800 border-gray-700 font-mono text-sm resize-none"
                    value={localNodeData.condition || ''}
                    onChange={(e) => handleChange('condition', e.target.value)}
                    placeholder="leadScore > 70 && lastContact < 30 days"
                  />
                </div>
              </>
            )}

            {selectedNode.type === 'custom-llm' && (
              <>
                <div>
                  <Label htmlFor="model-url" className="block text-sm font-medium mb-1">Model URL</Label>
                  <Input
                    id="model-url"
                    value={localNodeData.modelUrl || ''}
                    onChange={(e) => handleChange('modelUrl', e.target.value)}
                    className="w-full bg-gray-800 border-gray-700 font-mono text-sm"
                    placeholder="https://api.company.ai/v1/models/sales-1"
                  />
                </div>

                <div>
                  <Label htmlFor="api-key" className="block text-sm font-medium mb-1">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={localNodeData.apiKey || ''}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    className="w-full bg-gray-800 border-gray-700"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Advanced settings section for applicable nodes */}
        {['gpt4', 'claude', 'custom-llm'].includes(selectedNode.type) && (
          <div className="pt-2 border-t border-gray-700">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Advanced Settings</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="stream-response" className="text-sm">Stream response</Label>
                <Switch
                  id="stream-response"
                  checked={localNodeData.streamResponse !== false}
                  onCheckedChange={(checked) => handleChange('streamResponse', checked)}
                />
              </div>

              <div>
                <Label htmlFor="response-format" className="block text-sm font-medium mb-1">Response Format</Label>
                <Select
                  value={localNodeData.responseFormat || 'text'}
                  onValueChange={(value) => handleChange('responseFormat', value)}
                >
                  <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel footer with actions */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90" 
            onClick={handleUpdate}
          >
            Apply
          </Button>
        </div>
      </div>
    </aside>
  );
}
