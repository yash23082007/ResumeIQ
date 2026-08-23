import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Loader2, Shield, Target,
  BookOpen, Eye, CheckCircle, ChevronDown, ChevronUp,
  MessageSquare, FileText, Zap, HelpCircle,
  LayoutDashboard, Copy, Check, Sparkles, RefreshCw,
  Layers, Clock, Split, FileCheck
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
  const [activeTab, setActiveTab] = useState('overview');
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
      <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
        <h2>Resume document not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 'var(--space-lg)' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const findings = analysis?.findings || {};
  const subScores = analysis?.subScores || null;

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: <LayoutDashboard size={15} /> },
    { id: 'inspector', label: 'Resume Inspector', icon: <Split size={15} /> },
    { id: 'ats', label: 'ATS Simulation', icon: <Shield size={15} /> },
    { id: 'replay', label: 'Recruiter Replay', icon: <Clock size={15} /> },
    { id: 'evidence', label: 'Evidence Mode', icon: <FileCheck size={15} /> },
    { id: 'impact', label: 'Impact & Verbs', icon: <Zap size={15} /> },
    { id: 'keywords', label: 'Keyword Alignment', icon: <Target size={15} /> },
    { id: 'readability', label: 'Readability & Bias', icon: <BookOpen size={15} /> },
    { id: 'heatmap', label: 'Attention Heatmap', icon: <Eye size={15} /> },
    { id: 'rewrites', label: 'AI STAR Rewriter', icon: <Sparkles size={15} /> },
    { id: 'versions', label: 'Version Lab', icon: <Layers size={15} /> },
    { id: 'interview', label: 'Predicted Qs', icon: <HelpCircle size={15} /> },
    { id: 'coverletter', label: 'Cover Letter', icon: <FileText size={15} /> },
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

        <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', paddingLeft: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Analysis Modules
          </div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'interview' && !interviewQs) loadInterviewQuestions();
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{
          padding: 'var(--space-md)',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Theme</span>
            <ThemeToggle size={16} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header Bar */}
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resume Analysis</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="badge badge-primary">Version {resume.version}</span>
            </div>
            <h1>{resume.label || resume.fileName}</h1>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            {jds.length > 0 && (
              <select
                className="select"
                value={selectedJD}
                onChange={(e) => setSelectedJD(e.target.value)}
                style={{ width: 220, padding: '7px 12px', fontSize: '0.825rem' }}
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
                <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Analyzing...</>
              ) : (
                <><RefreshCw size={16} /> {analysis ? 'Re-Analyze' : 'Start Full Analysis'}</>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="tab-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'interview' && !interviewQs) loadInterviewQuestions();
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Analysis Running State */}
        {analyzing && !analysis && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
            <Loader2 size={48} style={{ color: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-lg)' }} />
            <h3>Executing Semantic Intelligence Pipeline...</h3>
            <p style={{ maxWidth: 460, margin: 'var(--space-sm) auto 0' }}>
              Simulating ATS parsers (Workday, Greenhouse, Taleo, iCIMS), calculating F-pattern eye tracking, and generating AI coaching suggestions.
            </p>
          </div>
        )}

        {/* Empty State / Not Analyzed Yet */}
        {!analysis && !analyzing && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
            <Shield size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto var(--space-lg)' }} />
            <h3>Ready for Comprehensive Audit</h3>
            <p style={{ maxWidth: 440, margin: '0 auto var(--space-lg)' }}>
              Click "Start Full Analysis" to evaluate content impact, ATS compatibility, semantic keywords, readability, and AI STAR rewrites.
            </p>
            <button className="btn btn-primary btn-lg" onClick={startAnalysis}>
              <Play size={18} />
              Run Full Analysis Now
            </button>
          </div>
        )}

        {/* Tab Views */}
        {analysis && activeTab === 'overview' && (
          <OverviewTab analysis={analysis} findings={findings} subScores={subScores} />
        )}

        {analysis && activeTab === 'inspector' && (
          <InspectorTab rawText={resume.rawText} findings={findings} />
        )}

        {analysis && activeTab === 'ats' && (
          <ATSTab ats={findings.ats} atsSim={atsSimData || findings.atsSimulation} />
        )}

        {analysis && activeTab === 'replay' && (
          <RecruiterReplayTab />
        )}

        {analysis && activeTab === 'evidence' && (
          <EvidenceModeTab impact={findings.impact} />
        )}

        {analysis && activeTab === 'impact' && (
          <ImpactTab impact={findings.impact} />
        )}

        {analysis && activeTab === 'keywords' && (
          <KeywordsTab keywords={findings.keywords} />
        )}

        {analysis && activeTab === 'readability' && (
          <ReadabilityTab readability={findings.readability} bias={findings.bias} />
        )}

        {analysis && activeTab === 'heatmap' && (
          <HeatmapTab heatmap={findings.heatmap || analysis.heatmapData} />
        )}

        {analysis && activeTab === 'rewrites' && (
          <RewritesTab rewrites={findings.rewrites} />
        )}

        {analysis && activeTab === 'versions' && (
          <VersionLabTab versions={versions} currentId={resume.id} />
        )}

        {activeTab === 'interview' && (
          <InterviewTab questions={interviewQs} loading={loadingQs} onLoad={loadInterviewQuestions} />
        )}

        {activeTab === 'coverletter' && (
          <CoverLetterTab
            coverLetter={coverLetter}
            loading={loadingCover}
            onGenerate={handleGenerateCoverLetter}
            hasSelectedJD={Boolean(selectedJD)}
          />
        )}
      </main>
    </div>
  );
}

