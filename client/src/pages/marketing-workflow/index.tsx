import React from 'react';
import { MarketingWorkflow } from '@/components/agents/MarketingWorkflow';
import { ThemeProvider } from '@/lib/theme-provider';

export default function MarketingWorkflowPage() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gray-950 text-white">
        <header className="border-b border-gray-800 bg-gray-900">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                AgentAutomator
              </span>
              <span className="text-sm px-2 py-0.5 rounded bg-blue-900 text-blue-300">Marketing</span>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="/marketing-workflow" className="text-white font-medium">
                Marketing Workflow
              </a>
              <a href="/settings" className="text-gray-400 hover:text-white transition-colors">
                Settings
              </a>
            </nav>
          </div>
        </header>
        
        <main>
          <MarketingWorkflow />
        </main>
      </div>
    </ThemeProvider>
  );
}
