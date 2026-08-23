import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Loader2, Shield, Target, TrendingUp,
  BookOpen, Eye, AlertTriangle, CheckCircle, XCircle,
  ChevronDown, ChevronUp, MessageSquare, FileText, Zap,
  HelpCircle, LayoutDashboard, Briefcase, Copy, Check,
  Sparkles, ExternalLink, RefreshCw
} from 'lucide-react';
import { AuthContext } from '../App';
import { resumeAPI, analysisAPI, jobAPI } from '../services/api';
import ScoreCircle from '../components/ScoreCircle';
import ScoreRadar from '../components/ScoreRadar';
import ThemeToggle from '../components/ThemeToggle';

export default function ResumeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [jds, setJds] = useState([]);
  const [selectedJD, setSelectedJD] = useState('');
  const [interviewQs, setInterviewQs] = useState(null);
  const [loadingQs, setLoadingQs] = useState(false);

  useEffect(() => {
    loadResume();
    jobAPI.list().then(({ data }) => setJds(data)).catch(() => {});
  }, [id]);

  const loadResume = async () => {
    try {
      const { data } = await resumeAPI.get(id);
      setResume(data);
      if (data.analyses && data.analyses.length > 0) {
        const latest = data.analyses[0];
        if (latest.status === 'completed') {
          setAnalysis(latest);
        } else if (latest.status === 'processing') {
          setAnalyzing(true);
          pollAnalysis(latest.id);
        }
      }
    } catch (err) {
      console.error('Failed to load resume:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const pollAnalysis = async (analysisId) => {
    try {
      const data = await analysisAPI.poll(analysisId);
      setAnalysis(data);
    } catch (err) {
      console.error('Polling failed:', err);
    } finally {
      setAnalyzing(false);
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
    { id: 'ats', label: 'ATS Simulation', icon: <Shield size={15} /> },
    { id: 'impact', label: 'Impact & Verbs', icon: <Zap size={15} /> },
    { id: 'keywords', label: 'Keyword Alignment', icon: <Target size={15} /> },
    { id: 'readability', label: 'Readability & Bias', icon: <BookOpen size={15} /> },
    { id: 'heatmap', label: 'Attention Heatmap', icon: <Eye size={15} /> },
    { id: 'rewrites', label: 'AI STAR Rewriter', icon: <Sparkles size={15} /> },
    { id: 'interview', label: 'Predicted Questions', icon: <HelpCircle size={15} /> },
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

        <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
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

        {analysis && activeTab === 'ats' && (
          <ATSTab ats={findings.ats} />
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

        {activeTab === 'interview' && (
          <InterviewTab questions={interviewQs} loading={loadingQs} onLoad={loadInterviewQuestions} />
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
            {getScoreBadge(analysis.overallScore)}
          </div>
          <ScoreCircle score={analysis.overallScore} size={150} label="Composite Score" />
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
              <SubScoreBar key={key} label={label} weight={weight} icon={icon} score={subScores[key]} />
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

// ─── ATS Tab ─────────────────────────────────────────
function ATSTab({ ats }) {
  if (!ats) return <EmptyState message="Run an analysis to inspect ATS parsing emulation." />;

  const engines = [
    { name: 'Workday', desc: 'Column scrambling & table layout parser', status: ats.passed ? 'passed' : 'warning' },
    { name: 'Greenhouse', desc: 'Standard section title and date recognition', status: 'passed' },
    { name: 'Taleo', desc: 'Floating text boxes and special symbols filter', status: ats.issues?.length > 2 ? 'failed' : 'passed' },
    { name: 'iCIMS', desc: 'Contact info extraction in header/footer zones', status: 'passed' },
  ];

  return (
    <div className="animate-in">
      <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        {engines.map(engine => (
          <div key={engine.name} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{engine.name}</span>
              {engine.status === 'passed' ? (
                <span className="badge badge-success">✓ Pass</span>
              ) : engine.status === 'warning' ? (
                <span className="badge badge-warning">⚠️ Review</span>
              ) : (
                <span className="badge badge-danger">✗ Blocker</span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: 4 }}>{engine.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ScoreCircle score={ats.score} size={130} label="ATS Score" />
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
            <div className="card-title">How ATS Systems Evaluate Files</div>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            Applicant Tracking Systems strip formatting to convert your resume into plain key-value data.
            If contact information or sections are trapped inside tables, side columns, or graphics, ATS
            parsers frequently produce blank or garbled candidate records.
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
          <p>Your resume layout is fully compliant with enterprise Applicant Tracking Systems.</p>
        </div>
      )}
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
          <ScoreCircle score={keywords.score} size={130} label="Match Rate" />
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
              <div className="stat-label">Flesch-Kincaid Grade</div>
              <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{readability.fleschKincaid}</div>
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
            <div className="stat-card">
              <div className="stat-label">Sentence Count</div>
              <div className="stat-value">{readability.stats?.sentenceCount || 0}</div>
              <div className="stat-trend"><span>Total statements</span></div>
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
        <span style={{ fontWeight: 750, color: getColor(score), fontSize: '0.9rem' }}>{Math.round(score || 0)}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${score || 0}%`,
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
