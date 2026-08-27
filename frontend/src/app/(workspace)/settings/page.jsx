'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Download, Trash2, ShieldCheck, LogOut } from 'lucide-react';
import api from '@/services/api';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  
  const handleExportData = async () => {
    // In a real app, this would hit a /api/auth/export endpoint that gathers all user data
    // and returns a JSON blob or ZIP file.
    alert("Data export initiated. You will receive an email shortly with your secure download link.");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    try {
      setLoading(true);
      await api.delete('/auth/account');
      router.push('/auth');
    } catch (err) {
      console.error('Failed to delete account', err);
      alert('Failed to delete account. Please try again.');
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/auth');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="workspace-page fade-in">
      <header className="workspace-header">
        <div>
          <h1>Account & Settings</h1>
          <p className="text-secondary mt-1">Manage your data, privacy, and account preferences.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary border-dashed">
          <LogOut size={16} /> Sign Out
        </button>
      </header>
      
      <div className="workspace-content max-w-3xl">
        
        {/* Privacy Section */}
        <div className="card p-6 border border-[var(--border-color)] mb-8">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><ShieldCheck className="text-[var(--accent-primary)]" /> Data & Privacy</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            ResumeIQ believes your career data belongs to you. We do not sell your data, and we anonymize all contents sent to AI partners.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 border-t border-[var(--border-color)] pt-6">
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Export Data Archive</h3>
              <p className="text-sm text-[var(--text-secondary)]">Download a complete JSON archive of all your resumes, job targets, and analyses.</p>
            </div>
            <button className="btn btn-secondary shrink-0 h-fit" onClick={handleExportData}>
              <Download size={16} /> Request Archive
            </button>
          </div>
        </div>
        
        {/* Danger Zone */}
        <div className="card p-6 border border-red-500/30 bg-red-500/5">
          <h2 className="text-xl font-bold mb-2 text-red-500 flex items-center gap-2"><ShieldAlert /> Danger Zone</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            Permanently delete your account and all associated data. This action cannot be undone. All resumes, drafts, job descriptions, and analyses will be cascade-deleted from our databases.
          </p>
          
          <div className="bg-[var(--bg-primary)] border border-red-500/20 p-4 rounded-lg">
            <label className="block text-sm font-medium text-white mb-2">Type &quot;DELETE&quot; to confirm</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                className="flex-1 bg-[var(--bg-secondary)] border border-red-500/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
              />
              <button 
                className={`btn px-6 ${deleteConfirm === 'DELETE' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                disabled={deleteConfirm !== 'DELETE' || loading}
                onClick={handleDeleteAccount}
              >
                {loading ? <span className="spinner" /> : <><Trash2 size={16} /> Delete Account</>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
