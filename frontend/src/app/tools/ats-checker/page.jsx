'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import api from '@/services/api';

export default function PublicAtsChecker() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.post('/public/ats-check', { text });
      if (res.data?.status === 'success') {
        setResult(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to analyze text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="h-16 border-b border-[var(--border-color)] flex items-center px-6 sticky top-0 bg-[var(--bg-secondary)]/80 backdrop-blur z-20">
        <Link href="/" className="mr-6 text-[var(--text-secondary)] hover:text-white"><ArrowLeft size={20} /></Link>
        <BrandLogo size="sm" showBadge={false} />
        <div className="ml-auto flex items-center gap-4">
          <Link href="/auth" className="btn btn-ghost text-sm">Sign In</Link>
          <Link href="/auth" className="btn btn-primary btn-sm">Build Resume</Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-full mb-4">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Free ATS Compatibility Checker</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Paste a section of your resume (like a role or bullet point) below to see how Applicant Tracking Systems like Workday and Greenhouse parse it.
          </p>
        </div>
        
        <div className="card p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl">
          <textarea
            className="w-full h-48 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4 text-sm focus:border-[var(--accent-primary)] focus:outline-none resize-none mb-4"
            placeholder="Paste text here... (e.g. 'Software Engineer | Google | 2020-2023')"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Max 2,000 characters per check.</span>
            <button 
              className="btn btn-primary px-8" 
              onClick={handleCheck}
              disabled={!text.trim() || loading}
            >
              {loading ? <span className="spinner" /> : 'Run ATS Check'}
            </button>
          </div>
          
          {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm">{error}</div>}
        </div>
        
        {result && (
          <div className="mt-8 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              ATS Analysis Results 
              <span className={`badge ${result.score > 80 ? 'badge-success' : 'badge-warning'}`}>Score: {result.score}</span>
            </h2>
            
            <div className="grid gap-4">
              {result.issues.length === 0 ? (
                <div className="card p-6 border border-green-500/20 bg-green-500/5 text-green-400 flex items-start gap-3 rounded-lg">
                  <CheckCircle2 className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Perfectly Parseable</h4>
                    <p className="text-sm opacity-80">This text snippet contains no standard ATS failure triggers. It is safe to use in Workday, Greenhouse, and Taleo.</p>
                  </div>
                </div>
              ) : (
                result.issues.map((issue, idx) => (
                  <div key={idx} className="card p-4 border border-amber-500/20 bg-amber-500/5 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="shrink-0 text-amber-500 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-white mb-1">{issue.message}</h4>
                      <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-2">Severity: {issue.severity}</div>
                      {issue.suggestion && (
                        <p className="text-sm text-gray-300 bg-[var(--bg-primary)] p-2 rounded border border-[var(--border-color)]">
                          <strong>Fix:</strong> {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-12 text-center p-8 bg-[var(--accent-primary)]/10 rounded-2xl border border-[var(--accent-primary)]/20">
              <h3 className="text-2xl font-bold mb-2">Want the full picture?</h3>
              <p className="text-[var(--text-secondary)] mb-6">Create a free account to get a comprehensive 5-axis score, semantic keyword matching, and AI-powered bullet rewrites.</p>
              <Link href="/auth" className="btn btn-primary inline-flex items-center gap-2 px-6">
                Start Building Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
