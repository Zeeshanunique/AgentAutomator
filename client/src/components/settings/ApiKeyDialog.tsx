import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

// Interface to store API keys
export interface ApiKeys {
  openai: string;
  [key: string]: string;
}

export default function ApiKeyDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    anthropic: '',
    stability: '',
    cohere: '',
  });
  const { toast } = useToast();

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error('Failed to parse saved API keys:', error);
      }
    }
  }, []);

  const handleSave = () => {
    // Save API keys to localStorage
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    
    // Save the OpenAI key to the backend for server-side operations
    if (apiKeys.openai) {
      fetch('/api/settings/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ openai: apiKeys.openai }),
      }).catch(error => {
        console.error('Failed to save API key to server:', error);
      });
    }
    
    setIsOpen(false);
    toast({
      title: 'API Keys Saved',
      description: 'Your API keys have been saved successfully.',
    });
  };

  const handleChange = (key: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="API Keys" className="relative">
          <Settings className="h-5 w-5" />
          {!apiKeys.openai && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>API Keys Configuration</DialogTitle>
          <DialogDescription>
            Add your API keys for external services. These are stored securely in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="openai-key" className="flex items-center">
              <span>OpenAI API Key</span>
              <span className="text-xs text-red-500 ml-2">(Required)</span>
            </Label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              value={apiKeys.openai || ''}
              onChange={(e) => handleChange('openai', e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Required for using GPT-4 and other OpenAI models. Get your API key from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="anthropic-key">Anthropic API Key (Optional)</Label>
            <Input
              id="anthropic-key"
              type="password"
              placeholder="sk-ant-..."
              value={apiKeys.anthropic || ''}
              onChange={(e) => handleChange('anthropic', e.target.value)}
              autoComplete="off"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="stability-key">Stability AI Key (Optional)</Label>
            <Input
              id="stability-key"
              type="password"
              placeholder="sk-..."
              value={apiKeys.stability || ''}
              onChange={(e) => handleChange('stability', e.target.value)}
              autoComplete="off"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="cohere-key">Cohere API Key (Optional)</Label>
            <Input
              id="cohere-key"
              type="password"
              placeholder="..."
              value={apiKeys.cohere || ''}
              onChange={(e) => handleChange('cohere', e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}