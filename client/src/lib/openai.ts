// OpenAI integration utility
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import { apiRequest } from '@/lib/queryClient';

// Types for OpenAI requests and responses
interface OpenAICompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
  stream?: boolean;
}

interface OpenAICompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

// Get OpenAI API key - first tries browser storage, then asks server
async function getOpenAIKey(): Promise<string | null> {
  // Try local storage first
  const savedKeys = localStorage.getItem('apiKeys');
  if (savedKeys) {
    try {
      const parsedKeys = JSON.parse(savedKeys);
      if (parsedKeys.openai) {
        return parsedKeys.openai;
      }
    } catch (error) {
      console.error('Failed to parse saved API keys:', error);
    }
  }
  
  // If no key in local storage, check if server has one
  try {
    const response = await fetch('/api/settings/apikey');
    const data = await response.json();
    if (data.hasOpenAI) {
      return 'SERVER_KEY'; // Special value to indicate we should use server-side key
    }
  } catch (error) {
    console.error('Failed to check for server API key:', error);
  }
  
  return null;
}

// Make a completion request to OpenAI
export async function createCompletion(
  request: OpenAICompletionRequest
): Promise<OpenAICompletionResponse> {
  const apiKey = await getOpenAIKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add your API key in settings.');
  }
  
  if (apiKey === 'SERVER_KEY') {
    // Use server as a proxy to OpenAI
    const response = await apiRequest('POST', '/api/ai/completion', request);
    return response.json();
  } else {
    // Direct call to OpenAI API with client-side key
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create completion');
    }
    
    return response.json();
  }
}

// Generate image using OpenAI DALL-E
export async function generateImage(prompt: string): Promise<{ url: string }> {
  const apiKey = await getOpenAIKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add your API key in settings.');
  }
  
  if (apiKey === 'SERVER_KEY') {
    // Use server as a proxy to OpenAI
    const response = await apiRequest('POST', '/api/ai/image', { prompt });
    return response.json();
  } else {
    // Direct call to OpenAI API with client-side key
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }
    
    const data = await response.json();
    return { url: data.data[0].url };
  }
}

// Check if OpenAI key is configured
export async function isOpenAIConfigured(): Promise<boolean> {
  return !!(await getOpenAIKey());
}