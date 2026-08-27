'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Clock, ArrowRight } from 'lucide-react';
import api from '@/services/api';

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get('/drafts')
      .then((res) => {
        if (isMounted && res.data?.status === 'success') {
          setDrafts(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load drafts', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const createDraft = async () => {
    try {
      const res = await api.post('/drafts', {
        title: 'Untitled Draft',
        sections: [
          {
            id: 'summary',
            type: 'SUMMARY',
            name: 'Professional Summary',
            content: 'Write a brief professional summary here.',
            items: []
          },
          {
            id: 'experience',
            type: 'EXPERIENCE',
            name: 'Experience',
            content: '',
            items: [
              {
                id: 'exp-1',
                title: 'Role Title',
                subtitle: 'Company Name',
                date: 'YYYY - YYYY',
                bullets: [
                  { id: 'bul-1', text: 'Describe a measurable result.' }
                ]
              }
            ]
          }
        ]
      });
      if (res.data?.status === 'success') {
        router.push(`/builder/${res.data.data.id}`);
      }
    } catch (err) {
      console.error('Failed to create draft', err);
    }
  };

  return (
    <div className="workspace-page fade-in">
      <header className="workspace-header">
        <div>
          <h1>Resume Builder</h1>
          <p className="text-secondary mt-1">Manage your drafts and versions.</p>
        </div>
        <button onClick={createDraft} className="btn btn-primary">
          <Plus size={16} /> New Draft
        </button>
      </header>

      <div className="workspace-content">
        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner" /></div>
        ) : drafts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FileText size={48} /></div>
            <h3>No drafts found</h3>
            <p className="text-secondary max-w-md mx-auto mb-6">Create your first resume draft to begin building your professional narrative.</p>
            <button onClick={createDraft} className="btn btn-primary"><Plus size={16} /> Start Building</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map(draft => (
              <div key={draft.id} className="card hover-card flex flex-col h-full">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{draft.title}</h3>
                    <span className="badge badge-outline">{draft.templateId}</span>
                  </div>
                  <div className="text-sm text-secondary flex items-center gap-1.5 mb-1">
                    <Clock size={14} /> Last updated {new Date(draft.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-secondary">
                    Revision {draft.revision}
                  </div>
                </div>
                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <Link href={`/builder/${draft.id}`} className="flex items-center justify-between text-[var(--accent-primary)] font-medium text-sm w-full">
                    <span>Edit Draft</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
