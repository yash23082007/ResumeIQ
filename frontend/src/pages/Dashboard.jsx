import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Upload, Briefcase,
  LogOut, Plus, ChevronRight, Clock, Loader2, X, FileUp, Search,
  Sparkles
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { resumeAPI, jobAPI } from '../services/api';
import ScoreCircle from '../components/ScoreCircle';
import ThemeToggle from '../components/ThemeToggle';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showJDModal, setShowJDModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    resumeAPI.list()
      .then(({ data }) => {
        if (isMounted) {
          setResumes(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load resumes:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await resumeAPI.upload(file);
      navigate(`/resume/${data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed. Please ensure file is a valid PDF, DOCX, or TXT under 10MB.');
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

  const handleSeedDemoData = async () => {
    setUploading(true);
    try {
      const sampleText = `Alex Morgan
alex.morgan@email.com | (555) 019-2834 | linkedin.com/in/alexmorgan | San Francisco, CA

SUMMARY
Results-oriented Senior Full Stack Engineer with 6+ years of experience designing and scaling web applications, microservices, and AI-driven platforms. Proven track record in optimizing cloud architectures and mentoring high-performing teams.

EXPERIENCE
Senior Software Engineer — CloudScale Technologies (2022 – Present)
• Spearheaded the architectural migration of a monolithic API to Node.js microservices, reducing p99 latency by 42% for 1.5M monthly active users.
• Orchestrated automated CI/CD pipelines with GitHub Actions and Docker, accelerating release cadence from bi-weekly to 5 deployments daily.
• Responsible for leading daily standups and mentoring 4 junior engineers on distributed systems best practices.
• Helped with database query optimization, improving PostgreSQL throughput by 30%.

Software Engineer — Nexa Solutions (2019 – 2022)
• Engineered real-time data streaming pipelines with Redis Pub/Sub and WebSocket, handling 50k events per second.
• Built responsive client-facing dashboards using React, TypeScript, and Tailwind CSS.
• Assisted with writing unit and integration tests, increasing code coverage to 88%.

EDUCATION
Bachelor of Science in Computer Science — University of Washington (2015 – 2019)

SKILLS
JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, Redis, Docker, AWS, GraphQL, REST APIs, Git`;

      const blob = new Blob([sampleText], { type: 'text/plain' });
      const file = new File([blob], 'sample_resume.txt', { type: 'text/plain' });
      const { data } = await resumeAPI.upload(file, 'Alex Morgan — Staff Profile');

      // Create a sample job description as well
      await jobAPI.create(
        'Senior Full Stack Engineer',
        'Stripe / Tech Tier',
        'Looking for a Senior Full Stack Engineer with expertise in TypeScript, React, Node.js, PostgreSQL, Redis, Docker, and AWS microservices.'
      ).catch(() => {});

      navigate(`/resume/${data.id}`);
    } catch {
      alert('Failed to load sample demo resume.');
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--score-excellent)';
    if (score >= 60) return 'var(--score-good)';
    if (score >= 40) return 'var(--score-fair)';
    return 'var(--score-poor)';
  };

  const analyzedResumes = resumes.filter(r => r.latestScore != null);
  const avgScore = analyzedResumes.length > 0
    ? Math.round(analyzedResumes.reduce((s, r) => s + r.latestScore, 0) / analyzedResumes.length)
    : null;

  const filteredResumes = resumes.filter(r => {
    const term = searchQuery.toLowerCase();
    return (r.label || r.fileName || '').toLowerCase().includes(term);
  });

  return (
    <div className="app-layout">
      {/* Professional Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">IQ</div>
          <div>
            <h1>ResumeIQ</h1>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700 }}>
              Career Intelligence
            </span>
          </div>
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

        <div style={{ flex: 1 }} />

        {/* Sidebar Footer Controls */}
        <div style={{
          padding: 'var(--space-md)',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Appearance</span>
            <ThemeToggle size={16} />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>
        </div>

        <button className="nav-item" onClick={logout}>
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Executive Dashboard</h1>
            <p>Track resume iterations, ATS compliance scores, and job alignment history.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button className="btn btn-secondary" onClick={() => setShowJDModal(true)}>
              <Briefcase size={16} />
              Manage JDs
            </button>
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              <Plus size={16} />
              Upload Resume
            </button>
          </div>
        </div>

        {/* 4 Executive KPI Stat Cards */}
        <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="stat-card">
            <div className="stat-label">Total Resumes</div>
            <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{resumes.length}</div>
            <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>
              <span>Saved in workspace</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Average Score</div>
            <div className="stat-value" style={{ color: avgScore != null ? getScoreColor(avgScore) : 'var(--text-muted)' }}>
              {avgScore != null ? `${avgScore}%` : '—'}
            </div>
            <div className="stat-trend" style={{ color: avgScore != null && avgScore >= 70 ? 'var(--success)' : 'var(--text-muted)' }}>
              {avgScore != null ? (avgScore >= 70 ? '✓ Above ATS Threshold' : 'Needs Optimization') : 'Pending analysis'}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Strong Resumes</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {resumes.filter(r => (r.latestScore ?? 0) >= 75).length}
            </div>
            <div className="stat-trend" style={{ color: 'var(--success)' }}>
              <span>Scores ≥ 75</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Analyzed Profiles</div>
            <div className="stat-value" style={{ color: 'var(--info)' }}>
              {resumes.filter(r => r.latestStatus === 'completed').length}
            </div>
            <div className="stat-trend" style={{ color: 'var(--info)' }}>
              <span>Full NLP pipeline run</span>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{ marginBottom: 'var(--space-2xl)' }}
        >
          {uploading ? (
            <>
              <Loader2 size={36} style={{ color: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
              <div>
                <h3 style={{ marginBottom: 4 }}>Processing & Parsing Document...</h3>
                <p>Extracting layout structure, contact entities, and action verbs.</p>
              </div>
            </>
          ) : (
            <>
              <div className="upload-zone-icon">
                <FileUp size={28} />
              </div>
              <div>
                <h3 style={{ marginBottom: 4 }}>Drag and drop your resume file, or browse</h3>
                <p>Supports PDF, DOCX, and TXT • Max 10MB file size</p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span className="badge badge-neutral">PDF</span>
                <span className="badge badge-neutral">DOCX</span>
                <span className="badge badge-neutral">TXT</span>
              </div>
            </>
          )}
        </div>

        {/* Search & Resume List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <h3>Your Resumes</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {resumes.length === 0 && !loading && (
                <button className="btn btn-secondary btn-sm" onClick={handleSeedDemoData}>
                  <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                  Load Sample Candidate Resume
                </button>
              )}
              {resumes.length > 0 && (
                <div style={{ position: 'relative', width: 240 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    className="input"
                    style={{ paddingLeft: 32, paddingBottom: 6, paddingTop: 6, fontSize: '0.825rem' }}
                    placeholder="Filter resumes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3xl)' }}>
              <div className="spinner" />
            </div>
          ) : filteredResumes.length > 0 ? (
            <div>
              {filteredResumes.map(resume => (
                <div
                  key={resume.id}
                  className="resume-list-item"
                  onClick={() => navigate(`/resume/${resume.id}`)}
                >
                  <div style={{
                    width: 44, height: 44,
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileText size={22} style={{ color: 'var(--accent-primary)' }} />
                  </div>

                  <div className="resume-info">
                    <div className="resume-name">{resume.label || resume.fileName}</div>
                    <div className="resume-meta">
                      <Clock size={13} />
                      <span>{new Date(resume.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="badge badge-neutral">v{resume.version}</span>
                      {resume.latestStatus === 'processing' && (
                        <span className="badge badge-info">Analyzing...</span>
                      )}
                    </div>
                  </div>

                  {resume.latestScore != null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <ScoreCircle score={resume.latestScore} size={48} showLabel={false} />
                      <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <span className="badge badge-warning">Ready to Analyze</span>
                      <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
              <FileText size={44} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }} />
              <h3>No resumes in workspace</h3>
              <p style={{ maxWidth: 420, margin: '0 auto var(--space-lg)' }}>
                Upload your first resume in PDF, DOCX, or TXT format or load our sample candidate profile.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} />
                  Upload Resume
                </button>
                <button className="btn btn-secondary" onClick={handleSeedDemoData}>
                  <Sparkles size={16} />
                  Load Sample Data
                </button>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>
              No resumes match "{searchQuery}".
            </p>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files[0])}
        />

        {/* Job Descriptions Modal */}
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
    let isMounted = true;
    jobAPI.list()
      .then(({ data }) => { if (isMounted) setJds(data); })
      .catch(() => {});
    return () => { isMounted = false; };
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
      alert(err.response?.data?.error || 'Failed to save job description');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Job Descriptions Repository</h3>
            <p style={{ fontSize: '0.8rem' }}>Save target roles to run semantic keyword alignment scoring.</p>
          </div>
          <button className="btn btn-icon btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="grid-2" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Job Title</label>
              <input className="input" placeholder="e.g. Senior Full Stack Engineer" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Company Name</label>
              <input className="input" placeholder="e.g. Stripe, OpenAI, Apple" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Job Description Text</label>
            <textarea
              className="textarea"
              placeholder="Paste the full job post requirements, responsibilities, and qualifications..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={5}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving || !rawText.trim()}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={16} />}
            Save Job Description
          </button>
        </form>

        {jds.length > 0 && (
          <div>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Saved Target Positions ({jds.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
              {jds.map(jd => (
                <div key={jd.id} className="finding-item" style={{ marginBottom: 0, padding: '10px 14px' }}>
                  <div className="finding-content">
                    <div className="finding-message" style={{ fontSize: '0.875rem' }}>{jd.title || 'Untitled Role'}</div>
                    <div className="finding-category">{jd.company || 'No company listed'} • {new Date(jd.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className="badge badge-primary">Saved</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
