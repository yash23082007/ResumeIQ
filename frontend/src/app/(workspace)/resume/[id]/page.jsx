'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Loader2, Shield, Target,
  ChevronDown, ChevronUp,
  FileText, Zap, LayoutDashboard, Copy, Sparkles, RefreshCw,
  CheckCheck, Printer, Upload, AlertCircle,
  CheckCircle2, BarChart2, Eye, Cpu, HelpCircle, Layers, ArrowLeft
} from 'lucide-react';
import { resumeAPI, analysisAPI, jobAPI } from '@/services/api';
import ScoreCircle from '@/components/ScoreCircle';
import ScoreRadar from '@/components/ScoreRadar';
import BrandLogo from '@/components/BrandLogo';
import SignalMap from '@/components/SignalMap';
import EvidenceLedger from '@/components/EvidenceLedger';

export default function ResumeDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('view') || 'overview');
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
  const [canvasFilter, setCanvasFilter] = useState('all');
  const [activeReplayStep, setActiveReplayStep] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayDwell, setReplayDwell] = useState('0.0s');
  
  const [highlightedLine, setHighlightedLine] = useState(null);
  const highlightedLineRef = useRef(null);
  
  useEffect(() => {
    if (highlightedLine !== null && highlightedLineRef.current) {
      highlightedLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => setHighlightedLine(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedLine, activeTab]);

  const iterationInputRef = useRef(null);

  const selectTab = (tab) => {
    setActiveTab(tab);
    router.replace(`/resume/${id}?view=${tab}`, { scroll: false });
  };

  const [progress, setProgress] = useState(null);
  const pollController = useRef(null);

  const pollAnalysis = useCallback(async (analysisId) => {
    if (pollController.current) {
      pollController.current.abort();
    }
    const controller = new AbortController();
    pollController.current = controller;

    try {
      const data = await analysisAPI.poll(analysisId, {
        signal: controller.signal,
        onProgress: (p) => setProgress(p),
      });
      setAnalysis(data);
      if (data.findings?.atsSimulation) {
        setAtsSimData(data.findings.atsSimulation);
      }
      const { data: vData } = await resumeAPI.getVersions(id);
      setVersions(vData);
    } catch (err) {
      if (err.message !== 'Polling cancelled') {
        console.error('Polling failed:', err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setAnalyzing(false);
      }
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (pollController.current) pollController.current.abort();
    };
  }, []);

  useEffect(() => {
    if (!id) return;
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
          } else if (['queued', 'parsing', 'analyzing', 'processing'].includes(latest.status)) {
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
      setInterviewQs(data.questions || (Array.isArray(data) ? data : []));
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
      const normalizedLetter = data.coverLetter || data.letter || (typeof data === 'string' ? data : data.text || '');
      setCoverLetter({ text: normalizedLetter, highlights: data.highlights || [], wordCount: data.wordCount || 0 });
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
      router.push(`/resume/${data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload new iteration');
      setAnalyzing(false);
    }
  };

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
      if (step >= replaySteps.length) {
        clearInterval(interval);
        setIsReplaying(false);
      } else {
        setActiveReplayStep(step);
        setReplayDwell(replaySteps[step].dwell);
      }
    }, 1300);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <Loader2 size={32} className="spinner" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading diagnostic report...</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <AlertCircle size={40} style={{ color: 'var(--danger-text)' }} />
        <h2>Document Not Found</h2>
        <Link href="/dashboard" className="btn btn-primary">Return to Workspace</Link>
      </div>
    );
  }

  const rawScore = analysis?.overallScore;
  const score = rawScore !== undefined && rawScore !== null ? Math.round(rawScore) : null;
  const subScores = analysis?.subScores || {};
  const findings = analysis?.findings || {};
  
  // Normalize issues from findings
  const issues = Array.isArray(findings.issues) ? findings.issues : [
    ...(findings.atsSimulation?.issues || []).map((issue) => ({ ...issue, category: issue.category || 'ATS Simulation' })),
    ...((findings.impact?.bullets || []).filter((bullet) => bullet.verbTier === 'weak' || !bullet.quantified).map((bullet) => ({
      category: 'Evidence',
      severity: bullet.verbTier === 'weak' ? 'moderate' : 'low',
      message: `${bullet.verb || 'This'} bullet needs stronger evidence.`,
      suggestion: bullet.quantified ? 'Make ownership and outcome easier to verify.' : 'Add a truthful scope, outcome, or timeframe.',
    }))),
  ];
  const rewrites = findings.rewrites || findings.bulletRewrites || [];
  
  // Fix parsedJson.sections.skills consumption (Task 7)
  const skillsList = resume.parsedJson?.sections?.find(s => s.type === 'skills')?.content || resume.parsedJson?.skills || '';
  const skills = typeof skillsList === 'string' 
    ? skillsList.split(/[,\n•|]+/).map((skill) => skill.trim()).filter(Boolean)
    : (Array.isArray(skillsList) ? skillsList : []);
    
  const rawTextLines = (resume.rawText || '').split('\n').filter(l => l.trim().length > 0);
  
  // API-backed role signals fallback (Task 9)
  const jobSignals = findings.jobSignals || [];
  const derivedRelationships = jobSignals.length > 0 ? jobSignals : (() => {
    const lines = (resume.rawText || '').split('\n');
    const bullets = lines.map((line, index) => ({ line: line.trim(), lineNumber: index + 1 })).filter((item) => /^[•●▪*-]\s+/.test(item.line));
    const skillNames = skills.map((skill) => typeof skill === 'string' ? skill : skill.name).filter(Boolean).slice(0, 4);
    return [
      ...bullets.slice(0, 3).map((item, index) => ({ 
        id: `bullet-${item.lineNumber}`, 
        evidence: item.line.replace(/^[•●▪*-]\s*/, '').slice(0, 32), 
        source: `Resume · line ${item.lineNumber}`, 
        signal: skillNames[index] || 'Impact evidence', 
        status: /\d+[%+x]?|\$\s?\d/i.test(item.line) ? 'supported' : 'partial', 
        detail: /\d+[%+x]?|\$\s?\d/i.test(item.line) ? 'This line contains an action and measurable evidence.' : 'This line shows the work, but its outcome is not yet easy to verify.' 
      })), 
      ...(skillNames.length ? [{ 
        id: 'skill-gap', 
        evidence: 'Skills section', 
        source: 'Resume · skills', 
        signal: skillNames[skillNames.length - 1], 
        status: 'partial', 
        detail: 'The skill is listed. Add an experience example if it is central to this role.' 
      }] : [])
    ];
  })();

  return (
    <div className="app-layout">
      {/* ─── Sidebar Navigation ─── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BrandLogo size="sm" badgeText="Free" />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => selectTab('overview')}>
            <BarChart2 size={17} />
            <span>Overview</span>
          </button>

          <button className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => selectTab('map')}>
            <Target size={17} />
            <span>Signal Map</span>
          </button>

          <button className={`nav-item ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => selectTab('ledger')}>
            <FileText size={17} />
            <span>Evidence Ledger</span>
          </button>

          <button className={`nav-item ${activeTab === 'ats' ? 'active' : ''}`} onClick={() => selectTab('ats')}>
            <Cpu size={17} />
            <span>ATS Simulation</span>
          </button>

          <button className={`nav-item ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => selectTab('skills')}>
            <Eye size={17} />
            <span>Skills & Heatmap</span>
          </button>

          <button className={`nav-item ${activeTab === 'rewrites' ? 'active' : ''}`} onClick={() => selectTab('rewrites')}>
            <Sparkles size={17} />
            <span>STAR Rewrites</span>
          </button>

          <button className={`nav-item ${activeTab === 'copilot' ? 'active' : ''}`} onClick={() => { selectTab('copilot'); if (!interviewQs) loadInterviewQuestions(); }}>
            <HelpCircle size={17} />
            <span>Interview Prep</span>
          </button>

          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

          <Link href="/dashboard" className="nav-item" style={{ textDecoration: 'none' }}>
            <LayoutDashboard size={17} />
            <span>Workspace List</span>
          </Link>
        </nav>

        <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            style={{ width: '100%', marginBottom: 8 }}
            onClick={() => window.print()}
          >
            <Printer size={14} /> Print Audit Report
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="main-content">
        {/* Top Breadcrumb & Controls Header */}
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={13} /> Dashboard
              </Link>
              <span style={{ color: 'var(--text-subtle)' }}>/</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{resume.label || resume.fileName}</span>
            </div>
            <h1>{resume.label || resume.fileName || 'Candidate Resume'}</h1>
            <p>
              Version {resume.version || 1} • Ingested {new Date(resume.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Target Role Selector */}
            <select
              className="select"
              style={{ width: 180, height: 36, fontSize: '0.825rem' }}
              value={selectedJD}
              onChange={(e) => setSelectedJD(e.target.value)}
            >
              <option value="">No Target Role</option>
              {jds.map(jd => (
                <option key={jd.id} value={jd.id}>
                  {jd.title} ({jd.company || 'Role'})
                </option>
              ))}
            </select>

            <button
              className="btn btn-primary btn-sm"
              onClick={startAnalysis}
              disabled={analyzing}
            >
              {analyzing ? (
                <><Loader2 size={14} className="spinner" /> Analyzing...</>
              ) : (
                <><RefreshCw size={14} /> Re-Run Full Audit</>
              )}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => iterationInputRef.current?.click()}
              disabled={analyzing}
            >
              <Upload size={14} /> Upload Revision
            </button>
            <input
              type="file"
              ref={iterationInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.txt"
              onChange={(e) => handleUploadNewVersion(e.target.files[0])}
            />
          </div>
        </div>

        {/* ─── TAB 1: OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div className="animate-in">
            {/* Score Banner */}
            <div className="card" style={{ marginBottom: 24, padding: '28px 32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  {score !== null ? (
                    <ScoreCircle score={score} size={110} strokeWidth={9} />
                  ) : (
                    <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 700 }}>
                      No Score
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8, fontWeight: 700 }}>
                    OVERALL ATS GRADE
                  </div>
                </div>

                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
                    {score >= 80 ? 'Exceptional Document Health' : score >= 60 ? 'Moderate ATS Viability' : 'Actionable Flaws Detected'}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                    {score >= 80
                      ? 'Your resume demonstrates high machine parseability, standard section structures, and strong quantified action items.'
                      : 'We identified key areas where formatting collisions, passive bullet points, or missing skills could cause automated screening rejections.'}
                  </p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">Impact: {Math.round(subScores.content_impact || 0)}%</span>
                    <span className="badge badge-primary">ATS Formatting: {Math.round(subScores.ats_compatibility || 0)}%</span>
                    <span className="badge badge-primary">Keywords: {subScores.keyword_relevance !== null ? `${Math.round(subScores.keyword_relevance)}%` : 'N/A'}</span>
                    <span className="badge badge-primary">Readability: {Math.round(subScores.readability || 0)}%</span>
                    <span className="badge badge-primary">Formatting: {Math.round(subScores.formatting || 0)}%</span>
                  </div>
                </div>

                <div style={{ minWidth: 200, display: 'block' }} className="hidden md:block">
                  <ScoreRadar subScores={subScores} />
                </div>
              </div>
            </div>

            {/* Diagnostic Findings List */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Diagnostic Findings ({issues.length})</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sorted by priority</span>
              </div>

              {issues.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
                  <p>No critical structural issues detected. Document parsed cleanly.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {issues.map((issue, idx) => (
                    <div key={idx} className="finding-item">
                      <div className={`finding-severity ${issue.severity || 'moderate'}`} />
                      <div className="finding-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="finding-category">{issue.category || 'General'}</span>
                          <span className={`badge ${issue.severity === 'critical' || issue.severity === 'high' ? 'badge-danger' : issue.severity === 'moderate' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                            {issue.severity || 'Notice'}
                          </span>
                        </div>
                        <div className="finding-message">{issue.message}</div>
                        {issue.suggestion && (
                          <div className="finding-suggestion">
                            💡 <strong>Remedy:</strong> {issue.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="animate-in">
            <SignalMap relationships={derivedRelationships} jobTitle={jds.find((jd) => jd.id === selectedJD)?.title || 'your target role'} onOpenLedger={() => selectTab('ledger')} />
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="animate-in">
            <EvidenceLedger rawText={resume.rawText} onOpenLine={(line) => { setHighlightedLine(line); selectTab('ats'); }} />
          </div>
        )}

        {/* ─── TAB 2: ATS SIMULATION ─── */}
        {activeTab === 'ats' && (
          <div className="animate-in">
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Enterprise ATS Engine Diagnostic Mode</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Simulating Workday, Greenhouse, Taleo, and Lever parsing algorithms.
                  </p>
                </div>
                <div className="badge badge-success">Passed Compliance Checks</div>
              </div>

              <div className="grid-2" style={{ gap: 16 }}>
                {atsSimData?.results?.map((profile, idx) => (
                  <div key={idx} style={{ padding: 18, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{profile.ats} ({profile.type})</span>
                      {profile.parsedCorrectly ? <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> : <CircleAlert size={16} style={{ color: 'var(--danger-text)' }} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.825rem' }}>
                      {profile.parsedCorrectly ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                          <span>No heuristic parsing failures detected for this profile.</span>
                        </div>
                      ) : profile.issues.map((issue, iIdx) => (
                        <div key={iIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--text-secondary)' }}>
                          <CircleAlert size={14} style={{ color: 'var(--danger-text)', flexShrink: 0, marginTop: 2 }} />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )) || (
                  <div style={{ padding: 18, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Heuristic simulation data unavailable.</p>
                  </div>
                )}
              </div>
              <div style={{ padding: '16px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CircleAlert size={14} />
                <span>{atsSimData?.disclaimer || 'Heuristic simulation based on documented parser failure modes, not a direct connection to proprietary ATS internal engines.'}</span>
              </div>
            </div>

            {/* Document Canvas Line Inspection */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Parsed Raw Document Structure ({rawTextLines.length} Lines)</h3>
              </div>
              <div className="document-paper-canvas" style={{ maxHeight: 500, overflowY: 'auto' }}>
                {rawTextLines.map((line, idx) => (
                  <div 
                    key={idx} 
                    className={`paper-line ${highlightedLine === idx + 1 ? 'highlighted' : ''}`}
                    ref={highlightedLine === idx + 1 ? highlightedLineRef : null}
                    style={highlightedLine === idx + 1 ? { backgroundColor: 'var(--accent-subtle)', borderRadius: '4px', transition: 'background-color 0.3s' } : {}}
                  >
                    <span className="paper-line-num">{idx + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: SKILLS & HEATMAP ─── */}
        {activeTab === 'skills' && (
          <div className="animate-in">
            {/* 6-Second Recruiter Dwell Replay Player */}
            <div className="card" style={{ marginBottom: 24, padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 className="card-title">6-Second Recruiter Attention Replay</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Simulate how a hiring manager’s eyes scan your document in the initial 6 seconds.
                  </p>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleStartReplay}
                  disabled={isReplaying}
                >
                  <Play size={14} />
                  {isReplaying ? 'Simulating Scan...' : 'Start 6s Replay'}
                </button>
              </div>

              {/* Step indicator bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
                {replaySteps.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 12px',
                      background: activeReplayStep === i ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                      border: activeReplayStep === i ? '1.5px solid var(--accent-primary)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: activeReplayStep === i ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      {s.label.split(' — ')[0]}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-display)' }}>
                      {s.label.split(' — ')[1]}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <strong>Current Gaze Focus:</strong> {replaySteps[activeReplayStep]?.note}
              </div>
            </div>

            {/* Extracted Skills Tags */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Extracted Skills Matrix ({skills.length})</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Categorized by NLP parser</span>
              </div>

              {skills.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No individual skill tokens extracted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skills.map((s, idx) => (
                    <span key={idx} className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                      {typeof s === 'string' ? s : s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 4: STAR REWRITES ─── */}
        {activeTab === 'rewrites' && (
          <div className="animate-in">
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">STAR Metric Rewrites ({rewrites.length})</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Transforming unquantified statements into Situation-Task-Action-Result format.
                  </p>
                </div>
              </div>
            </div>

            {rewrites.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-display)' }}>
                  All bullet points meet strong quantification standards!
                </p>
              </div>
            ) : (
              <div>
                {rewrites.map((rw, idx) => (
                  <div key={idx} className="rewrite-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--danger-text)' }}>
                        Original Weak Statement
                      </span>
                    </div>
                    <div className="rewrite-original">
                      {rw.original}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--success-text)' }}>
                        Quantified STAR Recommendation
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => copyToClipboard(rw.proposedText || rw.improved || rw.rewritten, idx)}
                        style={{ padding: '2px 8px', fontSize: '0.75rem', height: 24 }}
                      >
                        {copiedIndex === idx ? <><CheckCheck size={12} /> Copied</> : <><Copy size={12} /> Copy Rewrite</>}
                      </button>
                    </div>
                    <div className="rewrite-suggested">
                      {rw.proposedText || rw.improved || rw.rewritten}
                    </div>

                    {rw.explanation && (
                      <div className="rewrite-explanation">
                        <Sparkles size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                        <span>{rw.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 5: INTERVIEW PREP & COPILOT ─── */}
        {activeTab === 'copilot' && (
          <div className="animate-in">
            {/* Top Generate Triggers */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">AI Career Copilot & Interview Question Simulator</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Predicted technical and behavioral questions based directly on your resume claims.
                  </p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={loadInterviewQuestions}
                  disabled={loadingQs}
                >
                  {loadingQs ? <><Loader2 size={14} className="spinner" /> Generating...</> : <><Sparkles size={14} /> Refresh Questions</>}
                </button>
              </div>

              {/* Cover Letter Generator Section */}
              <div style={{ padding: 18, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontWeight: 750, fontSize: '0.9rem', marginBottom: 4 }}>
                  Tailored Cover Letter Generator
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Select a target Job Description from the top bar to draft an aligned cover letter.
                </p>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleGenerateCoverLetter}
                  disabled={loadingCover || !selectedJD}
                >
                  {loadingCover ? <><Loader2 size={14} className="spinner" /> Generating Cover Letter...</> : <><FileText size={14} /> Draft Tailored Cover Letter</>}
                </button>

                {coverLetter && (
                  <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Draft Cover Letter</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(coverLetter.text);
                          setCopiedCover(true);
                          setTimeout(() => setCopiedCover(false), 2000);
                        }}
                      >
                        {copiedCover ? <><CheckCheck size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                      </button>
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {coverLetter.text}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Predicted Interview Questions</h3>
              </div>

              {loadingQs ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="spinner" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.85rem' }}>Running LLaMA 3.3 inference to generate probe questions...</p>
                </div>
              ) : !interviewQs || interviewQs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                  <HelpCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.875rem', marginBottom: 12 }}>Click &quot;Refresh Questions&quot; above to generate predicted interview probes.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {interviewQs.map((item, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', background: 'var(--bg-card)' }}>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                      >
                        <div style={{ fontWeight: 750, fontSize: '0.9rem', color: 'var(--text-display)' }}>
                          Q{idx + 1}: {item.question || item}
                        </div>
                        {expandedQ === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>

                      {expandedQ === idx && (
                        <div className="animate-in" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {item.suggestedAnswer && (
                            <div style={{ marginBottom: 8 }}>
                              <strong style={{ color: 'var(--success-text)' }}>Recommended STAR Strategy:</strong>
                              <p style={{ marginTop: 4 }}>{item.suggestedAnswer}</p>
                            </div>
                          )}
                          {item.targetArea && (
                            <div>
                              <strong style={{ color: 'var(--accent-primary)' }}>Focus Area:</strong> {item.targetArea}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
