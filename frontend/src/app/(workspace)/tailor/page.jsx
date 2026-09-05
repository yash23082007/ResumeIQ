'use client';

import { useState } from 'react';
import TailorResults from '@/components/TailorResults';

export default function TailorPage() {
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleTailor = async (e) => {
    e.preventDefault();
    if (!jdText.trim() || !resumeText.trim()) {
      setError('Please provide both a Job Description and a Resume.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Assuming FastAPI is running on a specific port or proxied
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tailor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
        body: JSON.stringify({
          jd_text: jdText,
          resume_text: resumeText
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to tailor resume. Please ensure API keys are configured and backend is running.');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resume Tailoring Pipeline</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Paste a job description and your current resume. Our AI Crew will automatically tailor your experience, 
          generate a custom cover letter, calculate an ATS match score, and provide interview prep questions.
        </p>
      </div>

      {!results ? (
        <form onSubmit={handleTailor} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="jd" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Description
              </label>
              <textarea
                id="jd"
                rows={15}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm p-4"
                placeholder="Paste the full job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Resume
              </label>
              <textarea
                id="resume"
                rows={15}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm p-4"
                placeholder="Paste your current resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
              />
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing (Takes ~1-2 mins)...
                </>
              ) : (
                'Run Tailoring Pipeline'
              )}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <button 
            onClick={() => setResults(null)}
            className="mb-6 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
          >
            &larr; Back to Input
          </button>
          <TailorResults results={results} />
        </div>
      )}
    </div>
  );
}
