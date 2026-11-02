'use client';

import { useState } from 'react';
import TailorResults from '@/components/TailorResults';
import api from '@/services/api';

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
      const { data } = await api.post('/tailor', { jd_text: jdText, resume_text: resumeText });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Tailoring failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tailor-page">
      <div className="tailor-page-header">
        <p className="landing-kicker">Role alignment</p>
        <h1>Resume Tailoring Pipeline</h1>
        <p>
          Paste a job description and your current resume. Our AI Crew will automatically tailor your experience, 
          generate a custom cover letter, calculate an ATS match score, and provide interview prep questions.
        </p>
      </div>

      {!results ? (
        <form onSubmit={handleTailor} className="tailor-form">
          <div className="tailor-input-grid">
            <div className="tailor-field">
              <label htmlFor="jd">Job Description</label>
              <textarea
                id="jd"
                rows={15}
                className="textarea"
                placeholder="Paste the full job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                required
              />
            </div>
            
            <div className="tailor-field">
              <label htmlFor="resume">Current Resume</label>
              <textarea
                id="resume"
                rows={15}
                className="textarea"
                placeholder="Paste your current resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
              />
            </div>
          </div>
          
          {error && (
            <div className="form-error tailor-error" role="alert">
              {error}
            </div>
          )}
          
          <div className="tailor-form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading ? (
                <>
                  <svg className="spinner" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            className="text-action tailor-back"
          >
            &larr; Back to Input
          </button>
          <TailorResults results={results} />
        </div>
      )}
    </div>
  );
}
