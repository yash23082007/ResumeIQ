import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Loader2, Shield, Target,
  BookOpen, CheckCircle, ChevronDown, ChevronUp,
  MessageSquare, FileText, Zap, HelpCircle,
  LayoutDashboard, Copy, Check, Sparkles, RefreshCw,
  Split, TrendingUp, TrendingDown, ArrowRight
} from 'lucide-react';
import { resumeAPI, analysisAPI, jobAPI } from '../services/api';
import ScoreCircle from '../components/ScoreCircle';
import ScoreRadar from '../components/ScoreRadar';
import ThemeToggle from '../components/ThemeToggle';

export default function ResumeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [jds, setJds] = useState([]);
  const [selectedJD, setSelectedJD] = useState('');
  const [interviewQs, setInterviewQs] = useState(null);
  const [loadingQs, setLoadingQs] = useState(false);
  const [versions, setVersions] = useState([]);
  const [atsSimData, setAtsSimData] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [loadingCover, setLoadingCover] = useState(false);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <h2>Resume document not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 16 }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const findings = analysis?.findings || {};
  const subScores = analysis?.subScores || null;

  const views = [
    { id: 'overview', label: 'Overview & Radar', icon: <LayoutDashboard size={15} /> },
    { id: 'ats', label: 'ATS Simulation Matrix', icon: <Shield size={15} /> },
    { id: 'content', label: 'Content & Inspector', icon: <Split size={15} /> },
    { id: 'copilot', label: 'AI Copilot & Tools', icon: <Sparkles size={15} /> },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
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

        <button className="nav-item" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div style={{ marginTop: 16, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', paddingLeft: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Core Modules
          </div>
          {views.map(view => (
            <button
              key={view.id}
              className={`nav-item ${activeView === view.id ? 'active' : ''}`}
              onClick={() => setActiveView(view.id)}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{
          padding: '12px 14px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Appearance</span>
            <ThemeToggle size={15} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header Bar */}
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resume Report</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="badge badge-primary">v{resume.version}</span>
            </div>
            <h1>{resume.label || resume.fileName}</h1>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {jds.length > 0 && (
              <select
                className="select"
                value={selectedJD}
                onChange={(e) => setSelectedJD(e.target.value)}
                style={{ width: 230, padding: '7px 12px', fontSize: '0.825rem' }}
              >
                <option value="">No target job description</option>
                {jds.map(jd => (
                  <option key={jd.id} value={jd.id}>{jd.title} ({jd.company || 'Direct'})</option>
                ))}
              </select>
            )}

            <button
              className="btn btn-primary"
              onClick={startAnalysis}
              disabled={analyzing}
            >
              {analyzing ? (
                <><Loader2 size={15} className="spinner" /> Analyzing...</>
              ) : (
                <><RefreshCw size={15} /> {analysis ? 'Re-Analyze' : 'Start Analysis'}</>
              )}
            </button>
          </div>
        </div>

        {/* Linear-Style Segmented Navigation */}
        <div className="segmented-nav">
          {views.map(view => (
            <button
              key={view.id}
              className={`segmented-item ${activeView === view.id ? 'active' : ''}`}
              onClick={() => setActiveView(view.id)}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>

        {/* Processing State */}
        {analyzing && !analysis && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Loader2 size={40} className="spinner" style={{ margin: '0 auto 16px', color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Executing Neural Evaluation Pipeline</h3>
            <p style={{ maxWidth: 440, margin: '0 auto', fontSize: '0.875rem' }}>
              Simulating enterprise ATS parsers, computing F-pattern recruiter attention, and quantifying bullet achievements.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !analyzing && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Shield size={44} style={{ color: 'var(--accent-primary)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Audit Not Yet Generated</h3>
            <p style={{ maxWidth: 420, margin: '0 auto 20px', fontSize: '0.875rem' }}>
              Run the full analysis engine to evaluate ATS parsability, content impact, keyword overlap, and receive STAR rewrites.
            </p>
            <button className="btn btn-primary" onClick={startAnalysis}>
              <Play size={15} />
              Run Full Analysis
            </button>
          </div>
        )}

        {/* 1. Overview & Intelligence View */}
        {analysis && activeView === 'overview' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="grid-2">
              {/* Score Wheel & Radar */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <ScoreCircle score={analysis.overallScore ?? 0} size={140} label="Composite Score" />
                <div style={{ width: '100%', marginTop: 12 }}>
                  <ScoreRadar subScores={subScores} />
                </div>
              </div>

              {/* Executive Summary & 5-Axis Bars */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Executive Summary</div>
                  <span className="badge badge-neutral">5-Axis Model</span>
                </div>

                {findings.narrative && (
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 18, color: 'var(--text-secondary)' }}>
                    {findings.narrative}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {subScores && Object.entries({
                    content_impact: { label: 'Content Impact', weight: '30%', icon: <Zap size={14} /> },
                    ats_compatibility: { label: 'ATS Compatibility', weight: '25%', icon: <Shield size={14} /> },
                    keyword_relevance: { label: 'Keyword Match', weight: '20%', icon: <Target size={14} /> },
                    formatting: { label: 'Formatting Quality', weight: '15%', icon: <FileText size={14} /> },
                    readability: { label: 'Readability Level', weight: '10%', icon: <BookOpen size={14} /> },
                  }).map(([key, { label, weight, icon }]) => (
                    <SubScoreBar
                      key={key}
                      label={label}
                      weight={weight}
                      icon={icon}
                      score={subScores[key]}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Recruiter Replay & Attention Heatmap Row */}
            <div className="grid-2">
              <RecruiterReplayCard heatmap={findings.heatmap || analysis.heatmapData} parsedJson={resume.parsedJson} />
              <HeatmapCard heatmap={findings.heatmap || analysis.heatmapData} />
            </div>
          </div>
        )}

        {/* 2. ATS Simulation Matrix View */}
        {analysis && activeView === 'ats' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Disclaimer */}
            <div style={{
              padding: '10px 14px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.775rem',
              color: 'var(--text-muted)',
            }}>
              💡 <strong>Heuristic Simulation:</strong> Tests your resume structure against documented parser failure modes for major enterprise platforms.
            </div>

            {/* 4 Engine Cards */}
            <div className="grid-4">
              {(atsSimData?.results || [
                { ats: 'Workday', type: 'Enterprise ATS', parsedCorrectly: findings.ats?.passed, issues: findings.ats?.issues?.slice(0, 1).map(i => i.message) || [] },
                { ats: 'Greenhouse', type: 'Modern ATS', parsedCorrectly: true, issues: [] },
                { ats: 'Taleo', type: 'Legacy ATS', parsedCorrectly: (findings.ats?.score ?? 0) > 70, issues: (findings.ats?.score ?? 0) <= 70 ? ['Single-column layout required'] : [] },
                { ats: 'iCIMS', type: 'Enterprise ATS', parsedCorrectly: true, issues: [] },
              ]).map(engine => (
                <div key={engine.ats} className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{engine.ats}</span>
                    {engine.parsedCorrectly ? (
                      <span className="badge badge-success">Pass</span>
                    ) : (
                      <span className="badge badge-danger">Risk</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', marginTop: 4 }}>{engine.type || 'Platform'}</p>
                </div>
              ))}
            </div>

            {/* ATS Findings & Fix Recommendations */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Detailed ATS Parsing Diagnostics</div>
                <span className="badge badge-primary">{findings.ats?.issues?.length || 0} items</span>
              </div>
              {findings.ats?.issues?.length > 0 ? (
                findings.ats.issues.map((issue, i) => (
                  <FindingItem key={i} issue={issue} />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <CheckCircle size={36} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
                  <h4>Clean ATS Parsability</h4>
                  <p style={{ fontSize: '0.85rem' }}>No layout, font, or header issues detected across tested parsers.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Content & Inspector View */}
        {analysis && activeView === 'content' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Split Screen Line-Linked Inspector */}
            <InspectorSection rawText={resume.rawText} findings={findings} />

            {/* Evidence Mode & Keywords */}
            <div className="grid-2">
              <EvidenceModeCard impact={findings.impact} />
              <KeywordsCard keywords={findings.keywords} selectedJD={selectedJD} />
            </div>

            {/* Readability & Buzzwords */}
            <ReadabilityCard readability={findings.readability} bias={findings.bias} />
          </div>
        )}

        {/* 4. AI Copilot & Tools View */}
        {analysis && activeView === 'copilot' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* AI STAR Rewriter */}
            <RewriterSection rewrites={findings.rewrites} />

            {/* Predicted Interview Questions */}
            <InterviewSection
              questions={interviewQs}
              loading={loadingQs}
              onLoad={loadInterviewQuestions}
            />

            {/* Cover Letter & Version Lab Grid */}
            <div className="grid-2">
              <CoverLetterCard
                coverLetter={coverLetter}
                loading={loadingCover}
                onGenerate={handleGenerateCoverLetter}
                hasSelectedJD={Boolean(selectedJD)}
              />
              <VersionLabCard versions={versions} currentId={resume.id} onSelectVersion={(verId) => navigate(`/resume/${verId}`)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────
function SubScoreBar({ label, weight, icon, score }) {
  if (score === null || score === undefined) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            {icon} {label} <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 400 }}>({weight})</span>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.75rem' }}>N/A (No JD)</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)' }} />
      </div>
    );
  }

  const getColor = (s) => {
    if (s >= 80) return 'var(--score-excellent)';
    if (s >= 60) return 'var(--score-good)';
    if (s >= 40) return 'var(--score-fair)';
    return 'var(--score-poor)';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          {icon} {label} <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 400 }}>({weight})</span>
        </div>
        <span style={{ fontWeight: 700, color: getColor(score), fontSize: '0.85rem' }}>{Math.round(score)}%</span>
      </div>
      <div style={{ height: 5, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: getColor(score),
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

function FindingItem({ issue }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="finding-item" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
      <div className={`finding-severity ${issue.severity || 'medium'}`} />
      <div className="finding-content">
        <div className="finding-category">{issue.category}</div>
        <div className="finding-message">{issue.message}</div>
        {(expanded && issue.suggestion) && (
          <div className="finding-suggestion">
            <strong>Actionable Recommendation:</strong> {issue.suggestion}
          </div>
        )}
      </div>
      {issue.suggestion && (
        expanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      )}
    </div>
  );
}

// ─── Data-Driven Recruiter Replay Card ───────────────
function RecruiterReplayCard({ heatmap, _parsedJson }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate dynamic data-driven timeline steps from parsed sections & heatmap
  const cells = heatmap?.cells || [];
  const timeline = cells.length >= 3 ? cells.slice(0, 5).map((cell, idx) => ({
    time: `${(idx * 1.2).toFixed(1)}s`,
    zone: cell.heading || `Section ${idx + 1}`,
    attention: `${Math.round(cell.attention * 100)}%`,
    insight: `Recruiter eye dwell: ${(cell.attention * 1.8).toFixed(1)}s scan duration.`,
  })) : [
    { time: '0.0s', zone: 'Candidate Header & Title', attention: '95%', insight: 'Validates candidate name, title, and seniority match.' },
    { time: '1.2s', zone: 'Executive Summary', attention: '85%', insight: 'Scans core domain competence and years of experience.' },
    { time: '2.4s', zone: 'Recent Role (Top 2 Bullets)', attention: '90%', insight: 'Checks highest-impact accomplishment and scale.' },
    { time: '4.0s', zone: 'Technical Skills Matrix', attention: '70%', insight: 'Verifies required frameworks and language checklist.' },
    { time: '5.6s', zone: 'Education & Past Roles', attention: '35%', insight: 'Fast pass on degrees and tenure duration.' },
  ];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeline.length]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">6-Second Recruiter Replay</div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { setCurrentStep(0); setIsPlaying(true); }}
          disabled={isPlaying}
        >
          <Play size={13} />
          {isPlaying ? 'Simulating...' : 'Play Replay'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {timeline.map((step, idx) => {
          const isActive = currentStep === idx;
          return (
            <div
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                <span className="badge badge-primary">{step.time}</span>
                <strong>{step.zone}</strong>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{step.attention}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Attention Heatmap Card ──────────────────────────
function HeatmapCard({ heatmap }) {
  const cells = heatmap?.cells || [];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">F-Pattern Attention Density</div>
        <span className="badge badge-neutral">Cognitive Scan</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {cells.map((cell, i) => (
          <div
            key={i}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: `rgba(99, 102, 241, ${Math.max(cell.attention * 0.25, 0.06)})`,
              border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ fontWeight: 600 }}>{cell.heading}</span>
            <span className="badge badge-primary">{Math.round(cell.attention * 100)}% density</span>
          </div>
        ))}
        {cells.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            Run full analysis to compute attention map.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Truly Line-Linked Split Screen Inspector ────────
function InspectorSection({ rawText, findings }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [copied, setCopied] = useState(false);
  const lineRefs = useRef({});

  const lines = rawText.split('\n');

  const allIssues = [
    ...(findings.ats?.issues || []).map(i => ({
      category: 'ATS Issue',
      message: i.message,
      suggestion: i.suggestion,
      severity: 'high',
      searchTarget: i.category === 'structure' ? 'Experience' : 'Education',
    })),
    ...(findings.impact?.bullets?.filter(b => b.verbTier === 'weak' || !b.quantified) || []).map(b => ({
      category: 'Impact Finding',
      message: b.text,
      suggestion: b.suggestion || 'Rewrite with quantified metric (% or $) and active verb.',
      severity: b.verbTier === 'weak' ? 'high' : 'medium',
      searchTarget: b.text.slice(0, 30),
    })),
    ...(findings.readability?.buzzwords || []).map(bw => ({
      category: 'Buzzword Cliché',
      message: `Detected overused buzzword "${bw.term}"`,
      suggestion: bw.suggestion,
      severity: 'low',
      searchTarget: bw.term,
    })),
  ];

  const handleSelectIssue = (idx) => {
    setSelectedIdx(idx);
    const target = allIssues[idx]?.searchTarget?.toLowerCase();
    if (!target) return;

    // Find first matching line index
    const lineIndex = lines.findIndex(l => l.toLowerCase().includes(target));
    if (lineIndex !== -1 && lineRefs.current[lineIndex]) {
      lineRefs.current[lineIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const selectedTarget = selectedIdx !== null ? allIssues[selectedIdx]?.searchTarget?.toLowerCase() : null;

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      {/* Raw Text Box with Line Numbers & Active Highlight */}
      <div className="card" style={{ maxHeight: 440, overflowY: 'auto' }}>
        <div className="card-header">
          <div className="card-title">Document Content</div>
          <span className="badge badge-neutral">{lines.length} lines</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.6 }}>
          {lines.map((line, lIdx) => {
            const isHighlighted = selectedTarget && line.toLowerCase().includes(selectedTarget);
            return (
              <div
                key={lIdx}
                ref={el => { lineRefs.current[lIdx] = el; }}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: isHighlighted ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  borderLeft: isHighlighted ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  transition: 'background 0.2s ease',
                }}
              >
                <span style={{ color: 'var(--text-muted)', userSelect: 'none', width: 24, textAlign: 'right', flexShrink: 0 }}>
                  {lIdx + 1}
                </span>
                <span style={{ color: isHighlighted ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {line || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issues Queue */}
      <div className="card" style={{ maxHeight: 440, overflowY: 'auto' }}>
        <div className="card-header">
          <div className="card-title">Interactive Audit Queue</div>
          <span className="badge badge-primary">{allIssues.length} items</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {allIssues.map((issue, idx) => (
            <div
              key={idx}
              className="finding-item"
              style={{
                cursor: 'pointer',
                borderColor: selectedIdx === idx ? 'var(--accent-primary)' : 'var(--border)',
                background: selectedIdx === idx ? 'var(--accent-subtle)' : 'var(--bg-card)',
                padding: '10px 12px',
              }}
              onClick={() => handleSelectIssue(idx)}
            >
              <div className={`finding-severity ${issue.severity}`} />
              <div className="finding-content">
                <span className="finding-category">{issue.category}</span>
                <div className="finding-message" style={{ fontSize: '0.8rem' }}>{issue.message}</div>
                {selectedIdx === idx && issue.suggestion && (
                  <div style={{ marginTop: 8 }}>
                    <div className="finding-suggestion" style={{ fontSize: '0.75rem' }}>{issue.suggestion}</div>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: 6 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(issue.suggestion);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Suggestion</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Evidence Mode Card ──────────────────────────────
function EvidenceModeCard({ impact }) {
  const bullets = impact?.bullets || [];

  return (
    <div className="card" style={{ maxHeight: 360, overflowY: 'auto' }}>
      <div className="card-header">
        <div className="card-title">Evidence & Proof Classifier</div>
        <span className="badge badge-neutral">{bullets.length} bullets</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <div style={{ marginBottom: 4 }}>{b.text}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {b.quantified ? (
                <span className="badge badge-success">Proof Quantified</span>
              ) : (
                <span className="badge badge-warning">Missing Metric</span>
              )}
              <span className={`badge ${b.verbTier === 'strong' ? 'badge-success' : b.verbTier === 'weak' ? 'badge-danger' : 'badge-neutral'}`}>
                {b.verbTier} verb: {b.verb}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Competency & Keywords Card ──────────────────────
function KeywordsCard({ keywords, selectedJD }) {
  const hasJD = Boolean(selectedJD);

  if (!hasJD) {
    return (
      <div className="card" style={{ maxHeight: 360, overflowY: 'auto' }}>
        <div className="card-header">
          <div className="card-title">Competency Alignment</div>
          <span className="badge badge-neutral">No Target JD</span>
        </div>
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <Target size={36} style={{ color: 'var(--accent-primary)', margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '0.95rem' }}>No Target Job Description Selected</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Select a target position from the header dropdown to evaluate required competency coverage and missing skills.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxHeight: 360, overflowY: 'auto' }}>
      <div className="card-header">
        <div className="card-title">Competency Alignment</div>
        <span className="badge badge-primary">{keywords?.score ?? 0}% match</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', display: 'block', marginBottom: 4 }}>
          MATCHED COMPETENCIES ({keywords?.matched?.length || 0})
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(keywords?.matched || []).map((k, i) => (
            <span key={i} className="badge badge-success">{k}</span>
          ))}
          {(!keywords?.matched || keywords.matched.length === 0) && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None found</span>
          )}
        </div>
      </div>

      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', display: 'block', marginBottom: 4 }}>
          MISSING SKILLS ({keywords?.missing?.length || 0})
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(keywords?.missing || []).map((k, i) => (
            <span key={i} className="badge badge-danger">{k}</span>
          ))}
          {(!keywords?.missing || keywords.missing.length === 0) && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All target keywords present!</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Readability Card ────────────────────────────────
function ReadabilityCard({ readability, bias }) {
  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Readability Metrics</div>
          <span className="badge badge-neutral">Flesch Scale</span>
        </div>
        <div className="grid-2" style={{ gap: 10 }}>
          <div className="stat-card" style={{ padding: '12px 14px' }}>
            <div className="stat-label">Reading Ease</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>{readability?.fleschReadingEase ?? 50}</div>
          </div>
          <div className="stat-card" style={{ padding: '12px 14px' }}>
            <div className="stat-label">Grade Level</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>{readability?.fleschKincaidGrade ? `Gr. ${readability.fleschKincaidGrade}` : '—'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Clichés & Inclusivity</div>
          <span className="badge badge-warning">{(readability?.buzzwords?.length || 0) + (bias?.flags?.length || 0)} flags</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(readability?.buzzwords || []).map((bw, i) => (
            <span key={i} className="badge badge-warning">"{bw.term}"</span>
          ))}
          {(bias?.flags || []).map((f, i) => (
            <span key={i} className="badge badge-info">{f.type}: {f.message}</span>
          ))}
          {(!readability?.buzzwords?.length && !bias?.flags?.length) && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clean document — no clichés or bias detected.</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Rewriter Section ────────────────────────────────
function RewriterSection({ rewrites }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!rewrites || rewrites.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 16px' }}>
        <Sparkles size={32} style={{ color: 'var(--accent-primary)', margin: '0 auto 10px' }} />
        <h4>AI STAR Rewrites</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Connect an active LLM API key to receive metric-quantified revisions.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">STAR-Format Quantified Rewrites</div>
        <span className="badge badge-primary">{rewrites.length} suggestions</span>
      </div>

      {rewrites.map((rw, i) => (
        <div key={i} className="rewrite-card">
          <div className="rewrite-original">
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--danger)', display: 'block', marginBottom: 2 }}>
              ORIGINAL PHRASING
            </span>
            {rw.original}
          </div>
          {rw.rewritten && (
            <div className="rewrite-suggested">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--success)' }}>
                  STAR REVISION
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(rw.rewritten);
                    setCopiedIdx(i);
                    setTimeout(() => setCopiedIdx(null), 2000);
                  }}
                >
                  {copiedIdx === i ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
              {rw.rewritten}
            </div>
          )}
          <div className="rewrite-explanation">
            <strong>Rationale:</strong> {rw.explanation}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Interview Section ───────────────────────────────
function InterviewSection({ questions, loading, onLoad }) {
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 16px' }}>
        <Loader2 size={28} className="spinner" style={{ margin: '0 auto 10px', color: 'var(--accent-primary)' }} />
        <p style={{ fontSize: '0.85rem' }}>Synthesizing grounded interview questions...</p>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 16px' }}>
        <HelpCircle size={36} style={{ color: 'var(--accent-primary)', margin: '0 auto 12px' }} />
        <h4>Anticipated Interview Questions</h4>
        <p style={{ fontSize: '0.85rem', maxWidth: 420, margin: '0 auto 16px' }}>
          Generate tailored behavioral and technical questions based on your resume achievements.
        </p>
        <button className="btn btn-primary" onClick={onLoad}>
          <MessageSquare size={14} />
          Generate Questions
        </button>
      </div>
    );
  }

  const qs = questions.questions || [];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Predicted Interview Questions & Strategies</div>
        <span className="badge badge-primary">{qs.length} questions</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {qs.map((q, i) => (
          <div key={i} className="card" style={{ padding: '12px 16px', background: 'var(--bg-subtle)', boxShadow: 'none' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{q.question}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Context: {q.context}</div>
            <div className="finding-suggestion" style={{ fontSize: '0.775rem' }}>
              💡 <strong>Strategy:</strong> {q.tip}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cover Letter Card (Fixed Output Handler) ────────
function CoverLetterCard({ coverLetter, loading, onGenerate, hasSelectedJD }) {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 16px' }}>
        <Loader2 size={24} className="spinner" style={{ margin: '0 auto 10px', color: 'var(--accent-primary)' }} />
        <p style={{ fontSize: '0.85rem' }}>Drafting customized cover letter...</p>
      </div>
    );
  }

  if (!coverLetter) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 16px' }}>
        <FileText size={32} style={{ color: 'var(--accent-primary)', margin: '0 auto 10px' }} />
        <h4>Tailored Cover Letter</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          {hasSelectedJD ? 'Generate a custom pitch matching target JD requirements.' : 'Select a Job Description above to generate.'}
        </p>
        <button className="btn btn-primary btn-sm" onClick={onGenerate} disabled={!hasSelectedJD}>
          Generate Letter
        </button>
      </div>
    );
  }

  const letterText = coverLetter.coverLetter || coverLetter.body || coverLetter.letter || (typeof coverLetter === 'string' ? coverLetter : '');

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Generated Cover Letter</div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            navigator.clipboard.writeText(letterText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <div style={{
        padding: '12px 14px',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.8rem',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        maxHeight: 220,
        overflowY: 'auto',
      }}>
        {letterText}
      </div>
    </div>
  );
}

// ─── Version Lab Card (With Deltas & Direct Navigation) ──
function VersionLabCard({ versions, currentId, onSelectVersion }) {
  // Sort ascending to calculate version-to-version score delta
  const sorted = [...versions].sort((a, b) => a.version - b.version);
  const versionMap = {};
  sorted.forEach((ver, idx) => {
    const prev = idx > 0 ? sorted[idx - 1] : null;
    const delta = prev && ver.latestScore !== null && prev.latestScore !== null
      ? ver.latestScore - prev.latestScore
      : 0;
    versionMap[ver.id] = delta;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Version Lab</div>
        <span className="badge badge-neutral">{versions.length} revisions</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {versions.map(ver => {
          const delta = versionMap[ver.id] || 0;
          const isCurrent = ver.id === currentId;

          return (
            <div
              key={ver.id}
              onClick={() => !isCurrent && onSelectVersion(ver.id)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: isCurrent ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                border: isCurrent ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                cursor: isCurrent ? 'default' : 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>v{ver.version}</strong>
                <span style={{ color: 'var(--text-muted)' }}>• {new Date(ver.createdAt).toLocaleDateString()}</span>
                {delta > 0 && (
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                    <TrendingUp size={11} /> +{delta} pts
                  </span>
                )}
                {delta < 0 && (
                  <span className="badge badge-danger" style={{ fontSize: '0.68rem' }}>
                    <TrendingDown size={11} /> {delta} pts
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ScoreCircle score={ver.latestScore ?? 0} size={32} showLabel={false} />
                {!isCurrent && <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
