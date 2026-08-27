import { useState } from 'react';
import { Target, TrendingUp, Users, CheckCircle2, X } from 'lucide-react';

const promptCategories = [
  {
    id: 'scale',
    icon: <Users size={16} />,
    title: 'Scale & Scope',
    questions: [
      'How many users/customers were impacted?',
      'What was the size of the team you led?',
      'How many data points or transactions were processed?'
    ]
  },
  {
    id: 'performance',
    icon: <TrendingUp size={16} />,
    title: 'Performance & Speed',
    questions: [
      'How much time did this save?',
      'Did you reduce latency or improve load times?',
      'What was the percentage increase in efficiency?'
    ]
  },
  {
    id: 'business',
    icon: <Target size={16} />,
    title: 'Business Impact',
    questions: [
      'Did this increase revenue or reduce costs?',
      'What was the dollar value of the project?',
      'Did it improve conversion or retention rates?'
    ]
  }
];

export default function EvidencePrompt({ onApply, onDismiss }) {
  const [activeCategory, setActiveCategory] = useState(promptCategories[0]);
  const [draftResult, setDraftResult] = useState('');

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-primary)]/50">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[var(--accent-primary)]" />
          Quantify Your Impact
        </h4>
        <button onClick={onDismiss} className="text-[var(--text-secondary)] hover:text-white"><X size={16} /></button>
      </div>
      
      <div className="flex">
        {/* Categories Sidebar */}
        <div className="w-1/3 border-r border-[var(--border-color)] p-2 space-y-1">
          {promptCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-colors ${activeCategory.id === cat.id ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-white'}`}
            >
              {cat.icon}
              {cat.title}
            </button>
          ))}
        </div>
        
        {/* Prompt Area */}
        <div className="w-2/3 p-4 flex flex-col">
          <p className="text-xs text-[var(--text-secondary)] mb-3">Ask yourself:</p>
          <ul className="space-y-2 mb-4 flex-1">
            {activeCategory.questions.map((q, i) => (
              <li key={i} className="text-sm font-medium leading-tight text-white">{q}</li>
            ))}
          </ul>
          
          <div className="mt-auto">
            <textarea
              placeholder="e.g., Resulting in a 35% reduction in..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-primary)] resize-none mb-2"
              rows={2}
              value={draftResult}
              onChange={(e) => setDraftResult(e.target.value)}
            />
            <button 
              className="btn btn-primary btn-sm w-full"
              onClick={() => {
                if (draftResult.trim()) onApply(draftResult);
              }}
              disabled={!draftResult.trim()}
            >
              Append to Bullet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
