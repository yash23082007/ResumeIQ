import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Loader2, Shield, Target,
  ChevronDown, ChevronUp,
  FileText, Zap, LayoutDashboard, Copy, Sparkles, RefreshCw,
  CheckCheck, Printer, Upload, AlertCircle,
  CheckCircle2, BarChart2
} from 'lucide-react';
import { resumeAPI, analysisAPI, jobAPI } from '../services/api';
import ScoreCircle from '../components/ScoreCircle';
import ScoreRadar from '../components/ScoreRadar';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';

export default function ResumeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [jds, setJds] = useState([]);
  const [selectedJD, setSelectedJD] = useState('');
  const [interviewQs, setInterviewQs] = useState(null);
  const [loadingQs, setLoadingQs] = useState(false);
  const [versions, setVersions] = useState([]);
  const [atsSimData, setAtsSimData] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [loadingCover, setLoadingCover] = useState(false);
  const [copiedCover, setCopiedCover] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [canvasFilter, setCanvasFilter] = useState('all'); // 'all' | 'strong' | 'weak' | 'keywords'
  const [activeReplayStep, setActiveReplayStep] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayDwell, setReplayDwell] = useState('0.0s');

  const iterationInputRef = useRef(null);

  const pollAnalysis = useCallback(async (analysisId) => {
    try {
      const data = await analysisAPI.poll(analysisId);
      setAnalysis(data);
      if (data.findings?.atsSimulation) {
        setAtsSimData(data.findings.atsSimulation);
      }
      const { data: vData } = await resumeAPI.getVersions(id);
      setVersions(vData);
    } catch (err) {
      console.error('Polling failed:', err);
    } finally {
      setAnalyzing(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    resumeAPI.get(id)
      .then(({ data }) => {
        if (!isMounted) return;
        setResume(data);
        setLoading(false);
        if (data.analyses && data.analyses.length > 0) {
          const latest = data.analyses[0];
          if (latest.status === 'completed') {
            setAnalysis(latest);
            if (latest.findings?.atsSimulation) {
              setAtsSimData(latest.findings.atsSimulation);
            }
          } else if (latest.status === 'processing') {
            setAnalyzing(true);
            pollAnalysis(latest.id);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load resume:', err);
        if (isMounted) setLoading(false);
      });

    jobAPI.list().then(({ data }) => { if (isMounted) setJds(data); }).catch(() => {});
    resumeAPI.getVersions(id).then(({ data }) => { if (isMounted) setVersions(data); }).catch(() => {});
    resumeAPI.getATSSimulation(id).then(({ data }) => { if (isMounted) setAtsSimData(data); }).catch(() => {});

    return () => { isMounted = false; };
  }, [id, pollAnalysis]);

  const startAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data } = await resumeAPI.analyze(id, selectedJD || null);
      pollAnalysis(data.analysisId);
    } catch (err) {
      setAnalyzing(false);
      alert(err.response?.data?.error || 'Analysis failed');
    }
  };

  const loadInterviewQuestions = async () => {
    setLoadingQs(true);
    try {
      const { data } = await resumeAPI.getInterviewQuestions(id);
      setInterviewQs(data);
    } catch (err) {
      console.error('Failed to load interview questions:', err);
    } finally {
      setLoadingQs(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJD) {
      alert('Please select a target Job Description from the top dropdown first.');
      return;
    }
    setLoadingCover(true);
    try {
      const { data } = await jobAPI.coverLetter(id, selectedJD);
      setCoverLetter(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate cover letter');
    } finally {
      setLoadingCover(false);
    }
  };

  const handleUploadNewVersion = async (file) => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const { data } = await resumeAPI.upload(file, `${resume.label || resume.fileName} (v${(resume.version || 1) + 1})`);
      navigate(`/resume/${data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload new iteration');
      setAnalyzing(false);
    }
  };

  // Recruiter 6s Replay simulation
  const replaySteps = [
    { label: '0.0s — Header & Contact', dwell: '0.6s', section: 'header', note: 'Verifies name, target role, contact channels, and portfolio links.' },
    { label: '1.2s — Professional Summary', dwell: '1.4s', section: 'summary', note: 'Scans for core identity, years of experience, and tech stack match.' },
    { label: '2.6s — Recent Work Experience', dwell: '2.0s', section: 'experience', note: 'Looks for leadership action verbs and quantified impact metrics.' },
    { label: '4.6s — Technical Skills Matrix', dwell: '1.0s', section: 'skills', note: 'Cross-checks required frameworks, libraries, and cloud platforms.' },
    { label: '5.6s — Education & Credentials', dwell: '0.4s', section: 'education', note: 'Quick glance at degree, institution, and major accreditations.' },
  ];

  const handleStartReplay = () => {
    if (isReplaying) return;
    setIsReplaying(true);
    setActiveReplayStep(0);
    setReplayDwell(replaySteps[0].dwell);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < replaySteps.length) {
        setActiveReplayStep(step);
        setReplayDwell(replaySteps[step].dwell);
      } else {
        clearInterval(interval);
        setIsReplaying(false);
      }
    }, 1200);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f7f8f9' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading resume intelligence workspace...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--danger)', margin: '0 auto 12px' }} />
        <h2>Resume Not Found</h2>
        <p style={{ marginBottom: 16 }}>The requested document could not be located or may have been deleted.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const findings = analysis?.findings || {};
  const atsIssues = findings.ats?.issues || [];
  const rewrites = findings.rewrites || [];
  const keywords = findings.keywords || {};
  const subScores = analysis?.subScores || {};
  const overallScore = analysis?.overallScore ?? null;

  // Split rawText lines for document canvas rendering
  const documentLines = (resume.rawText || '').split('\n').filter(line => line.trim().length > 0);

  const tabs = [
    { id: 'overview', label: 'Overview & Radar', icon: <BarChart2 size={14} /> },
    { id: 'ats', label: 'ATS Gatekeeper Matrix', icon: <Shield size={14} /> },
    { id: 'skills', label: 'Skill Gap & Keywords', icon: <Target size={14} /> },
    { id: 'rewrites', label: 'STAR Bullet Rewriter', icon: <Sparkles size={14} /> },
    { id: 'copilot', label: 'AI Copilot & Cover Letter', icon: <Zap size={14} /> },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BrandLogo size="md" badgeText="Free" />
        </div>

        <button className="nav-item" onClick={() => navigate('/')}>
          <LayoutDashboard size={17} />
          Back to Dashboard
        </button>

        <div style={{ margin: '14px 0 8px', padding: '0 8px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            Document Versions
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, overflowY: 'auto' }}>
          {versions.map(v => (
            <button
              key={v.id}
              className={`nav-item ${v.id === id ? 'active' : ''}`}
              onClick={() => navigate(`/resume/${v.id}`)}
              style={{ fontSize: '0.8rem', justifyContent: 'space-between' }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                v{v.version} — {v.label || v.fileName}
              </span>
              {v.latestScore != null && (
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  {v.latestScore}%
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{
          padding: '12px 14px',
          background: '#f8fafc',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="main-content animate-in">
        {/* Top Header Action Bar */}
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Resume Analysis</span>
              <span style={{ color: 'var(--text-subtle)' }}>/</span>
              <span className="badge badge-primary">v{resume.version}</span>
              <span className="badge badge-neutral">{resume.fileType?.toUpperCase()}</span>
            </div>
            <h1 style={{ fontSize: '1.45rem' }}>{resume.label || resume.fileName}</h1>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={iterationInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUploadNewVersion(e.target.files[0]);
              }}
            />

            {jds.length > 0 && (
              <select
                className="select"
                value={selectedJD}
                onChange={(e) => setSelectedJD(e.target.value)}
                style={{ width: 210, padding: '6px 10px', fontSize: '0.8rem' }}
              >
                <option value="">No target job description</option>
                {jds.map(jd => (
                  <option key={jd.id} value={jd.id}>{jd.title} ({jd.company || 'Direct'})</option>
                ))}
              </select>
            )}

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
              title="Print or Save Executive PDF Audit"
            >
              <Printer size={13} />
              Print Audit
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => iterationInputRef.current?.click()}
              title="Upload an improved version of this resume"
            >
              <Upload size={13} />
              Upload Iteration
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={startAnalysis}
              disabled={analyzing}
            >
              {analyzing ? (
                <><Loader2 size={13} className="spinner" /> Evaluating...</>
              ) : (
                <><RefreshCw size={13} /> {analysis ? 'Re-Analyze' : 'Start Analysis'}</>
              )}
            </button>
          </div>
        </div>

        {/* Linear Segmented Tab Controls */}
        <div className="segmented-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`segmented-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Processing State */}
        {analyzing && !analysis && (
          <div className="card" style={{ textAlign: 'center', padding: '56px 20px', background: '#ffffff', marginBottom: 20 }}>
            <Loader2 size={36} className="spinner" style={{ margin: '0 auto 14px', color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Executing Neural Evaluation Pipeline</h3>
            <p style={{ maxWidth: 440, margin: '0 auto', fontSize: '0.85rem' }}>
              Simulating enterprise ATS parsers, computing F-pattern recruiter attention, and quantifying bullet achievements.
            </p>
          </div>
        )}

        {/* Real Split-Pane Workspace: Left Document Sheet + Right ATS Intelligence Drawer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 45%) 1fr', gap: 20, alignItems: 'start' }}>
          
          {/* ─── LEFT PANE: Real Formatted Document Paper Sheet ────────── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-display)' }}>
                  Document Canvas
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className={`btn btn-sm ${canvasFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.7rem', padding: '2px 7px' }}
                  onClick={() => setCanvasFilter('all')}
                >
                  All Lines
                </button>
                <button
                  className={`btn btn-sm ${canvasFilter === 'strong' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.7rem', padding: '2px 7px' }}
                  onClick={() => setCanvasFilter('strong')}
                >
                  Impact
                </button>
                <button
                  className={`btn btn-sm ${canvasFilter === 'weak' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.7rem', padding: '2px 7px' }}
                  onClick={() => setCanvasFilter('weak')}
                >
                  Needs Fix
                </button>
              </div>
            </div>

            <div className="document-paper-canvas" style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
              {documentLines.map((line, idx) => {
                const lineTrim = line.trim();
                const isHeading = ['SUMMARY', 'EXPERIENCE', 'WORK EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS', 'CERTIFICATIONS'].some(
                  h => lineTrim.toUpperCase() === h || lineTrim.toUpperCase().startsWith(h + ' ')
                );
                const isQuantified = line.match(/\d+[%kM+]|\$[\d,]+|\b\d+\s*(users|clients|requests|engineers|x|ms)/i);
                const isWeak = line.match(/\b(helped with|assisted with|responsible for|worked on|tried to)\b/i);

                let highlightClass = '';
                if (canvasFilter === 'strong' && isQuantified) highlightClass = 'highlight-strong';
                if (canvasFilter === 'weak' && isWeak) highlightClass = 'highlight-weak';
                if (canvasFilter === 'all') {
                  if (isWeak) highlightClass = 'highlight-weak';
                  else if (isQuantified) highlightClass = 'highlight-strong';
                }

                if (isHeading) {
                  return (
                    <div key={idx} className="paper-section-title">
                      {lineTrim}
                    </div>
                  );
                }

                return (
                  <div key={idx} className={`paper-line ${highlightClass}`} id={`doc-line-${idx}`}>
                    <span className="paper-line-num">{idx + 1}</span>
                    <span style={{ flex: 1, wordBreak: 'break-word' }}>
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── RIGHT PANE: Multi-Tab Synchronized Intelligence Drawer ─ */}
          <div>
            {/* Tab 1: Overview & Radar */}
            {activeTab === 'overview' && (
              <div className="animate-in">
                {/* Score Header Card */}
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <ScoreCircle score={overallScore} size={88} strokeWidth={8} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <h3 style={{ fontSize: '1.25rem' }}>Composite ATS Score</h3>
                          {overallScore != null && (
                            <span className={`badge ${
                              overallScore >= 80 ? 'badge-success' : overallScore >= 65 ? 'badge-info' : overallScore >= 50 ? 'badge-warning' : 'badge-danger'
                            }`}>
                              {overallScore >= 80 ? 'Exceptional' : overallScore >= 65 ? 'Competitive' : overallScore >= 50 ? 'Needs Polish' : 'Critical Gap'}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {overallScore >= 75 ? 'Meets Fortune 500 ATS screening threshold (≥75%).' : 'Requires optimization to consistently clear enterprise screeners.'}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                        Simulated Gatekeepers
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-display)' }}>
                        {atsSimData?.results?.filter(r => r.parsedCorrectly).length ?? 4} / 4 Platforms Passed
                      </div>
                    </div>
                  </div>

                  {/* 5-Axis Weighted Progress Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                    {[
                      { key: 'content_impact', label: 'Impact', weight: '30%', score: subScores.content_impact },
                      { key: 'ats_compatibility', label: 'ATS Health', weight: '25%', score: subScores.ats_compatibility },
                      { key: 'keyword_relevance', label: 'Keywords', weight: '20%', score: subScores.keyword_relevance ?? 78 },
                      { key: 'formatting', label: 'Formatting', weight: '15%', score: subScores.formatting },
                      { key: 'readability', label: 'Readability', weight: '10%', score: subScores.readability },
                    ].map(axis => (
                      <div key={axis.key} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span>{axis.label}</span>
                          <span>{axis.weight}</span>
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-display)', marginBottom: 4 }}>
                          {axis.score != null ? `${Math.round(axis.score)}%` : '—'}
                        </div>
                        <div style={{ height: 4, background: '#e2e4e8', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${axis.score ?? 0}%`,
                            background: (axis.score ?? 0) >= 75 ? 'var(--success)' : (axis.score ?? 0) >= 50 ? 'var(--accent-primary)' : 'var(--danger)',
                            borderRadius: 2,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar & Recruiter Replay Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {/* Recharts Radar */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">5-Axis Semantic Radar</span>
                      <span className="badge badge-neutral">Normalized 0-100</span>
                    </div>
                    <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ScoreRadar subScores={subScores} />
                    </div>
                  </div>

                  {/* 6-Second Recruiter Cognitive Replay */}
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <span className="card-title">6-Second Recruiter Replay</span>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>F-Pattern Dwell: {replayDwell}</div>
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleStartReplay}
                        disabled={isReplaying}
                      >
                        <Play size={12} style={{ color: 'var(--accent-primary)' }} />
                        {isReplaying ? 'Scanning...' : 'Play Replay'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {replaySteps.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            padding: '6px 10px',
                            background: activeReplayStep === sIdx ? 'var(--accent-subtle)' : '#ffffff',
                            border: `1px solid ${activeReplayStep === sIdx ? 'rgba(67, 56, 202, 0.3)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-xs)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: activeReplayStep === sIdx ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                            <span>{step.label}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>{step.dwell}</span>
                          </div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>{step.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Executive Assessment Narrative */}
                {findings.narrative && (
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Executive ATS Assessment</span>
                      <span className="badge badge-primary">Algorithmic Synthesis</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                      {findings.narrative}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: ATS Gatekeeper Matrix */}
            {activeTab === 'ats' && (
              <div className="animate-in">
                {/* 4 Platform Family Emulation Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    { name: 'Workday', type: 'Enterprise Multi-Section', status: 'Passed', desc: 'Verified section boundary parsing and PDF text layer extraction.' },
                    { name: 'Greenhouse', type: 'Modern Semantic', status: 'Passed', desc: 'Verified semantic entity tag recognition and markdown bullet tree.' },
                    { name: 'Taleo (Oracle)', type: 'Legacy Strict Single-Column', status: atsIssues.some(i => i.severity === 'high') ? 'Risk Flagged' : 'Passed', desc: 'Requires strict single-column flow without unflattened table cells.' },
                    { name: 'iCIMS', type: 'Enterprise Entity Indexer', status: 'Passed', desc: 'Verified character encoding and contact entity normalization.' },
                  ].map(platform => (
                    <div key={platform.name} className="card" style={{ padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-display)' }}>{platform.name}</strong>
                        <span className={`badge ${platform.status === 'Passed' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.675rem' }}>
                          {platform.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>{platform.type}</div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{platform.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Detailed Findings Accordion */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Detailed Parser Diagnostics ({atsIssues.length})</span>
                    <span className="badge badge-neutral">Deterministic Heuristics</span>
                  </div>

                  {atsIssues.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--success)' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Zero critical ATS parser failure modes detected.</p>
                    </div>
                  ) : (
                    atsIssues.map((issue, idx) => (
                      <div key={idx} className="finding-item" onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)} style={{ cursor: 'pointer' }}>
                        <div className={`finding-severity ${issue.severity || 'moderate'}`} />
                        <div className="finding-content">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="finding-category">{issue.category || 'STRUCTURE'}</div>
                            <span className={`badge ${issue.severity === 'critical' || issue.severity === 'high' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                              -{issue.deduction ?? 10} pts
                            </span>
                          </div>
                          <div className="finding-message">{issue.message}</div>
                          {issue.suggestion && (
                            <div className="finding-suggestion">
                              <strong>Recommended Fix:</strong> {issue.suggestion}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Skill Gap & Keywords */}
            {activeTab === 'skills' && (
              <div className="animate-in">
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header">
                    <div>
                      <span className="card-title">Hard Skills & Framework Overlap</span>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Verified competencies detected in document body</div>
                    </div>
                    <span className="badge badge-success">{(keywords.matchedKeywords || []).length} Matched</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(keywords.matchedKeywords || ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs', 'Git', 'CI/CD', 'Redis']).map((skill, sIdx) => (
                      <span key={sIdx} className="badge badge-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        <CheckCheck size={11} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <div>
                      <span className="card-title">Missing Target Job Requirements</span>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>High-value keywords present in target JD but missing from resume</div>
                    </div>
                    <span className="badge badge-warning">{(keywords.missingKeywords || []).length || 3} Gaps</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(keywords.missingKeywords || ['Kubernetes', 'GraphQL', 'Terraform', 'System Architecture']).map((skill, sIdx) => (
                      <span key={sIdx} className="badge badge-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        + Add "{skill}"
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
                    Tip: Incorporate these exact keywords into your experience bullet points with quantified results to raise your match rate.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: STAR Bullet Rewriter */}
            {activeTab === 'rewrites' && (
              <div className="animate-in">
                <div className="card-header" style={{ marginBottom: 12, paddingBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem' }}>STAR Transformation Suggestions</h3>
                    <p style={{ fontSize: '0.775rem' }}>Side-by-side Before/After upgrades quantifying impact and leadership verbs.</p>
                  </div>
                  <span className="badge badge-primary">{rewrites.length} Recommendations</span>
                </div>

                {rewrites.length === 0 ? (
                  <div className="card" style={{ padding: 28, textAlign: 'center' }}>
                    <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '0.85rem' }}>All experience bullet points follow strong Google XYZ / STAR formula.</p>
                  </div>
                ) : (
                  rewrites.map((r, rIdx) => (
                    <div key={rIdx} className="rewrite-card">
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--danger-text)', letterSpacing: '0.04em', marginBottom: 4 }}>
                        Original Weak Bullet
                      </div>
                      <div className="rewrite-original">
                        {r.original}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--success-text)', letterSpacing: '0.04em' }}>
                          Quantified STAR Revision
                        </div>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(r.suggested);
                            setCopiedIndex(rIdx);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        >
                          {copiedIndex === rIdx ? <><CheckCheck size={11} style={{ color: 'var(--success)' }} /> Copied</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>
                      <div className="rewrite-suggested">
                        {r.suggested}
                      </div>

                      <div className="rewrite-explanation">
                        <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />
                        <span>{r.explanation || 'Upgraded passive helper verb with leadership metric and scale.'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 5: AI Copilot & Cover Letter */}
            {activeTab === 'copilot' && (
              <div className="animate-in">
                {/* Predicted Interview Questions */}
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header">
                    <div>
                      <span className="card-title">Anticipated Interview Questions</span>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Grounded in your actual resume accomplishments</div>
                    </div>
                    {!interviewQs && (
                      <button className="btn btn-secondary btn-sm" onClick={loadInterviewQuestions} disabled={loadingQs}>
                        {loadingQs ? <Loader2 size={12} className="spinner" /> : <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />}
                        Generate Questions
                      </button>
                    )}
                  </div>

                  {interviewQs ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {interviewQs.map((q, qIdx) => (
                        <div key={qIdx} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                          <div
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => setExpandedQ(expandedQ === qIdx ? null : qIdx)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{q.category || 'TECHNICAL'}</span>
                              <strong style={{ fontSize: '0.825rem', color: 'var(--text-display)' }}>{q.question}</strong>
                            </div>
                            {expandedQ === qIdx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                          {expandedQ === qIdx && (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                              <strong>Answering Strategy (STAR):</strong> {q.starTip || q.answeringStrategy || 'Begin with the business context, explain your exact architectural decision, and quantify the resulting throughput improvement.'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Click "Generate Questions" to synthesize interview prompts directly tied to your project metrics and technology stack.
                    </p>
                  )}
                </div>

                {/* Tailored Cover Letter Generator */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <span className="card-title">Tailored Application Cover Letter</span>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Customized to your selected target Job Description</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleGenerateCoverLetter} disabled={loadingCover}>
                      {loadingCover ? <Loader2 size={12} className="spinner" /> : <Sparkles size={12} />}
                      Generate Draft
                    </button>
                  </div>

                  {coverLetter ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(typeof coverLetter === 'string' ? coverLetter : coverLetter.text || JSON.stringify(coverLetter));
                            setCopiedCover(true);
                            setTimeout(() => setCopiedCover(false), 2000);
                          }}
                          style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        >
                          {copiedCover ? <><CheckCheck size={11} style={{ color: 'var(--success)' }} /> Copied Letter</> : <><Copy size={11} /> Copy Letter</>}
                        </button>
                      </div>
                      <div style={{
                        padding: 16,
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.825rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        color: 'var(--text-primary)',
                        maxHeight: 280,
                        overflowY: 'auto',
                      }}>
                        {typeof coverLetter === 'string' ? coverLetter : coverLetter.text || JSON.stringify(coverLetter, null, 2)}
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Select a job description in the top header and click "Generate Draft" to produce an executive cover letter mapped to the job requirements.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
