import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ContentGeneratorConfigProps {
  nodeId: string;
  initialData: {
    contentType?: string;
    tone?: string;
    targetWordCount?: number;
    seoKeywords?: string[];
    includeImages?: boolean;
    companyWebsite?: string;
    companyName?: string;
    productDescription?: string;
    industryVertical?: string;
  };
  onUpdate: (data: Record<string, any>) => void;
}

export default function ContentGeneratorConfig({
  nodeId,
  initialData,
  onUpdate
}: ContentGeneratorConfigProps) {
  const { toast } = useToast();
  const [contentType, setContentType] = useState(initialData.contentType || 'blog-post');
  const [tone, setTone] = useState(initialData.tone || 'professional');
  const [targetWordCount, setTargetWordCount] = useState(initialData.targetWordCount || 1200);
  const [seoKeywords, setSeoKeywords] = useState(initialData.seoKeywords?.join(', ') || '');
  const [includeImages, setIncludeImages] = useState(initialData.includeImages !== false);
  const [companyName, setCompanyName] = useState(initialData.companyName || '');
  const [companyWebsite, setCompanyWebsite] = useState(initialData.companyWebsite || '');
  const [productDescription, setProductDescription] = useState(initialData.productDescription || '');
  const [industryVertical, setIndustryVertical] = useState(initialData.industryVertical || 'technology');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  
  // Function to update node data
  const saveSettings = () => {
    onUpdate({
      contentType,
      tone,
      targetWordCount,
      seoKeywords: seoKeywords.split(',').map(keyword => keyword.trim()).filter(k => k.length > 0),
      includeImages,
      companyName,
      companyWebsite,
      productDescription,
      industryVertical
    });
    
    toast({
      title: "Settings saved",
      description: "Content settings have been updated",
    });
  };
  
  // Function to generate content preview
  const generatePreview = async () => {
    try {
      setIsGenerating(true);
      
      // In a real implementation, this would call OpenAI API
      // For demo, we're using a simulated response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a preview based on the settings
      setPreviewContent(
        `${contentType === 'blog-post' ? '# ' : ''}${companyName || 'Company'}: Innovative Solutions for ${industryVertical || 'Business'}\n\n` +
        `${companyName || 'We'} are leading providers of cutting-edge solutions in the ${industryVertical || 'technology'} space. ` +
        `${productDescription || 'Our products and services help businesses achieve their goals and streamline operations.'}\n\n` +
        `This is a preview of the content that would be generated based on your settings. ` +
        `In a real implementation, this would be generated using OpenAI, with the following parameters:\n` +
        `- Content Type: ${contentType}\n` +
        `- Tone: ${tone}\n` +
        `- Word Count: ${targetWordCount}\n` +
        `- SEO Keywords: ${seoKeywords || 'none specified'}\n` +
        `- Include Images: ${includeImages ? 'Yes' : 'No'}`
      );
      
      toast({
        title: "Preview Generated",
        description: "This is a sample of how your content would look",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content preview",
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
          <Label>Company Information</Label>
          <div className="space-y-3">
            <Input
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
            <Input
              placeholder="Company Website"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
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
            <Textarea
              placeholder="Product/Service Description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="min-h-[100px] bg-gray-800 border-gray-700"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content-type">Content Type</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blog-post">Blog Post</SelectItem>
              <SelectItem value="social-post">Social Media Post</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="landing-page">Landing Page</SelectItem>
              <SelectItem value="press-release">Press Release</SelectItem>
              <SelectItem value="product-description">Product Description</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="authoritative">Authoritative</SelectItem>
              <SelectItem value="humorous">Humorous</SelectItem>
              <SelectItem value="inspirational">Inspirational</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="block mb-1">Target Word Count: {targetWordCount}</Label>
          <Slider
            value={[targetWordCount]}
            min={100}
            max={2000}
            step={100}
            onValueChange={(values) => setTargetWordCount(values[0])}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>100</span>
            <span>1000</span>
            <span>2000</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="seo-keywords">SEO Keywords (comma separated)</Label>
          <Input
            id="seo-keywords"
            placeholder="product, service, industry"
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="include-images" 
            checked={includeImages}
            onCheckedChange={setIncludeImages}
          />
          <Label htmlFor="include-images">Generate images</Label>
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
      
      {previewContent && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Content Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-line bg-gray-900 p-3 rounded border border-gray-700 max-h-[300px] overflow-y-auto">
              {previewContent}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}