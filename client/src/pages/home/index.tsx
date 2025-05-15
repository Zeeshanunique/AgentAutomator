import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Home() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to the marketing workflow page
    setLocation('/marketing-workflow');
  }, [setLocation]);
  
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting to Marketing Workflow...</h1>
        <p className="mt-2 text-gray-400">Please wait...</p>
      </div>
    </div>
  );
}
