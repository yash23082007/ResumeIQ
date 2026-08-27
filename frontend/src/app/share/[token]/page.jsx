'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Clock, EyeOff, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

// Notice: In a real app we would proxy this request through our Next.js API route 
// or point directly to the backend depending on CORS architecture. We will use absolute backend URL here or proxy.
const API_BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '') + '/api'
  : 'http://localhost:8000/api';

export default function SharedResumePage({ params }) {
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSharedResume = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/review/${token}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Failed to load resume');
        
        if (isMounted) setData(json.data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (token) {
      fetchSharedResume();
    }
    return () => { isMounted = false; };
  }, [token]);

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="spinner border-black" /></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center text-black">
        <EyeOff size={48} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Link Unavailable</h2>
        <p className="text-gray-600 max-w-md mb-6">{error}</p>
        <Link href="/" className="btn bg-black text-white hover:bg-gray-800">Return to Homepage</Link>
      </div>
    );
  }

  // Fallback if data is weird
  if (!data?.resume) return null;
  const resume = data.resume;
  const expiresAt = new Date(data.expiresAt);

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* Disclaimer Top Bar */}
      <div className="bg-amber-100 text-amber-900 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2 text-center border-b border-amber-200">
        <ShieldAlert size={16} className="shrink-0" />
        <span><strong>Recruiter Runway Disclaimer:</strong> This is an anonymized review snapshot. Analysis heuristics are predictive, not vendor certifications.</span>
      </div>
      
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
        <BrandLogo size="sm" showBadge={false} />
        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          <Clock size={14} />
          Expires {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto py-12 px-4">
        {/* Mock Render of the Resume */}
        <div className="bg-white shadow-xl rounded-sm min-h-[1056px] w-full max-w-[816px] mx-auto p-12 print:shadow-none print:m-0 print:p-0">
          {/* We assume rawText or parsedJson is available depending on how it was saved. We'll dump rawText if available. */}
          <div className="prose prose-sm md:prose-base max-w-none text-gray-800 whitespace-pre-wrap font-serif leading-relaxed">
            {resume.rawText ? resume.rawText : 'No text content available in this snapshot.'}
          </div>
        </div>
      </main>
    </div>
  );
}
