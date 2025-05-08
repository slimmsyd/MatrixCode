'use client';

import { useState } from 'react';
import { MatrixRainingLetters } from 'react-mdr';

export default function AsciiGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ascii', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-[family-name:var(--font-geist-mono)] p-6">
      <MatrixRainingLetters 
        key="matrix-bg" 
        custom_class="absolute inset-0 w-full h-full object-cover z-0" 
      />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-wide">Matrix ASCII Generator</h1>
        
        <form onSubmit={handleSubmit} className="mb-8 bg-black/60 p-6 rounded-lg backdrop-blur-sm border border-green-900/50">
          <div className="mb-4">
            <label htmlFor="prompt" className="block mb-2 text-sm font-medium">
              Enter your prompt
            </label>
            <input
              type="text"
              id="prompt"
              className="w-full p-3 bg-black/70 border border-green-800 rounded-md text-green-300 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter what you want to generate"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="apiKey" className="block mb-2 text-sm font-medium">
              Stable Diffusion API Key (Optional if set on server)
            </label>
            <input
              type="password"
              id="apiKey"
              className="w-full p-3 bg-black/70 border border-green-800 rounded-md text-green-300 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Stability AI API key"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-green-900/80 hover:bg-green-800 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate ASCII Art'}
          </button>
        </form>
        
        {error && (
          <div className="p-4 mb-4 bg-red-900/50 border border-red-800 rounded-md text-red-200">
            <p>Error: {error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-black/60 p-6 rounded-lg backdrop-blur-sm border border-green-900/50">
            <h2 className="text-xl font-bold mb-4">Generated ASCII Art</h2>
            <pre className="overflow-x-auto bg-black/80 p-4 rounded border border-green-900/30 text-green-400 mb-6">
              {result.ascii}
            </pre>
            
            {result.image && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Generated Image</h3>
                <img 
                  src={result.image} 
                  alt="Generated from prompt" 
                  className="max-w-full h-auto rounded-md border border-green-900/30"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 