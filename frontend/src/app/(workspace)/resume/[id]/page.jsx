'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Loader2, Shield, Target,
  ChevronDown, ChevronUp,
  FileText, Zap, LayoutDashboard, Copy, Sparkles, RefreshCw,
  CheckCheck, Printer, Upload, AlertCircle,
  CheckCircle2, BarChart2, Eye, Cpu, HelpCircle, ArrowLeft, Download, Link as LinkIcon, BookOpen, CircleAlert
} from 'lucide-react';
import { resumeAPI, analysisAPI, jobAPI } from '@/services/api';
import api from '@/services/api';
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
  const [generatingQs, setGeneratingQs] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [generatingShare, setGeneratingShare] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  
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

  const handleCreateShareLink = async () => {
    try {
      setGeneratingShare(true);
      const res = await api.post(`/share/resume/${id}`, { expiresInHours: 72 });
      if (res.data?.status === 'success') {
        const link = `${window.location.origin}/share/${res.data.data.token}`;
        setShareLink(link);
      }
    } catch (err) {
      console.error('Failed to generate share link', err);
      alert('Could not generate share link.');
    } finally {
      setGeneratingShare(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
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
  
  const skillsList = resume.parsedJson?.sections?.find(s => s.type === 'skills')?.content || resume.parsedJson?.skills || '';
  const skills = typeof skillsList === 'string' 
    ? skillsList.split(/[,\n•|]+/).map((skill) => skill.trim()).filter(Boolean)
    : (Array.isArray(skillsList) ? skillsList : []);
    
  const rawTextLines = (resume.rawText || '').split('\n').filter(l => l.trim().length > 0);
  
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
          <button className={`nav-item ${activeTab === 'interview' ? 'active' : ''}`} onClick={() => selectTab('interview')}>
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

      <div className="main-content">
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
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
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
              className="btn btn-secondary btn-sm"
              onClick={handleCreateShareLink}
              disabled={generatingShare}
            >
              {generatingShare ? <Loader2 size={14} className="spinner" /> : <><LinkIcon size={14} /> Get Review Link</>}
            </button>

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
          </div>
        </div>

        {shareLink && (
          <div className="bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 p-3 rounded-lg mb-4 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[var(--accent-primary)]" />
              <span className="text-sm font-medium">Review link created:</span>
              <a href={shareLink} target="_blank" rel="noreferrer" className="text-sm text-[var(--accent-primary)] hover:underline">{shareLink}</a>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={copyShareLink}><Copy size={14} /> Copy</button>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="animate-in">
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

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Diagnostic Findings ({issues.length})</h3>
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

        {activeTab === 'ats' && (
          <div className="animate-in">
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Enterprise ATS Engine Diagnostic Mode</h3>
                </div>
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

        {activeTab === 'skills' && (
          <div className="animate-in">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Extracted Skills Matrix ({skills.length})</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.map((s, idx) => (
                  <span key={idx} className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    {typeof s === 'string' ? s : s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewrites' && (
          <div className="animate-in">
            {rewrites.map((rw, idx) => (
              <div key={idx} className="rewrite-card">
                <div className="rewrite-original">{rw.original}</div>
                <div className="rewrite-suggested">{rw.proposedText || rw.improved || rw.rewritten}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'interview' && (
          <div className="animate-in">
            <div className="card p-6 border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-secondary)] to-[#1e1a3b]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <BookOpen className="text-purple-400" /> Interview Rehearsal Mode
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    AI predicting behavioral and technical questions grounded specifically in the claims of this resume.
                  </p>
                </div>
                {!interviewData && (
                  <button 
                    className="btn btn-primary"
                    onClick={loadInterviewQuestions}
                    disabled={loadingQs}
                  >
                    {loadingQs ? <span className="spinner" /> : 'Generate Interview Plan'}
                  </button>
                )}
              </div>
              
              {interviewQs && (
                <div className="mt-8 space-y-4">
                  {interviewQs.map((item, idx) => (
                    <div key={idx} className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-color)] relative">
                      <h5 className="font-semibold text-white mb-2 text-sm">{item.question || item}</h5>
                      <div className="mt-4">
                        <textarea 
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md p-3 text-sm focus:outline-none resize-none"
                          placeholder="Jot down your STAR method talking points here..."
                          rows={3}
                        />
                      </div>
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
