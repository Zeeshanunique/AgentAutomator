import React from 'react';
import { Link } from 'wouter';
import { ThemeProvider } from '@/lib/theme-provider';

export default function NotFound() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-500">404</h1>
          <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
          <p className="mt-2 text-gray-400">The page you are looking for doesn't exist or has been moved.</p>
          <div className="mt-6">
            <Link href="/marketing-workflow">
              <a className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                Go to Marketing Workflow
              </a>
            </Link>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
