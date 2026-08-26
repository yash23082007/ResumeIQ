'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, Upload, Briefcase,
  LogOut, Plus, ChevronRight, Clock, Loader2, X, FileUp, Search,
  Sparkles, CheckCircle2, TrendingUp, Layers, Trash2, ArrowUpDown,
  Home, RefreshCw, BarChart2
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { resumeAPI, jobAPI } from '@/services/api';
import BrandLogo from '@/components/BrandLogo';
import ScoreCircle from '@/components/ScoreCircle';

export default function Dashboard() {
  const { user, logout, isMounted } = useContext(AuthContext);
  const router = useRouter();

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

  useEffect(() => {
    if (isMounted && !user && !localStorage.getItem('resumeiq_token')) {
      router.push('/auth');
    }
  }, [user, isMounted, router]);

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
      router.push(`/resume/${data.id}`);
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

      router.push(`/resume/${data.id}`);
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

  // Filter and sort resumes
  const filteredResumes = resumes.filter(r => {
    const q = searchQuery.toLowerCase();
    const name = (r.fileName || r.label || 'Untitled Resume').toLowerCase();
    return name.includes(q);
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'score-high') {
      const sA = a.analyses?.[0]?.overallScore || 0;
      const sB = b.analyses?.[0]?.overallScore || 0;
      return sB - sA;
    }
    return 0;
  });

  // Calculate high-level stats
  const totalAnalyzed = resumes.length;
  const scoredResumes = resumes.filter(r => r.analyses?.[0]?.overallScore !== undefined);
  const avgScore = scoredResumes.length > 0 
    ? Math.round(scoredResumes.reduce((acc, r) => acc + (r.analyses[0].overallScore || 0), 0) / scoredResumes.length) 
    : 0;
  const topScore = scoredResumes.length > 0 
    ? Math.max(...scoredResumes.map(r => Math.round(r.analyses[0].overallScore || 0))) 
    : 0;

  return (
    <div className="app-layout">
      {/* ─── Sidebar Navigation ─── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BrandLogo size="sm" badgeText="Free" />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button className="nav-item active">
            <LayoutDashboard size={17} />
            <span>Workspace</span>
          </button>

          <button className="nav-item" onClick={() => setShowJDModal(true)}>
            <Briefcase size={17} />
            <span>Target Roles ({jds.length})</span>
          </button>

          <Link href="/" className="nav-item" style={{ textDecoration: 'none' }}>
            <Home size={17} />
            <span>Public Site</span>
          </Link>
        </nav>

        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email || 'Candidate'}
          </div>
          <button 
            className="nav-item" 
            onClick={() => { logout(); router.push('/auth'); }}
            style={{ color: 'var(--danger-text)' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Candidate Workspace</h1>
            <p>Upload, parse, and benchmark your resumes against corporate ATS standards.</p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleSeedDemoData} disabled={uploading}>
              <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
              Load Sample Resume
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload size={14} />
              Upload Document
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.txt"
              onChange={(e) => handleUpload(e.target.files[0])}
            />
          </div>
        </div>

        {/* ─── Summary Analytics Cards ─── */}
        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Resumes Ingested
              </span>
              <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalAnalyzed}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Active versions tracked
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Average ATS Score
              </span>
              <TrendingUp size={18} style={{ color: 'var(--success)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: avgScore >= 70 ? 'var(--success)' : 'var(--text-display)' }}>
              {avgScore > 0 ? `${avgScore}%` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Across all uploaded drafts
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Top Benchmark Score
              </span>
              <Sparkles size={18} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {topScore > 0 ? `${topScore}%` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Highest scoring version
            </div>
          </div>
        </div>

        {/* ─── Drag & Drop Upload Zone ─── */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          style={{ marginBottom: 28 }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 size={36} className="spinner" style={{ color: 'var(--accent-primary)' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Parsing document structure with NLP...</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Extracting text, sections, and bullet items</div>
            </>
          ) : (
            <>
              <div className="upload-zone-icon">
                <FileUp size={28} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 4 }}>
                  Drop your resume here, or <span style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>browse</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Supports PDF, DOCX, and TXT files up to 10MB • 100% Free Analysis
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Resumes List Section ─── */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <h2 className="card-title" style={{ fontSize: '1.1rem' }}>
              Your Uploaded Resumes ({filteredResumes.length})
            </h2>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter resumes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 30, paddingRight: 10, width: 180, fontSize: '0.8rem', height: 32 }}
                />
              </div>

              <select
                className="select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 130, fontSize: '0.8rem', height: 32, padding: '4px 8px' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score-high">Highest Score</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spinner" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.85rem' }}>Loading workspace documents...</p>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-display)', marginBottom: 4 }}>
                {searchQuery ? 'No resumes match your search' : 'No resumes in your workspace yet'}
              </p>
              <p style={{ fontSize: '0.825rem', marginBottom: 16 }}>
                Upload a document or click "Load Sample Resume" above to start auditing.
              </p>
            </div>
          ) : (
            <div>
              {filteredResumes.map((resume) => {
                const latestAnalysis = resume.analyses?.[0];
                const score = latestAnalysis?.overallScore !== undefined 
                  ? Math.round(latestAnalysis.overallScore) 
                  : null;

                return (
                  <div
                    key={resume.id}
                    className="resume-list-item"
                    onClick={() => router.push(`/resume/${resume.id}`)}
                  >
                    <div style={{ flexShrink: 0 }}>
                      {score !== null ? (
                        <ScoreCircle score={score} size={48} strokeWidth={4} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                          Pending
                        </div>
                      )}
                    </div>

                    <div className="resume-info">
                      <div className="resume-name">
                        {resume.label || resume.fileName || 'Untitled Resume'}
                      </div>
                      <div className="resume-meta">
                        <Clock size={12} />
                        <span>Uploaded {new Date(resume.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Version {resume.version || 1}</span>
                        {resume.filePath && (
                          <>
                            <span>•</span>
                            <span style={{ textTransform: 'uppercase' }}>
                              {resume.filePath.split('.').pop()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => { e.stopPropagation(); router.push(`/resume/${resume.id}`); }}
                      >
                        View Audit Report
                        <ChevronRight size={14} />
                      </button>

                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => handleDeleteResume(e, resume.id)}
                        style={{ color: 'var(--danger-text)', padding: 6 }}
                        title="Delete resume"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Target Roles (Job Descriptions) Modal ─── */}
        {showJDModal && (
          <div className="modal-overlay" onClick={() => setShowJDModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Target Job Descriptions</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Save target job descriptions to run custom semantic match analyses and generate tailored drafts.
                  </p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowJDModal(false)}>
                  <X size={18} />
                </button>
              </div>

              {/* Form to Add New JD */}
              <form onSubmit={handleCreateJD} style={{ marginBottom: 24, padding: 16, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 12 }}>
                  Add New Target Role
                </div>
                <div className="grid-2" style={{ marginBottom: 12 }}>
                  <div>
                    <label className="form-label">Job Title *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Senior Software Engineer"
                      value={newJdTitle}
                      onChange={(e) => setNewJdTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Stripe, Airbnb"
                      value={newJdCompany}
                      onChange={(e) => setNewJdCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Full Job Description Text *</label>
                  <textarea
                    rows={4}
                    className="textarea"
                    placeholder="Paste the full job posting requirements, qualifications, and role description..."
                    value={newJdText}
                    onChange={(e) => setNewJdText(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" disabled={savingJd}>
                  {savingJd ? <><Loader2 size={14} className="spinner" /> Saving...</> : <><Plus size={14} /> Save Target Role</>}
                </button>
              </form>

              {/* Existing JDs */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 10 }}>
                  Saved Roles ({jds.length})
                </div>
                {jds.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                    No target roles saved yet. Add one above to enable semantic matching.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {jds.map(jd => (
                      <div key={jd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <div style={{ fontWeight: 750, fontSize: '0.875rem' }}>{jd.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{jd.company || 'Unknown Company'}</div>
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={(e) => handleDeleteJD(e, jd.id)}
                          style={{ color: 'var(--danger-text)' }}
                        >
                          <Trash2 size={14} />
                        </button>
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
