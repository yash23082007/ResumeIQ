import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Upload, BarChart3, Settings,
  LogOut, Plus, ChevronRight, TrendingUp, Target, Shield,
  Clock, Loader2, X, FileUp, Briefcase
} from 'lucide-react';
import { AuthContext } from '../App';
import { resumeAPI, jobAPI } from '../services/api';
import ScoreCircle from '../components/ScoreCircle';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showJDModal, setShowJDModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const { data } = await resumeAPI.list();
      setResumes(data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await resumeAPI.upload(file);
      navigate(`/resume/${data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--score-excellent)';
    if (score >= 60) return 'var(--score-good)';
    if (score >= 40) return 'var(--score-fair)';
    return 'var(--score-poor)';
  };

  const avgScore = resumes.length > 0
    ? Math.round(resumes.filter(r => r.latestScore).reduce((s, r) => s + r.latestScore, 0) / Math.max(resumes.filter(r => r.latestScore).length, 1))
    : null;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">IQ</div>
          <h1>ResumeIQ</h1>
        </div>

        <button className="nav-item active">
          <LayoutDashboard size={18} />
          Dashboard
        </button>
        <button className="nav-item" onClick={() => fileInputRef.current?.click()}>
          <Upload size={18} />
          Upload Resume
        </button>
        <button className="nav-item" onClick={() => setShowJDModal(true)}>
          <Briefcase size={18} />
          Job Descriptions
        </button>
        <button className="nav-item">
          <BarChart3 size={18} />
          Analytics
        </button>
        <button className="nav-item">
          <Settings size={18} />
          Settings
        </button>

        <div style={{ flex: 1 }} />

        <div style={{
          padding: 'var(--space-md)',
          background: 'var(--bg-glass)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-sm)',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Signed in as</p>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.email}
          </p>
        </div>

        <button className="nav-item" onClick={logout}>
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Dashboard</h1>
            <p>Track your resume progress and analysis history</p>
          </div>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
            <Plus size={16} />
            Upload Resume
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{resumes.length}</div>
            <div className="stat-label">Resumes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: avgScore ? getScoreColor(avgScore) : 'var(--text-muted)' }}>
              {avgScore || '—'}
            </div>
            <div className="stat-label">Avg Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {resumes.filter(r => r.latestScore && r.latestScore >= 70).length}
            </div>
            <div className="stat-label">Strong Resumes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--info)' }}>
              {resumes.filter(r => r.latestStatus === 'completed').length}
            </div>
            <div className="stat-label">Analyzed</div>
          </div>
        </div>

        {/* Upload Zone */}
        {resumes.length === 0 && !loading && (
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{ marginBottom: 'var(--space-xl)' }}
          >
            {uploading ? (
              <>
                <Loader2 size={40} style={{ color: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
                <h3>Uploading & Parsing...</h3>
              </>
            ) : (
              <>
                <div className="upload-zone-icon">
                  <FileUp size={28} />
                </div>
                <h3>Drop your resume here or click to upload</h3>
                <p>Supports PDF, DOCX, and TXT • Max 10 MB</p>
              </>
            )}
          </div>
        )}

        {/* Resume List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl)' }}>
            <div className="spinner" />
          </div>
        ) : resumes.length > 0 ? (
          <div>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Your Resumes</h3>
            {resumes.map((resume, i) => (
              <div
                key={resume.id}
                className="resume-list-item"
                onClick={() => navigate(`/resume/${resume.id}`)}
                style={{ animationDelay: `${i * 80}ms`, animation: 'slideUp 0.4s ease forwards', opacity: 0 }}
              >
                <div style={{
                  width: 44, height: 44,
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={20} style={{ color: 'var(--text-accent)' }} />
                </div>

                <div className="resume-info">
                  <div className="resume-name">{resume.label || resume.fileName}</div>
                  <div className="resume-meta">
                    <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {new Date(resume.createdAt).toLocaleDateString()} •
                    Version {resume.version}
                    {resume.latestStatus === 'processing' && (
                      <span className="badge badge-info" style={{ marginLeft: 8 }}>Analyzing...</span>
                    )}
                  </div>
                </div>

                {resume.latestScore !== null && resume.latestScore !== undefined ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <ScoreCircle score={resume.latestScore} size={56} />
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span className="badge badge-warning">Not analyzed</span>
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>
            ))}

            {/* Small upload zone at bottom */}
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-md)' }}
            >
              {uploading ? (
                <Loader2 size={24} style={{ color: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>
                  <Plus size={24} style={{ color: 'var(--text-muted)' }} />
                  <p>Upload another resume</p>
                </>
              )}
            </div>
          </div>
        ) : null}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files[0])}
        />

        {/* JD Modal */}
        {showJDModal && <JDModal onClose={() => setShowJDModal(false)} />}
      </main>
    </div>
  );
}

function JDModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rawText, setRawText] = useState('');
  const [saving, setSaving] = useState(false);
  const [jds, setJds] = useState([]);

  useEffect(() => {
    jobAPI.list().then(({ data }) => setJds(data)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    setSaving(true);
    try {
      await jobAPI.create(title, company, rawText);
      const { data } = await jobAPI.list();
      setJds(data);
      setTitle(''); setCompany(''); setRawText('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Job Descriptions</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="grid-2" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input className="input" placeholder="Software Engineer" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="input" placeholder="Acme Inc." value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label">Job Description</label>
            <textarea className="input textarea" placeholder="Paste the full job description here..." value={rawText} onChange={(e) => setRawText(e.target.value)} rows={6} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving || !rawText.trim()}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={16} />}
            Save Job Description
          </button>
        </form>

        {jds.length > 0 && (
          <div>
            <h4 style={{ marginBottom: 'var(--space-md)' }}>Saved Descriptions</h4>
            {jds.map(jd => (
              <div key={jd.id} className="finding-item">
                <div className="finding-content">
                  <div className="finding-message">{jd.title || 'Untitled'}</div>
                  <div className="finding-category">{jd.company || 'No company'} • {new Date(jd.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
