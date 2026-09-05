'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function TailorResults({ results }) {
  const [activeTab, setActiveTab] = useState('resume');

  const {
    tailored_resume,
    cover_letter,
    ats_score,
    ats_feedback,
    interview_questions
  } = results || {};

  const tabs = [
    { id: 'resume', name: 'Tailored Resume' },
    { id: 'cover_letter', name: 'Cover Letter' },
    { id: 'interview', name: 'Interview Prep' },
    { id: 'ats', name: 'ATS Score' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header/Score Summary */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Tailored Application</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ready to submit! Review your tailored materials below.</p>
        </div>
        <div className="flex items-center space-x-3 text-center">
          <div>
            <span className="block text-xs uppercase tracking-wide text-gray-500 font-semibold">ATS Match Score</span>
            <span className={`text-3xl font-extrabold ${ats_score >= 80 ? 'text-green-600' : ats_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {ats_score || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-150`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'resume' && (
          <div className="prose prose-indigo dark:prose-invert max-w-none">
            <ReactMarkdown>{tailored_resume || 'No tailored resume generated.'}</ReactMarkdown>
          </div>
        )}

        {activeTab === 'cover_letter' && (
          <div className="prose prose-indigo dark:prose-invert max-w-none">
            <ReactMarkdown>{cover_letter || 'No cover letter generated.'}</ReactMarkdown>
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="max-w-3xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">ATS Evaluation Feedback</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ats_feedback || 'No feedback provided.'}</p>
            </div>
          </div>
        )}

        {activeTab === 'interview' && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Customized Interview Preparation</h3>
            <p className="text-sm text-gray-500 mb-6">These questions are generated based on the gaps or key highlights between your resume and the job description.</p>
            
            {(!interview_questions || interview_questions.length === 0) && (
              <p className="text-gray-500">No interview questions generated.</p>
            )}

            {interview_questions && interview_questions.map((q, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                <h4 className="text-md font-bold text-gray-900 dark:text-white mb-2">
                  Q{idx + 1}: {q.question}
                </h4>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                    <h5 className="text-xs uppercase font-bold text-blue-800 dark:text-blue-300 mb-1">Why they'll ask this</h5>
                    <p className="text-sm text-blue-900 dark:text-blue-100">{q.context}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                    <h5 className="text-xs uppercase font-bold text-green-800 dark:text-green-300 mb-1">Suggested Approach</h5>
                    <p className="text-sm text-green-900 dark:text-green-100">{q.suggested_approach}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
