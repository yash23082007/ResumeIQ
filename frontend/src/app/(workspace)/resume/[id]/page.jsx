'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Loader2, Shield, Target,
  ChevronDown, ChevronUp,
  FileText, Zap, LayoutDashboard, Copy, Sparkles, RefreshCw,
  CheckCheck, Printer, Upload, AlertCircle,
  CheckCircle2, BarChart2, Eye, Cpu, HelpCircle, ArrowLeft, Download, Link as LinkIcon, BookOpen, CircleAlert,
  Flame, GitBranch, ExternalLink, Award, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { resumeAPI, analysisAPI, jobAPI, getApiErrorMessage } from '@/services/api';
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
  const [loadError, setLoadError] = useState('');
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

  // AI Roast & Proof-of-Work States
  const [roastContent, setRoastContent] = useState('');
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastError, setRoastError] = useState('');
  const [powData, setPowData] = useState(null);
  const [loadingPow, setLoadingPow] = useState(false);
  const [showFPatternOverlay, setShowFPatternOverlay] = useState(false);

  const handleStartRoast = async () => {
    setIsRoasting(true);
    setRoastContent('');
    setRoastError('');
    try {
      const res = await fetch(`/api/resumes/${id}/roast`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                setRoastContent((prev) => prev + parsed.chunk);
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      setRoastError('Failed to stream AI roast: ' + (err.message || 'Network error'));
    } finally {
      setIsRoasting(false);
    }
  };

  const handleFetchPow = async () => {
    setLoadingPow(true);
    try {
      const res = await api.get(`/resumes/${id}/proof-of-work`);
      setPowData(res.data);
    } catch (err) {
      console.warn('PoW fetch failed:', err);
    } finally {
      setLoadingPow(false);
    }
  };
  
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
        if (isMounted) {
          setLoadError(getApiErrorMessage(err, 'The resume could not be loaded.'));
          setLoading(false);
        }
      });

    jobAPI.list().then(({ data }) => { if (isMounted) setJds(data); }).catch(() => {});
    resumeAPI.getVersions(id).then(({ data }) => { if (isMounted) setVersions(data); }).catch(() => {});
    resumeAPI.getATSSimulation(id).then(({ data }) => { if (isMounted) setAtsSimData(data); }).catch(() => {});
    api.get(`/resumes/${id}/proof-of-work`).then(({ data }) => { if (isMounted) setPowData(data); }).catch(() => {});

    return () => { isMounted = false; };
  }, [id, pollAnalysis]);

  const startAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data } = await resumeAPI.analyze(id, selectedJD || null);
      pollAnalysis(data.analysisId);
    } catch (err) {
      setAnalyzing(false);
      alert(getApiErrorMessage(err, 'Analysis failed.'));
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
      alert(getApiErrorMessage(err, 'Failed to generate cover letter.'));
    } finally {
      setLoadingCover(false);
    }
  };

  const replayIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    };
  }, []);

  const handleUploadNewVersion = async (file) => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const { data } = await resumeAPI.upload(
        file,
        `${resume.label || resume.fileName} (v${(resume.version || 1) + 1})`,
        resume.id
      );
      router.push(`/resume/${data.id}`);
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to upload new iteration.'));
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
    if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    
    setIsReplaying(true);
    setActiveReplayStep(0);
    setReplayDwell(replaySteps[0].dwell);

    let step = 0;
    replayIntervalRef.current = setInterval(() => {
      step++;
      if (step >= replaySteps.length) {
        clearInterval(replayIntervalRef.current);
        replayIntervalRef.current = null;
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

  if (loadError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <AlertCircle size={40} style={{ color: 'var(--danger-text)' }} />
        <h2>{loadError}</h2>
        <Link href="/dashboard" className="btn btn-primary">Return to Workspace</Link>
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
  
  const rawSkills = resume.parsedJson?.sections?.skills?.content 
    || (Array.isArray(resume.parsedJson?.sections) ? resume.parsedJson?.sections?.find(s => s.type === 'skills' || s.id === 'skills')?.content : null)
    || resume.parsedJson?.skills 
    || '';

  const skills = typeof rawSkills === 'string' 
    ? rawSkills.split(/[,\n•|;]+/).map((skill) => skill.trim().replace(/^[-*•]\s*/, '')).filter(Boolean)
    : (Array.isArray(rawSkills) ? rawSkills : []);
    
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

  const atsResults = atsSimData?.results || findings.atsSimulation?.results || [
    { ats: 'Workday', type: 'Enterprise ATS', parsedCorrectly: true, issues: [], confidence: 'high' },
    { ats: 'Greenhouse', type: 'Modern ATS', parsedCorrectly: true, issues: [], confidence: 'high' },
    { ats: 'Taleo', type: 'Legacy ATS', parsedCorrectly: true, issues: [], confidence: 'high' },
    { ats: 'Lever', type: 'Modern Tech ATS', parsedCorrectly: true, issues: [], confidence: 'high' },
    { ats: 'iCIMS', type: 'Enterprise ATS', parsedCorrectly: true, issues: [], confidence: 'high' },
  ];

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
          <button className={`nav-item ${activeTab === 'roast' ? 'active' : ''}`} onClick={() => selectTab('roast')}>
            <Flame size={17} style={{ color: '#f97316' }} />
            <span>AI Roast 🔥</span>
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
                    COMPOSITE AUDIT SCORE
                  </div>
                </div>

                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
                    {score >= 80 ? 'Exceptional Document Health' : score >= 60 ? 'Moderate Document Health' : 'Actionable Flaws Detected'}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                    {score >= 80
                      ? 'Your resume demonstrates high machine parseability, standard section structures, and strong quantified action items.'
                      : 'We identified key areas where formatting collisions, passive bullet points, or missing skills could cause automated screening friction.'}
                  </p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-primary">Impact: {Math.round(subScores.content_impact || 0)}%</span>
                    <span className="badge badge-primary">ATS Formatting: {Math.round(subScores.ats_compatibility || 0)}%</span>
                    <span className="badge badge-primary">Role Match: {subScores.keyword_relevance !== null ? `${Math.round(subScores.keyword_relevance)}%` : 'N/A'}</span>
                    <span className="badge badge-primary">Readability: {Math.round(subScores.readability || 0)}%</span>
                    <span className="badge badge-primary">Formatting: {Math.round(subScores.formatting || 0)}%</span>
                  </div>
                </div>

                <div style={{ minWidth: 200, display: 'block' }} className="hidden md:block">
                  <ScoreRadar subScores={subScores} />
                </div>
              </div>
            </div>

            {/* Proof-of-Work Verification Card */}
            <div className="card p-6 border border-[var(--border-color)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="card-title text-base font-bold flex items-center gap-2">
                    <Award className="text-amber-400" size={18} /> Proof-of-Work Verification (Developer Ledger)
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {powData ? powData.summary : 'Public cryptographic verification against GitHub and Codeforces APIs.'}
                  </p>
                </div>
                {powData && (
                  <span className={`badge ${powData.hasProofOfWork ? 'badge-success text-emerald-400' : 'badge-warning text-amber-400'}`}>
                    Trust Score: {powData.trustScore}/100
                  </span>
                )}
              </div>

              {powData?.profiles && powData.profiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {powData.profiles.map((prof, pIdx) => (
                    <div key={pIdx} className="p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <GitBranch size={14} className="text-cyan-400" />
                          <span className="font-bold text-sm text-white">{prof.platform}</span>
                          <span className="text-xs text-[var(--text-muted)]">@{prof.handle}</span>
                        </div>
                        <div className="text-xs font-semibold text-emerald-400 mt-1.5 flex items-center gap-1">
                          <Check size={12} /> {prof.badge || 'Verified Profile'}
                        </div>
                        {prof.publicRepos !== undefined && (
                          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                            {prof.publicRepos} public repos · {prof.followers || 0} followers
                          </div>
                        )}
                        {prof.rating !== undefined && (
                          <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                            Rating: {prof.rating} (Peak: {prof.maxRating}) · Rank: {prof.rank}
                          </div>
                        )}
                      </div>
                      {prof.url && (
                        <a href={prof.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm p-1 text-[var(--text-muted)] hover:text-white">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-muted)]">
                    No public GitHub or Codeforces portfolio link detected. Add your links to verify coding activity.
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={handleFetchPow} disabled={loadingPow}>
                    {loadingPow ? <Loader2 size={13} className="animate-spin" /> : 'Scan Developer Links'}
                  </button>
                </div>
              )}
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
          <div className="animate-in space-y-6">
            <div className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="card-title text-xl font-bold flex items-center gap-2">
                    <Cpu className="text-[var(--accent-primary)]" /> ATS Simulation Matrix
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Heuristic simulation based on documented parser failure modes — not a direct connection to proprietary vendor engines.
                  </p>
                </div>
                <span className="badge badge-primary">{atsResults.length} Engines Tested</span>
              </div>

              {issues.some(i => i.category === 'security' || (i.message && i.message.toLowerCase().includes('ghost'))) && (
                <div className="p-4 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400">
                  <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-400" />
                  <div>
                    <h4 className="font-bold text-sm text-red-300">Security Alert: Invisible / Micro-Font "Ghost Text" Detected</h4>
                    <p className="text-xs text-red-300/90 mt-1 leading-relaxed">
                      Micro-font or background-matching text was extracted from this resume. Modern enterprise ATS platforms (Workday, Greenhouse, Lever) flag hidden keyword stuffing and apply automatic disqualification penalties.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {atsResults.map((ats, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${ats.parsedCorrectly ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-bold text-sm">{ats.ats}</h4>
                        <span className="text-xs text-[var(--text-muted)]">{ats.type}</span>
                      </div>
                      <span className={`badge ${ats.parsedCorrectly ? 'badge-success text-emerald-400' : 'badge-warning text-amber-400'}`}>
                        {ats.parsedCorrectly ? 'Compatible' : 'Risks Detected'}
                      </span>
                    </div>
                    {ats.issues && ats.issues.length > 0 ? (
                      <ul className="text-xs space-y-1 text-amber-300/90 mt-2 list-disc list-inside">
                        {ats.issues.map((iss, iIdx) => <li key={iIdx}>{iss}</li>)}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-400/90 mt-2">✓ No layout scrambles or structural drops expected.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header flex justify-between items-center">
                <div>
                  <h3 className="card-title">Plain-Text Reading Stream & Eye-Tracking Overlay</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Linear reading order extracted from the document with F-Pattern cognitive model.</p>
                </div>
                <button 
                  className={`btn btn-sm ${showFPatternOverlay ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setShowFPatternOverlay(!showFPatternOverlay)}
                >
                  <Eye size={13} /> {showFPatternOverlay ? 'Hide Gaze Heatmap' : 'Overlay F-Pattern Heatmap'}
                </button>
              </div>
              <div className="document-paper-canvas" style={{ maxHeight: 450, overflowY: 'auto' }}>
                {rawTextLines.map((line, idx) => {
                  const total = rawTextLines.length || 1;
                  const ratio = idx / total;
                  const gazeWeight = ratio < 0.15 ? 0.94 : ratio < 0.35 ? 0.76 : ratio < 0.60 ? 0.48 : 0.22;
                  const gazeColor = ratio < 0.15 ? '#ef4444' : ratio < 0.35 ? '#f59e0b' : ratio < 0.60 ? '#8b5cf6' : '#64748b';
                  const gazeBg = ratio < 0.15 ? 'rgba(239, 68, 68, 0.08)' : ratio < 0.35 ? 'rgba(245, 158, 11, 0.06)' : ratio < 0.60 ? 'rgba(139, 92, 246, 0.05)' : 'transparent';

                  return (
                    <div 
                      key={idx} 
                      className={`paper-line ${highlightedLine === idx + 1 ? 'highlighted' : ''}`}
                      ref={highlightedLine === idx + 1 ? highlightedLineRef : null}
                      style={{
                        backgroundColor: highlightedLine === idx + 1 ? 'var(--accent-subtle)' : showFPatternOverlay ? gazeBg : undefined,
                        borderLeft: showFPatternOverlay ? `3px solid ${gazeColor}` : undefined,
                        paddingLeft: showFPatternOverlay ? '8px' : undefined,
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                        <span className="paper-line-num">{idx + 1}</span>
                        <span className="truncate">{line}</span>
                      </div>
                      {showFPatternOverlay && (
                        <span style={{ fontSize: '10px', color: gazeColor, fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
                          {Math.round(gazeWeight * 100)}% gaze
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="animate-in space-y-6">
            <div className="card p-6">
              <div className="card-header">
                <h3 className="card-title">Extracted Skills Matrix ({skills.length})</h3>
                <p className="text-xs text-[var(--text-secondary)]">Technical keywords, frameworks, and domain competencies found in the document.</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} className="mt-4">
                {skills.map((s, idx) => (
                  <span key={idx} className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    {typeof s === 'string' ? s : s.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="card-title flex items-center gap-2">
                    <Eye className="text-purple-400" /> 6-Second Recruiter Attention Model
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Heuristic cognitive eye-tracking simulation modeling the F-pattern reading flow.
                  </p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleStartReplay} disabled={isReplaying}>
                  {isReplaying ? `Replaying (${replayDwell})...` : 'Start 6-Sec Scan Replay'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-4">
                {replaySteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border text-left transition-all ${activeReplayStep === idx && isReplaying ? 'border-purple-500 bg-purple-500/20 scale-[1.02]' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'}`}
                  >
                    <div className="text-xs font-bold text-purple-300 mb-1">{step.label}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{step.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewrites' && (
          <div className="animate-in space-y-4">
            <div className="card p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <h3 className="font-semibold text-sm">STAR Bullet Revisions</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Suggested improvements for weak action verbs or unquantified bullets. Click copy to grab any approved version.
              </p>
            </div>
            {rewrites.length === 0 ? (
              <div className="card p-8 text-center text-[var(--text-muted)]">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                <p>All bullet points use strong verbs and measurable metrics. No rewrites needed!</p>
              </div>
            ) : (
              rewrites.map((rw, idx) => (
                <div key={idx} className="rewrite-card p-5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]">
                  <div className="text-xs text-red-400 mb-1 font-mono uppercase">Original Bullet:</div>
                  <div className="text-sm text-[var(--text-secondary)] line-through mb-3">{rw.original}</div>
                  
                  <div className="text-xs text-emerald-400 mb-1 font-mono uppercase">Proposed STAR Version:</div>
                  <div className="text-sm text-white font-medium mb-3">{rw.proposedText || rw.improved || rw.rewritten}</div>
                  
                  {rw.explanation && (
                    <div className="text-xs text-[var(--text-muted)] mb-3">💡 {rw.explanation}</div>
                  )}

                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyToClipboard(rw.proposedText || rw.improved || rw.rewritten, idx)}
                  >
                    {copiedIndex === idx ? <><CheckCheck size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy Revised Bullet</>}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'interview' && (
          <div className="animate-in">
            <div className="card p-6 border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-secondary)] to-[#1e1a3b]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <BookOpen className="text-purple-400" /> Grounded Interview Prep
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Questions derived specifically from your resume claims and target technologies.
                  </p>
                </div>
                {!interviewQs && (
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-outline uppercase text-[10px]">{item.type || 'Question'}</span>
                        {item.context && <span className="text-xs text-[var(--text-muted)]">Source: {item.context}</span>}
                      </div>
                      <h5 className="font-semibold text-white mb-2 text-sm">{item.question || item}</h5>
                      {item.tip && (
                        <p className="text-xs text-purple-300/90 mb-3 bg-purple-500/10 p-2.5 rounded border border-purple-500/20">
                          🎯 <strong>Coaching Tip:</strong> {item.tip}
                        </p>
                      )}
                      <div className="mt-3">
                        <textarea 
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md p-3 text-sm focus:outline-none resize-none"
                          placeholder="Jot down your STAR method talking points here..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'roast' && (
          <div className="animate-in space-y-4">
            <div className="card p-6 border border-orange-500/30 bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-primary)] to-orange-950/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-orange-400">
                    <Flame size={20} className="text-orange-500" /> AI Recruiter Roast (Brutal Mode)
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    A hyper-critical, cynical, yet hilarious Silicon Valley recruiter tear-down of your resume. Streamed live token-by-token.
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderColor: '#ea580c' }}
                  onClick={handleStartRoast}
                  disabled={isRoasting}
                >
                  {isRoasting ? (
                    <><Loader2 size={15} className="animate-spin" /> Roasting In Progress...</>
                  ) : (
                    <><Flame size={15} /> {roastContent ? 'Re-Run AI Roast' : 'Unleash AI Roast'}</>
                  )}
                </button>
              </div>

              {roastError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm mb-4">
                  {roastError}
                </div>
              )}

              {!roastContent && !isRoasting && (
                <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-lg mt-4">
                  <Flame size={40} className="text-orange-500 mx-auto mb-3 opacity-60" />
                  <h4 className="font-bold text-sm text-white mb-1">Ready for the Unvarnished Truth?</h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-4">
                    Our AI Staff Recruiter has reviewed 50,000+ technical resumes. Click above to expose buzzword fatigue, passive duty lists, and fluffy claims before applying.
                  </p>
                  <button className="btn btn-secondary btn-sm" onClick={handleStartRoast}>
                    Run Diagnostics Roast
                  </button>
                </div>
              )}

              {(roastContent || isRoasting) && (
                <div className="mt-4 p-5 rounded-lg bg-black/40 border border-orange-500/20 font-sans text-sm leading-relaxed text-gray-200">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      {isRoasting ? 'Streaming tokens from AI Recruiter...' : 'Roast Complete · 4 Diagnostics Sections'}
                    </span>
                    {roastContent && (
                      <button
                        className="btn btn-ghost btn-sm text-xs py-0.5 px-2"
                        onClick={() => copyToClipboard(roastContent, 'roast')}
                      >
                        {copiedIndex === 'roast' ? 'Copied' : 'Copy Roast'}
                      </button>
                    )}
                  </div>
                  <div className="prose prose-invert max-w-none text-sm space-y-3">
                    <ReactMarkdown>{roastContent}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