// ─── Executive Overview Tab ──────────────────────────
function OverviewTab({ analysis, findings, subScores }) {
  const getScoreBadge = (score) => {
    if (score >= 80) return <span className="badge badge-success">✓ Interview Shortlist Ready</span>;
    if (score >= 60) return <span className="badge badge-warning">⚠️ Needs Minor Optimization</span>;
    return <span className="badge badge-danger">🚨 Critical Fixes Required</span>;
  };

  return (
    <div className="animate-in">
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Score & Radar Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            {getScoreBadge(analysis.overallScore ?? 0)}
          </div>
          <ScoreCircle score={analysis.overallScore ?? 0} size={150} label="Composite Score" />
          <div style={{ width: '100%', marginTop: 'var(--space-md)' }}>
            <ScoreRadar subScores={subScores} />
          </div>
        </div>

        {/* Narrative & Sub-Scores Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Executive Summary</div>
            <span className="badge badge-neutral">5-Axis Model</span>
          </div>

          {findings.narrative && (
            <p style={{ fontSize: '0.9rem', lineHeight: 1.65, marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
              {findings.narrative}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {subScores && Object.entries({
              content_impact: { label: 'Content Impact', weight: '30%', icon: <Zap size={15} /> },
              ats_compatibility: { label: 'ATS Compatibility', weight: '25%', icon: <Shield size={15} /> },
              keyword_relevance: { label: 'Keyword Relevance', weight: '20%', icon: <Target size={15} /> },
              formatting: { label: 'Formatting Quality', weight: '15%', icon: <FileText size={15} /> },
              readability: { label: 'Readability Level', weight: '10%', icon: <BookOpen size={15} /> },
            }).map(([key, { label, weight, icon }]) => (
              <SubScoreBar key={key} label={label} weight={weight} icon={icon} score={subScores[key] ?? 0} />
            ))}
          </div>
        </div>
      </div>

      {/* Top Priority Action Items */}
      {findings.ats?.issues?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚨 High-Priority ATS & Format Fixes</div>
            <span className="badge badge-danger">{findings.ats.issues.length} detected</span>
          </div>
          {findings.ats.issues.map((issue, i) => (
            <FindingItem key={i} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Task 19: Resume Inspector (Split View) ──────────
function InspectorTab({ rawText, findings }) {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  const allIssues = [
    ...(findings.ats?.issues || []).map(i => ({ ...i, type: 'ATS Issue' })),
    ...(findings.impact?.bullets?.filter(b => b.verbTier === 'weak' || !b.quantified) || []).map(b => ({
      category: 'Impact',
      message: b.text,
      suggestion: b.suggestion || 'Rewrite with strong action verb and quantified metrics.',
      type: 'Weak Bullet',
      severity: b.verbTier === 'weak' ? 'high' : 'medium',
    })),
    ...(findings.readability?.buzzwords || []).map(bw => ({
      category: 'Buzzword',
      message: `Detected buzzword "${bw.term}"`,
      suggestion: bw.suggestion,
      type: 'Cliché Phrase',
      severity: 'low',
    })),
  ];

  return (
    <div className="animate-in grid-2" style={{ gap: 'var(--space-xl)', alignItems: 'start' }}>
      {/* Left: Raw Resume Text Viewer */}
      <div className="card" style={{ height: '70vh', overflowY: 'auto' }}>
        <div className="card-header">
          <div className="card-title">📄 Resume Text Preview</div>
          <span className="badge badge-neutral">{rawText.split('\n').length} lines</span>
        </div>
        <pre style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          color: 'var(--text-primary)',
        }}>
          {rawText}
        </pre>
      </div>

      {/* Right: Interactive Findings & Fix Queue */}
      <div className="card" style={{ height: '70vh', overflowY: 'auto' }}>
        <div className="card-header">
          <div className="card-title">🔍 Fix & Inspection Queue</div>
          <span className="badge badge-primary">{allIssues.length} items to review</span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
          Click an issue to inspect context and copy immediate fix suggestions.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allIssues.map((issue, idx) => (
            <div
              key={idx}
              className={`finding-item ${selectedIssue === idx ? 'active' : ''}`}
              style={{
                cursor: 'pointer',
                borderColor: selectedIssue === idx ? 'var(--accent-primary)' : 'var(--border)',
                background: selectedIssue === idx ? 'var(--accent-subtle)' : 'var(--bg-card)',
              }}
              onClick={() => setSelectedIssue(idx)}
            >
              <div className={`finding-severity ${issue.severity || 'medium'}`} />
              <div className="finding-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="finding-category">{issue.type} • {issue.category}</span>
                  {selectedIssue === idx && <span className="badge badge-primary">Inspecting</span>}
                </div>
                <div className="finding-message" style={{ fontSize: '0.85rem' }}>{issue.message}</div>
                {issue.suggestion && (
                  <div className="finding-suggestion" style={{ marginTop: 6 }}>
                    💡 {issue.suggestion}
                  </div>
                )}
                {selectedIssue === idx && issue.suggestion && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(issue.suggestion);
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                    >
                      {copiedText ? <><Check size={12} /> Copied Fix</> : <><Copy size={12} /> Copy Suggested Fix</>}
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

// ─── Task 7: Real ATS Simulation Matrix Tab ──────────
function ATSTab({ ats, atsSim }) {
  if (!ats) return <EmptyState message="Run an analysis to inspect ATS parsing emulation." />;

  const engineResults = atsSim?.results || [
    { ats: 'Workday', type: 'Enterprise ATS', parsedCorrectly: ats.passed, issues: ats.issues?.slice(0, 1).map(i => i.message) || [] },
    { ats: 'Greenhouse', type: 'Modern ATS', parsedCorrectly: true, issues: [] },
    { ats: 'Taleo', type: 'Legacy ATS', parsedCorrectly: ats.score > 70, issues: ats.score <= 70 ? ['Strict single-column text layout required'] : [] },
    { ats: 'iCIMS', type: 'Enterprise ATS', parsedCorrectly: true, issues: [] },
  ];

  return (
    <div className="animate-in">
      <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        {engineResults.map(engine => (
          <div key={engine.ats} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{engine.ats}</span>
              {engine.parsedCorrectly ? (
                <span className="badge badge-success">✓ Pass</span>
              ) : (
                <span className="badge badge-danger">✗ Risk Detected</span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: 4 }}>{engine.type || 'ATS Platform'}</p>
            {engine.issues?.length > 0 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: 4, display: 'block' }}>
                ⚠️ {engine.issues[0]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ScoreCircle score={ats.score ?? 0} size={130} label="ATS Score" />
          <div style={{ marginTop: 'var(--space-md)' }}>
            {ats.passed ? (
              <span className="badge badge-success">✓ Clean ATS Parsability</span>
            ) : (
              <span className="badge badge-danger">⚠️ Potential Parsing Dropouts</span>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Simulated ATS Engine Findings</div>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {atsSim?.summary || 'Applicant Tracking Systems parse your resume into key-value data structures. Below are verified failure points for major platforms.'}
          </p>
        </div>
      </div>

      {ats.issues?.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Detailed ATS Findings & Recommendations</div>
            <span className="badge badge-warning">{ats.issues.length} items</span>
          </div>
          {ats.issues.map((issue, i) => (
            <FindingItem key={i} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto var(--space-md)' }} />
          <h3>Zero ATS Compatibility Errors</h3>
          <p>Your resume format is fully compliant with enterprise Applicant Tracking Systems.</p>
        </div>
      )}
    </div>
  );
}

// ─── Task 20: Recruiter Replay Mode ──────────────────
function RecruiterReplayTab() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const timeline = [
    { time: '0.0s', zone: 'Candidate Header & Title', attention: '95%', insight: 'Recruiter validates candidate name, location, and seniority alignment.' },
    { time: '1.2s', zone: 'Executive Summary', attention: '85%', insight: 'Recruiter scans core domain competence and years of experience.' },
    { time: '2.4s', zone: 'Most Recent Role (Top 2 Bullets)', attention: '90%', insight: 'Recruiter checks top quantifiable accomplishment and architectural scope.' },
    { time: '4.0s', zone: 'Technical Skills Matrix', attention: '70%', insight: 'Recruiter verifies critical language and framework checklist matches role.' },
    { time: '5.6s', zone: 'Education & Past History', attention: '35%', insight: 'Recruiter does a rapid pass on academic qualifications.' },
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
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeline.length]);

  return (
    <div className="animate-in card" style={{ padding: 'var(--space-2xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: 6 }}>Cognitive UX Simulator</span>
          <h2>6-Second Recruiter Attention Timeline</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={() => { setCurrentStep(0); setIsPlaying(true); }}
            disabled={isPlaying}
          >
            <Play size={16} />
            {isPlaying ? 'Playing Simulation...' : 'Play 6-Second Replay'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {timeline.map((step, idx) => {
          const isActive = currentStep === idx;
          const isPassed = currentStep > idx;

          return (
            <div
              key={idx}
              className="card"
              style={{
                borderColor: isActive ? 'var(--accent-primary)' : 'var(--border)',
                background: isActive ? 'var(--accent-subtle)' : 'var(--bg-card)',
                opacity: isPassed || isActive ? 1 : 0.45,
                transform: isActive ? 'scale(1.01)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge badge-primary" style={{ fontFamily: 'var(--font-mono)' }}>{step.time}</span>
                  <strong style={{ fontSize: '0.95rem' }}>{step.zone}</strong>
                </div>
                <span className="badge badge-neutral">{step.attention} Eye Attention</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{step.insight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Task 21: Evidence Mode ──────────────────────────
function EvidenceModeTab({ impact }) {
  if (!impact) return <EmptyState message="Run an analysis to inspect evidence proof levels." />;

  const bullets = impact.bullets || [];

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3>Measurable Evidence Audit</h3>
        <p>Evaluates whether each bullet point delivers concrete proof ($ %, metrics) or unproven claims.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {bullets.map((b, i) => (
          <div key={i} className="card" style={{ padding: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                {b.text}
              </div>
              {b.quantified ? (
                <span className="badge badge-success" style={{ whiteSpace: 'nowrap' }}>
                  ✓ Strong Proof (%/$)
                </span>
              ) : b.verbTier === 'strong' ? (
                <span className="badge badge-warning" style={{ whiteSpace: 'nowrap' }}>
                  ⚠️ Strong Verb, Missing Metric
                </span>
              ) : (
                <span className="badge badge-danger" style={{ whiteSpace: 'nowrap' }}>
                  ✗ Weak Evidence
                </span>
              )}
            </div>
            {b.suggestion && (
              <div className="finding-suggestion" style={{ marginTop: 8 }}>
                💡 Recommendation: {b.suggestion}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task 22: Version Lab Tab ────────────────────────
function VersionLabTab({ versions, currentId }) {
  if (!versions || versions.length === 0) {
    return <EmptyState message="No prior versions found. Upload revisions to track score improvements over iterations." />;
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3>Version Lab & Score Progression</h3>
        <p>Track how your resume score and ATS compatibility have improved across revisions.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {versions.map((ver, idx) => {
          const prevScore = versions[idx + 1]?.latestScore;
          const scoreDelta = (ver.latestScore != null && prevScore != null)
            ? Math.round(ver.latestScore - prevScore)
            : null;

          return (
            <div
              key={ver.id}
              className="card"
              style={{
                borderColor: ver.id === currentId ? 'var(--accent-primary)' : 'var(--border)',
                background: ver.id === currentId ? 'var(--accent-subtle)' : 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <strong style={{ fontSize: '1rem' }}>Version {ver.version}</strong>
                    {ver.id === currentId && <span className="badge badge-primary">Active View</span>}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(ver.createdAt).toLocaleDateString()} • {ver.fileName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  {scoreDelta != null && (
                    <span className={`badge ${scoreDelta >= 0 ? 'badge-success' : 'badge-danger'}`}>
                      {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts
                    </span>
                  )}
                  <ScoreCircle score={ver.latestScore ?? 0} size={48} showLabel={false} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Task 23: Cover Letter Generator Tab ─────────────
function CoverLetterTab({ coverLetter, loading, onGenerate, hasSelectedJD }) {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
        <Loader2 size={36} style={{ color: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-md)' }} />
        <h3>Synthesizing Tailored Cover Letter...</h3>
        <p>Aligning resume achievements directly with target job responsibilities.</p>
      </div>
    );
  }

  if (!coverLetter) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
        <FileText size={44} style={{ color: 'var(--accent-primary)', margin: '0 auto var(--space-md)' }} />
        <h3>Tailored AI Cover Letter</h3>
        <p style={{ maxWidth: 440, margin: '0 auto var(--space-lg)' }}>
          {hasSelectedJD
            ? 'Generate a custom, compelling cover letter grounded in your verified accomplishments.'
            : 'Select a Job Description from the top dropdown to generate a tailored cover letter.'}
        </p>
        <button className="btn btn-primary" onClick={onGenerate} disabled={!hasSelectedJD}>
          <Sparkles size={16} />
          Generate Cover Letter
        </button>
      </div>
    );
  }

  const copyLetter = () => {
    navigator.clipboard.writeText(coverLetter.body || coverLetter.letter || JSON.stringify(coverLetter));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in card" style={{ padding: 'var(--space-2xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h3>Tailored Cover Letter</h3>
          <p style={{ fontSize: '0.8rem' }}>Grounded in your resume projects and target role qualifications.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={copyLetter}>
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy to Clipboard</>}
        </button>
      </div>
      <div style={{
        padding: 'var(--space-lg)',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        lineHeight: 1.8,
        whiteSpace: 'pre-wrap',
        fontSize: '0.9rem',
      }}>
        {coverLetter.body || coverLetter.letter || JSON.stringify(coverLetter, null, 2)}
      </div>
    </div>
  );
}

// ─── Impact & Verbs Tab ──────────────────────────────
function ImpactTab({ impact }) {
  if (!impact) return <EmptyState message="Run an analysis to evaluate action-verb impact." />;

  const quantifiedPct = impact.summary?.total ? Math.round((impact.summary.quantified / impact.summary.total) * 100) : 0;

  return (
    <div className="animate-in">
      <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Bullets</div>
          <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{impact.summary?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Strong Verbs</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{impact.summary?.strong || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Moderate Verbs</div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{impact.summary?.moderate || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Weak Verbs</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{impact.summary?.weak || 0}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Quantified Achievement Ratio</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: quantifiedPct >= 60 ? 'var(--success)' : 'var(--warning)' }}>
            {impact.summary?.quantified || 0} of {impact.summary?.total || 0} Bullets ({quantifiedPct}%)
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${quantifiedPct}%`,
            background: 'var(--accent-gradient)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {impact.bullets?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Line-by-Line Bullet Point Audit</div>
          </div>
          {impact.bullets.map((bullet, i) => (
            <BulletItem key={i} bullet={bullet} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Keyword Alignment Tab ───────────────────────────
function KeywordsTab({ keywords }) {
  if (!keywords) return <EmptyState message="Select a target Job Description and analyze to see keyword alignment." />;

  return (
    <div className="animate-in">
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ScoreCircle score={keywords.score ?? 0} size={130} label="Match Rate" />
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-md)', fontSize: '0.85rem' }}>
            Semantic Keyword Relevance Index
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Keyword Optimization Strategy</div>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            Match rates evaluate your core technical skills and libraries against requirements in the target job post.
            Incorporate missing keywords naturally into experience bullets rather than pasting raw skill lists.
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--success)' }}>✓ Matched Skills ({keywords.matched?.length || 0})</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(keywords.matched || []).map((kw, i) => (
              <span key={i} className="badge badge-success">{kw}</span>
            ))}
            {(!keywords.matched || keywords.matched.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No matches found</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--danger)' }}>✗ Missing Skills to Incorporate ({keywords.missing?.length || 0})</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(keywords.missing || []).map((kw, i) => (
              <span key={i} className="badge badge-danger">{kw}</span>
            ))}
            {(!keywords.missing || keywords.missing.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All critical target skills found!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Readability & Bias Tab ──────────────────────────
function ReadabilityTab({ readability, bias }) {
  return (
    <div className="animate-in">
      {readability && (
        <>
          <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="stat-card">
              <div className="stat-label">Reading Ease</div>
              <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{readability.fleschReadingEase ?? 50}</div>
              <div className="stat-trend"><span>Scale: 0–100</span></div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Grade Level</div>
              <div className="stat-value">{readability.fleschKincaidGrade ? `Gr. ${readability.fleschKincaidGrade}` : '—'}</div>
              <div className="stat-trend"><span>Ideal: Grade 9–12</span></div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Word Count</div>
              <div className="stat-value">{readability.stats?.wordCount || 0}</div>
              <div className="stat-trend"><span>Total words</span></div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Words / Sentence</div>
              <div className="stat-value">{readability.stats?.avgWordsPerSentence || 0}</div>
              <div className="stat-trend"><span>Target: 14–20</span></div>
            </div>
          </div>

          {readability.buzzwords?.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="card-header">
                <div className="card-title">⚡ Overused Buzzwords Detected</div>
                <span className="badge badge-warning">{readability.buzzwords.length} items</span>
              </div>
              {readability.buzzwords.map((bw, i) => (
                <div key={i} className="finding-item">
                  <div className="finding-severity medium" />
                  <div className="finding-content">
                    <div className="finding-message">"{bw.term}"</div>
                    <div className="finding-suggestion">💡 Better alternative: {bw.suggestion}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {bias && bias.flags?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🛡️ Bias & Inclusivity Safeguards</div>
            <span className="badge badge-info">{bias.flags.length} flags</span>
          </div>
          {bias.flags.map((flag, i) => (
            <div key={i} className="finding-item">
              <div className={`finding-severity ${flag.severity}`} />
              <div className="finding-content">
                <div className="finding-category">{flag.type}</div>
                <div className="finding-message">{flag.message}</div>
                <div className="finding-suggestion">💡 {flag.suggestion}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Recruiter Attention Heatmap Tab ─────────────────
function HeatmapTab({ heatmap }) {
  if (!heatmap) return <EmptyState message="Run an analysis to generate the 6-second recruiter attention heatmap." />;

  const cells = heatmap.cells || [];
  const insights = heatmap.insights || [];

  return (
    <div className="animate-in">
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">👁️ Simulated 6-Second Recruiter Attention Scan</div>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
            Models top-to-bottom F-pattern eye movements used by technical recruiters in rapid screening.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cells.map((cell, i) => (
              <div
                key={i}
                className="heatmap-cell"
                style={{
                  background: `rgba(79, 70, 229, ${Math.max(cell.attention * 0.35, 0.08)})`,
                  borderLeft: `4px solid var(--accent-primary)`,
                  border: `1px solid var(--border)`,
                  borderLeftWidth: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 650, fontSize: '0.875rem' }}>{cell.heading}</span>
                  <span className="badge badge-primary">{Math.round(cell.attention * 100)}% attention</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recruiter Cognitive Takeaways</div>
          </div>
          {insights.map((insight, i) => (
            <div key={i} className="finding-item">
              <div className="finding-severity medium" />
              <div className="finding-content">
                <div className="finding-message" style={{ fontSize: '0.875rem' }}>{insight}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI Rewrites Tab ─────────────────────────────────
function RewritesTab({ rewrites }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!rewrites || rewrites.length === 0) {
    return <EmptyState message="AI rewrite suggestions require an active LLM API key (Groq / OpenAI compatible)." />;
  }

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3>STAR-Format Quantified Rewrites</h3>
        <p>Re-engineered bullet points replacing passive phrasing with measurable impact metrics.</p>
      </div>

      {rewrites.map((rw, i) => (
        <div key={i} className="rewrite-card">
          <div className="rewrite-original">
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger)', marginBottom: 4, letterSpacing: '0.05em' }}>
              ORIGINAL WEAK PHRASING
            </div>
            {rw.original}
          </div>

          {rw.rewritten && (
            <div className="rewrite-suggested">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.05em' }}>
                  STAR-QUANTIFIED SUGGESTION
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(rw.rewritten, i)}
                >
                  {copiedIndex === i ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
              {rw.rewritten}
            </div>
          )}

          <div className="rewrite-explanation">
            <strong>Why this works:</strong> {rw.explanation}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Interview Tab ───────────────────────────────────
function InterviewTab({ questions, loading, onLoad }) {
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
        <Loader2 size={36} style={{ color: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-md)' }} />
        <h3>Synthesizing Grounded Interview Questions...</h3>
        <p>Predicting behavioral and technical questions based on your specific projects.</p>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <HelpCircle size={44} style={{ color: 'var(--accent-primary)', margin: '0 auto var(--space-md)' }} />
        <h3>Grounded Interview Predictor</h3>
        <p style={{ maxWidth: 440, margin: '0 auto var(--space-lg)' }}>
          Generate tailored behavioral, technical, and situational interview questions with talking point strategies.
        </p>
        <button className="btn btn-primary" onClick={onLoad}>
          <MessageSquare size={16} />
          Generate Interview Questions
        </button>
      </div>
    );
  }

  const qs = questions.questions || [];
  const grouped = {
    behavioral: qs.filter(q => q.type === 'behavioral'),
    technical: qs.filter(q => q.type === 'technical'),
    situational: qs.filter(q => q.type === 'situational'),
  };

  return (
    <div className="animate-in">
      {Object.entries(grouped).map(([type, items]) => items.length > 0 && (
        <div key={type} style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ textTransform: 'capitalize', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {type === 'behavioral' ? '🎯' : type === 'technical' ? '⚙️' : '💡'} {type} Questions
          </h3>
          {items.map((q, i) => (
            <QuestionCard key={i} question={q} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Reusable Helper Components ──────────────────────
function SubScoreBar({ label, weight, icon, score }) {
  const getColor = (s) => {
    if (s >= 80) return 'var(--score-excellent)';
    if (s >= 60) return 'var(--score-good)';
    if (s >= 40) return 'var(--score-fair)';
    return 'var(--score-poor)';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          {icon} {label} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({weight})</span>
        </div>
        <span style={{ fontWeight: 750, color: getColor(score), fontSize: '0.9rem' }}>{Math.round(score)}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: getColor(score),
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}

function FindingItem({ issue }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="finding-item" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
      <div className={`finding-severity ${issue.severity}`} />
      <div className="finding-content">
        <div className="finding-category">{issue.category}</div>
        <div className="finding-message">{issue.message}</div>
        {(expanded && issue.suggestion) && (
          <div className="finding-suggestion">
            💡 <strong>Actionable Fix:</strong> {issue.suggestion}
          </div>
        )}
      </div>
      {issue.suggestion && (
        expanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
      )}
    </div>
  );
}

function BulletItem({ bullet }) {
  const tierBadges = {
    strong: <span className="badge badge-success">Strong Verb: {bullet.verb}</span>,
    moderate: <span className="badge badge-info">Moderate: {bullet.verb}</span>,
    weak: <span className="badge badge-danger">Weak Verb: {bullet.verb}</span>,
  };

  return (
    <div className="finding-item">
      <div className={`finding-severity ${bullet.verbTier}`} />
      <div className="finding-content">
        <div className="finding-message" style={{ fontSize: '0.875rem' }}>{bullet.text}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {tierBadges[bullet.verbTier]}
          {bullet.quantified ? (
            <span className="badge badge-success">📊 Quantified Metric</span>
          ) : (
            <span className="badge badge-warning">⚠️ Missing Metric</span>
          )}
        </div>
        {bullet.suggestion && (
          <div className="finding-suggestion">💡 {bullet.suggestion}</div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 'var(--space-md)', cursor: 'pointer' }} onClick={() => setShowTip(!showTip)}>
      <div className="finding-message" style={{ marginBottom: 6 }}>
        {question.question}
      </div>
      <div className="finding-category" style={{ marginBottom: showTip ? 8 : 0 }}>
        Based on bullet: {question.context}
      </div>
      {showTip && (
        <div className="finding-suggestion" style={{ background: 'var(--success-bg)', borderLeftColor: 'var(--success)' }}>
          💡 <strong>Coaching Strategy:</strong> {question.tip}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
      <p style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}
