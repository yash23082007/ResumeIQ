'use client';

import { useState, useEffect, useCallback, use, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Eye, Plus, Save, Trash2, GripVertical, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import api from '@/services/api';

const templates = [
  { id: 'classic', name: 'Classic (ATS)', detail: 'Plain text compatible', accent: '#1f2933' },
  { id: 'relay', name: 'Relay', detail: 'Clean typographic hierarchy', accent: '#6366f1' },
  { id: 'ledger', name: 'Ledger', detail: 'Data-dense double column', accent: '#275d52' },
  { id: 'arc', name: 'Arc', detail: 'Creative portfolio focus', accent: '#a855f7' },
  { id: 'signal', name: 'Signal', detail: 'Modern geometric layout', accent: '#f59e0b' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

function Field({ label, value, onChange, multiline = false }) {
  const Element = multiline ? 'textarea' : 'input';
  return (
    <label className="builder-field w-full block mb-4">
      <span className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-semibold">{label}</span>
      <Element 
        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
        value={value} 
        onChange={(event) => onChange(event.target.value)} 
        rows={multiline ? 3 : undefined} 
      />
    </label>
  );
}

export default function DraftEditorPage({ params }) {
  const unwrappedParams = use(params);
  const draftId = unwrappedParams.id;
  
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState('Saved');
  const [showPreview, setShowPreview] = useState(true);

  // Use a ref to track the latest draft for debounced saving
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    fetchDraft();
  }, [draftId]);

  const fetchDraft = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/drafts/${draftId}`);
      if (res.data?.status === 'success') {
        setDraft(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = useCallback(async (currentDraft) => {
    if (!currentDraft) return;
    try {
      setSaveState('Saving...');
      await api.patch(`/drafts/${draftId}`, {
        title: currentDraft.title,
        templateId: currentDraft.templateId,
        sections: currentDraft.sections
      });
      setSaveState('Saved');
    } catch (err) {
      console.error('Failed to save draft:', err);
      setSaveState('Save failed');
    }
  }, [draftId]);

  // Debounced autosave effect
  useEffect(() => {
    if (!draft) return;
    if (saveState === 'Saving...') return;
    
    setSaveState('Unsaved changes');
    const timer = setTimeout(() => {
      saveDraft(draftRef.current);
    }, 1500);

    return () => clearTimeout(timer);
  }, [draft, saveDraft]);


  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  }

  if (!draft) {
    return <div className="min-h-screen flex flex-col items-center justify-center"><h2 className="text-xl mb-4">Draft not found</h2><Link href="/builder" className="btn btn-primary">Go back</Link></div>;
  }

  // Helpers for deep state updates
  const updateDraft = (updater) => setDraft(current => ({ ...current, ...updater(current) }));
  
  const updateSection = (sectionId, updater) => {
    updateDraft(d => ({
      sections: d.sections.map(s => s.id === sectionId ? { ...s, ...updater(s) } : s)
    }));
  };

  const updateItem = (sectionId, itemId, updater) => {
    updateSection(sectionId, s => ({
      items: s.items.map(i => i.id === itemId ? { ...i, ...updater(i) } : i)
    }));
  };

  const handleExportPDF = async () => {
    window.print();
  };

  const currentTemplate = templates.find(t => t.id === draft.templateId) || templates[0];

  return (
    <div className="builder-page bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/builder" className="text-sm text-[var(--text-secondary)] hover:text-white flex items-center gap-2">
            <ArrowLeft size={16} /> Drafts
          </Link>
          <div className="w-px h-6 bg-[var(--border-color)]" />
          <input 
            className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] rounded px-2 py-1 font-medium text-sm"
            value={draft.title}
            onChange={(e) => updateDraft(() => ({ title: e.target.value }))}
            placeholder="Draft Title"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-xs flex items-center gap-1.5 ${saveState === 'Saved' ? 'text-green-500' : 'text-[var(--text-secondary)]'}`}>
            {saveState === 'Saved' ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saveState}
          </span>
          <div className="w-px h-6 bg-[var(--border-color)] mx-1" />
          <button 
            className={`btn btn-sm ${showPreview ? 'btn-ghost' : 'btn-secondary'}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={14} /> {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportPDF}>
            <Download size={14} /> Export PDF
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Column */}
        <section className="flex-1 overflow-y-auto p-6 lg:p-10 hide-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8 pb-32">
            
            {/* Template Selection */}
            <div className="card p-6 border border-[var(--border-color)] bg-[var(--bg-secondary)]/30 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Template & Style</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {templates.map(t => (
                  <button 
                    key={t.id}
                    className={`p-3 rounded-lg border text-left flex flex-col items-start transition-all ${draft.templateId === t.id ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)]'}`}
                    onClick={() => updateDraft(() => ({ templateId: t.id }))}
                  >
                    <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: t.accent }} />
                    <strong className="text-sm block">{t.name}</strong>
                  </button>
                ))}
              </div>
            </div>

            {/* Sections */}
            {draft.sections.map(section => (
              <div key={section.id} className="card p-6 border border-[var(--border-color)] rounded-xl relative group">
                <h2 className="text-lg font-semibold mb-4 capitalize">{section.name || section.type}</h2>
                
                {section.type === 'SUMMARY' && (
                  <Field 
                    label="Professional Summary" 
                    value={section.content || ''} 
                    onChange={(val) => updateSection(section.id, () => ({ content: val }))} 
                    multiline 
                  />
                )}

                {section.type !== 'SUMMARY' && (
                  <div className="space-y-6">
                    {section.items?.map((item, itemIdx) => (
                      <div key={item.id} className="relative pl-6 border-l-2 border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-colors">
                        <button 
                          className="absolute -left-[17px] top-4 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-red-400 p-1 rounded-full"
                          title="Remove Item"
                          onClick={() => updateSection(section.id, s => ({ items: s.items.filter(i => i.id !== item.id) }))}
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                          <Field label="Title / Role" value={item.title || ''} onChange={(val) => updateItem(section.id, item.id, () => ({ title: val }))} />
                          <Field label="Subtitle / Company" value={item.subtitle || ''} onChange={(val) => updateItem(section.id, item.id, () => ({ subtitle: val }))} />
                          <Field label="Date Range" value={item.date || ''} onChange={(val) => updateItem(section.id, item.id, () => ({ date: val }))} />
                        </div>

                        {/* Bullets */}
                        <div className="mt-2 space-y-2">
                          <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-semibold">Impact Bullets</label>
                          {item.bullets?.map((bullet, bulletIdx) => (
                            <div key={bullet.id} className="flex items-start gap-2 group/bullet">
                              <div className="mt-2 text-[var(--text-secondary)] cursor-grab"><GripVertical size={14} /></div>
                              <textarea 
                                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                                value={bullet.text}
                                onChange={(e) => updateItem(section.id, item.id, i => ({
                                  bullets: i.bullets.map(b => b.id === bullet.id ? { ...b, text: e.target.value } : b)
                                }))}
                                rows={2}
                              />
                              <button 
                                className="mt-2 text-[var(--text-secondary)] hover:text-red-400 opacity-0 group-hover/bullet:opacity-100 transition-opacity"
                                onClick={() => updateItem(section.id, item.id, i => ({
                                  bullets: i.bullets.filter(b => b.id !== bullet.id)
                                }))}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button 
                            className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1 mt-2"
                            onClick={() => updateItem(section.id, item.id, i => ({
                              bullets: [...(i.bullets || []), { id: generateId(), text: 'New impactful result...' }]
                            }))}
                          >
                            <Plus size={12} /> Add Bullet
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      className="btn btn-secondary btn-sm w-full mt-4 border-dashed border border-[var(--border-color)]"
                      onClick={() => updateSection(section.id, s => ({
                        items: [...(s.items || []), { id: generateId(), title: 'New Entry', subtitle: '', date: '', bullets: [{ id: generateId(), text: '' }] }]
                      }))}
                    >
                      <Plus size={14} /> Add {section.type === 'EXPERIENCE' ? 'Role' : 'Entry'}
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex gap-2">
              <button 
                className="btn btn-secondary flex-1 border-dashed"
                onClick={() => updateDraft(d => ({
                  sections: [...d.sections, { id: generateId(), type: 'EXPERIENCE', name: 'New Section', items: [] }]
                }))}
              >
                <Plus size={16} /> Add Custom Section
              </button>
            </div>

          </div>
        </section>

        {/* Live Preview Column */}
        {showPreview && (
          <aside className="w-1/2 min-w-[600px] border-l border-[var(--border-color)] bg-[#e5e7eb] flex flex-col">
            <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-center text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Document Preview (A4)
            </div>
            <div className="flex-1 overflow-y-auto p-8 flex justify-center hide-scrollbar">
              
              {/* Actual Paper Canvas */}
              <div 
                className={`bg-white shadow-xl text-black w-[210mm] min-h-[297mm] p-[20mm] print:shadow-none print:w-auto print:min-h-0 print:p-0 template-${draft.templateId}`}
                style={{ '--accent': currentTemplate.accent }}
              >
                {/* Header derived from generic info, we'll hardcode or use a specific section for now. 
                    Wait, earlier we used top-level fields for name/contact. Let's add them to the top of the preview. */}
                <header className="mb-6 border-b-2 border-black/10 pb-4">
                  <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--accent)' }}>Alex Candidate</h1>
                  <div className="text-sm text-gray-600">alex.candidate@example.com • linkedin.com/in/alexcand</div>
                </header>

                {/* Render Sections */}
                {draft.sections.map(section => (
                  <div key={section.id} className="mb-6">
                    <h2 className="text-lg font-bold mb-3 uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1">{section.name || section.type}</h2>
                    
                    {section.type === 'SUMMARY' && (
                      <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
                    )}

                    {section.type !== 'SUMMARY' && section.items?.map((item) => (
                      <div key={item.id} className="mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          <span className="text-xs text-gray-600 font-medium whitespace-nowrap">{item.date}</span>
                        </div>
                        {item.subtitle && <div className="text-sm font-medium text-gray-700 mb-2" style={{ color: 'var(--accent)' }}>{item.subtitle}</div>}
                        
                        {item.bullets && item.bullets.length > 0 && (
                          <ul className="list-disc list-outside ml-4 space-y-1 mt-1.5">
                            {item.bullets.map(b => (
                              <li key={b.id} className="text-sm text-gray-700 leading-snug pl-1">{b.text}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
