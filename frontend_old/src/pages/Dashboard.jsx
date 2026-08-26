import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Upload, Briefcase,
  LogOut, Plus, ChevronRight, Clock, Loader2, X, FileUp, Search,
  Sparkles, CheckCircle2, TrendingUp, FileCheck, Layers, Trash2, ArrowUpDown
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { resumeAPI, jobAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showJDModal, setShowJDModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [jds, setJds] = useState([]);
  const [newJdTitle, setNewJdTitle] = useState('');
  const [newJdCompany, setNewJdCompany] = useState('');
  const [newJdText, setNewJdText] = useState('');
  const [savingJd, setSavingJd] = useState(false);
  const fileInputRef = useRef(null);

  const fetchResumes = () => {
    resumeAPI.list()
      .then(({ data }) => {
        setResumes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load resumes:', err);
        setLoading(false);
      });
  };

  const fetchJds = () => {
    jobAPI.list()
      .then(({ data }) => setJds(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchResumes();
    fetchJds();
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

  const handleDeleteResume = async (e, resumeId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume and its analysis history?')) return;
    try {
      await resumeAPI.delete(resumeId);
      setResumes(prev => prev.filter(r => r.id !== resumeId));
    } catch {
      alert('Failed to delete resume');
    }
  };

  const handleCreateJD = async (e) => {
    e.preventDefault();
    if (!newJdTitle.trim() || !newJdText.trim()) return;
    setSavingJd(true);
    try {
      await jobAPI.create(newJdTitle, newJdCompany, newJdText);
      setNewJdTitle('');
      setNewJdCompany('');
      setNewJdText('');
      fetchJds();
    } catch {
      alert('Failed to save job description');
    } finally {
      setSavingJd(false);
    }
  };

  const handleDeleteJD = async (e, jdId) => {
    e.stopPropagation();
    try {
      await jobAPI.delete(jdId);
      setJds(prev => prev.filter(j => j.id !== jdId));
    } catch {
      alert('Failed to delete job description');
    }
  };

  const analyzedResumes = resumes.filter(r => r.latestScore != null);
  const avgScore = analyzedResumes.length > 0
    ? Math.round(analyzedResumes.reduce((s, r) => s + r.latestScore, 0) / analyzedResumes.length)
    : null;

  const filteredResumes = resumes.filter(r => {
    const term = searchQuery.toLowerCase();
    return (r.label || r.fileName || '').toLowerCase().includes(term);
  });

  const sortedResumes = [...filteredResumes].sort((a, b) => {
    if (sortBy === 'score') return (b.latestScore ?? -1) - (a.latestScore ?? -1);
    if (sortBy === 'name') return (a.label || a.fileName || '').localeCompare(b.label || b.fileName || '');
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="app-layout">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.docx,.txt"
        onChange={(e) => {
          if (e.target.files?.[0]) handleUpload(e.target.files[0]);
        }}
      />

      {/* Professional Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BrandLogo size="md" badgeText="Free" />
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
          Job Descriptions ({jds.length})
        </button>

        <div style={{ flex: 1 }} />

        {/* Sidebar Footer Controls */}
        <div style={{
          padding: '14px 16px',
          background: '#f8fafc',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Appearance</span>
            <ThemeToggle />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {user?.email}
          </p>
        </div>

        <button className="nav-item" onClick={logout} style={{ color: 'var(--danger-text)' }}>
          <LogOut size={18} style={{ color: 'var(--danger)' }} />
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content animate-in">
        <div className="page-header">
          <div>
            <h1>Executive Dashboard</h1>
            <p>Track resume iterations, ATS compliance scores, and target job alignment history.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
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
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-label">Total Resumes</div>
            <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{resumes.length}</div>
            <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>
              <Layers size={14} />
              <span>Saved in workspace</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Average Score</div>
            <div className="stat-value" style={{ color: avgScore != null ? (avgScore >= 75 ? 'var(--success)' : avgScore >= 50 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)' }}>
              {avgScore != null ? `${avgScore}%` : '—'}
            </div>
            <div className="stat-trend" style={{ color: avgScore != null && avgScore >= 70 ? 'var(--success)' : 'var(--text-muted)' }}>
              <TrendingUp size={14} />
              <span>{avgScore != null ? (avgScore >= 70 ? 'Above Target Baseline' : 'Needs Optimization') : 'Pending analysis'}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Strong Resumes</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {resumes.filter(r => (r.latestScore ?? 0) >= 75).length}
            </div>
            <div className="stat-trend" style={{ color: 'var(--success)' }}>
              <CheckCircle2 size={14} />
              <span>Scores ≥ 75% benchmark</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Analyzed Profiles</div>
            <div className="stat-value" style={{ color: 'var(--info)' }}>
              {resumes.filter(r => r.latestStatus === 'completed').length}
            </div>
            <div className="stat-trend" style={{ color: 'var(--info)' }}>
              <FileCheck size={14} />
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
          style={{ marginBottom: 40 }}
        >
          {uploading ? (
            <>
              <Loader2 size={40} className="spinner" style={{ color: 'var(--accent-primary)', marginBottom: 8 }} />
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Processing & Parsing Document...</h3>
                <p style={{ fontSize: '0.875rem' }}>Extracting layout hierarchy, contact entities, and action verbs.</p>
              </div>
            </>
          ) : (
            <>
              <div className="upload-zone-icon">
                <FileUp size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Drag and drop your resume file, or browse</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Supports PDF, DOCX, and TXT • Max 10MB file size</p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span className="badge badge-neutral">PDF</span>
                <span className="badge badge-neutral">DOCX</span>
                <span className="badge badge-neutral">TXT</span>
              </div>
            </>
          )}
        </div>

        {/* Search, Sort & Resume List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: '1.3rem' }}>Your Resumes ({resumes.length})</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {resumes.length === 0 && !loading && (
                <button className="btn btn-secondary btn-sm" onClick={handleSeedDemoData}>
                  <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                  Load Sample Candidate Resume
                </button>
              )}
              {resumes.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <ArrowUpDown size={14} />
                    <select
                      className="select"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', width: 140 }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="score">Highest Score</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>

                  <div style={{ position: 'relative', width: 240 }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      className="input"
                      style={{ paddingLeft: 36, paddingBottom: 7, paddingTop: 7, fontSize: '0.85rem' }}
                      placeholder="Filter resumes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
              <div className="spinner" />
            </div>
          ) : sortedResumes.length > 0 ? (
            <div>
              {sortedResumes.map(resume => (
                <div
                  key={resume.id}
                  className="resume-list-item"
                  onClick={() => navigate(`/resume/${resume.id}`)}
                >
                  <div style={{
                    width: 48, height: 48,
                    background: 'var(--accent-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileText size={24} style={{ color: 'var(--accent-primary)' }} />
                  </div>

                  <div className="resume-info">
                    <div className="resume-name">{resume.label || resume.fileName}</div>
                    <div className="resume-meta">
                      <span>v{resume.version}</span>
                      <span>•</span>
                      <span>{resume.fileType?.toUpperCase() || 'DOCUMENT'}</span>
                      <span>•</span>
                      <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {resume.latestScore != null ? (
                      <span className={`badge ${
                        resume.latestScore >= 75 ? 'badge-success' : resume.latestScore >= 50 ? 'badge-warning' : 'badge-danger'
                      }`} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                        {resume.latestScore}% ATS Score
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Not Analyzed</span>
                    )}

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      title="Delete Resume"
                      onClick={(e) => handleDeleteResume(e, resume.id)}
                      style={{ padding: '6px 8px', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                    </button>

                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '56px 20px', background: '#ffffff' }}>
              <FileText size={44} style={{ color: 'var(--accent-primary)', margin: '0 auto 16px', opacity: 0.8 }} />
              <h4 style={{ fontSize: '1.2rem', marginBottom: 6 }}>
                {searchQuery ? 'No resumes match your search' : 'No Resumes in Workspace'}
              </h4>
              <p style={{ maxWidth: 440, margin: '0 auto 20px', fontSize: '0.875rem' }}>
                {searchQuery ? 'Try adjusting your search keywords.' : 'Upload your resume in PDF, DOCX, or TXT format to generate neural ATS diagnostics and STAR coaching suggestions.'}
              </p>
              {!searchQuery && (
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={15} />
                    Upload First Resume
                  </button>
                  <button className="btn btn-secondary" onClick={handleSeedDemoData}>
                    <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
                    Try Demo Resume
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Job Descriptions Modal */}
        {showJDModal && (
          <div className="modal-overlay" onClick={() => setShowJDModal(false)}>
            <div className="modal animate-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: 4 }}>Target Job Descriptions</h3>
                  <p style={{ fontSize: '0.85rem' }}>Add job postings to score keyword overlap and tailor your experience.</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowJDModal(false)}>
                  <X size={18} />
                </button>
              </div>

              {/* Add New JD Form */}
              <form onSubmit={handleCreateJD} style={{ marginBottom: 24, padding: 18, background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 12, fontWeight: 700 }}>Add Target Job Posting</h4>
                <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="form-label">Job Title</label>
                    <input
                      className="input"
                      placeholder="e.g. Senior Full Stack Engineer"
                      value={newJdTitle}
                      onChange={(e) => setNewJdTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Company (Optional)</label>
                    <input
                      className="input"
                      placeholder="e.g. Stripe, OpenAI"
                      value={newJdCompany}
                      onChange={(e) => setNewJdCompany(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="form-label">Job Description / Requirements Text</label>
                  <textarea
                    className="textarea"
                    rows={4}
                    placeholder="Paste job posting text and requirements..."
                    value={newJdText}
                    onChange={(e) => setNewJdText(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingJd}>
                  {savingJd ? <Loader2 size={13} className="spinner" /> : <Plus size={13} />}
                  Save Job Description
                </button>
              </form>

              {/* Existing JDs */}
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 10, fontWeight: 700 }}>Saved Profiles ({jds.length})</h4>
                {jds.length === 0 ? (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>No job descriptions added yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                    {jds.map(jd => (
                      <div key={jd.id} style={{
                        padding: '12px 14px',
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{jd.title}</strong>
                          {jd.company && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>({jd.company})</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                            {new Date(jd.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Delete Job Description"
                            onClick={(e) => handleDeleteJD(e, jd.id)}
                            style={{ padding: '4px 6px', color: 'var(--danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
