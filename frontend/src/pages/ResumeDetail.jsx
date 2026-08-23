import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Loader2, Shield, Target, TrendingUp,
  BookOpen, Eye, AlertTriangle, CheckCircle, XCircle,
  ChevronDown, ChevronUp, MessageSquare, FileText, Zap,
  HelpCircle, LayoutDashboard, Briefcase
} from 'lucide-react';
import { AuthContext } from '../App';
import { resumeAPI, analysisAPI, jobAPI } from '../services/api';
import ScoreCircle from '../components/ScoreCircle';
import ScoreRadar from '../components/ScoreRadar';

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
        <h2>Resume not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 'var(--space-lg)' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const findings = analysis?.findings || {};
  const subScores = analysis?.subScores || null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} /> },
    { id: 'ats', label: 'ATS Check', icon: <Shield size={15} /> },
    { id: 'impact', label: 'Impact', icon: <Zap size={15} /> },
    { id: 'keywords', label: 'Keywords', icon: <Target size={15} /> },
    { id: 'readability', label: 'Readability', icon: <BookOpen size={15} /> },
    { id: 'heatmap', label: 'Heatmap', icon: <Eye size={15} /> },
    { id: 'rewrites', label: 'AI Rewrites', icon: <MessageSquare size={15} /> },
    { id: 'interview', label: 'Interview Qs', icon: <HelpCircle size={15} /> },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">IQ</div>
          <h1>ResumeIQ</h1>
        </div>
        <button className="nav-item" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
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
      </aside>

      <main className="main-content">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>{resume.label || resume.fileName}</h1>
            <p>Version {resume.version} • Uploaded {new Date(resume.createdAt).toLocaleDateString()}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
            {jds.length > 0 && (
              <select
                className="input"
                value={selectedJD}
                onChange={(e) => setSelectedJD(e.target.value)}
                style={{ width: 220 }}
              >
                <option value="">No job description</option>
                {jds.map(jd => (
                  <option key={jd.id} value={jd.id}>{jd.title} — {jd.company || 'No company'}</option>
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
                <><Play size={16} /> {analysis ? 'Re-Analyze' : 'Analyze'}</>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {analyzing && !analysis && (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
            <Loader2 size={48} style={{ color: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite', marginBottom: 'var(--space-lg)' }} />
            <h3>Analyzing your resume...</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
              Running ATS checks, scoring impact, checking readability, and generating AI insights.
            </p>
          </div>
        )}

        {!analysis && !analyzing && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
            <Shield size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }} />
            <h3>Ready to analyze</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', maxWidth: 400, margin: '0 auto var(--space-lg)' }}>
              Click "Analyze" to run the full scoring pipeline. Optionally select a job description for keyword matching.
            </p>
            <button className="btn btn-primary btn-lg" onClick={startAnalysis}>
              <Play size={18} />
              Start Analysis
            </button>
          </div>
        )}

        {analysis && activeTab === 'overview' && (
          <OverviewTab analysis={analysis} findings={findings} subScores={subScores} />
        )}

        {analysis && activeTab === 'ats' && (
          <ATSTab ats={findings.ats} />
        )}

        {analysis && activeTab === 'impact' && (
          <ImpactTab impact={findings.impact} rewrites={findings.rewrites} />
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

// ─── Overview Tab ──────────────────────────────
function OverviewTab({ analysis, findings, subScores }) {
  return (
    <div className="animate-in">
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Score + Radar */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <ScoreCircle score={analysis.overallScore} size={140} />
          <ScoreRadar subScores={subScores} />
        </div>

        {/* Narrative + Sub-scores */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Analysis Summary</h3>
          {findings.narrative && (
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 'var(--space-xl)', color: 'var(--text-secondary)' }}>
              {findings.narrative}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {subScores && Object.entries({
              content_impact: { label: 'Content Impact', icon: <Zap size={16} /> },
              ats_compatibility: { label: 'ATS Compatibility', icon: <Shield size={16} /> },
              keyword_relevance: { label: 'Keyword Relevance', icon: <Target size={16} /> },
              formatting: { label: 'Formatting', icon: <FileText size={16} /> },
              readability: { label: 'Readability', icon: <BookOpen size={16} /> },
            }).map(([key, { label, icon }]) => (
              <SubScoreBar key={key} label={label} icon={icon} score={subScores[key]} />
            ))}
          </div>
        </div>
      </div>

      {/* Top findings */}
      {findings.ats?.issues?.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="card-header">
            <div className="card-title">🚨 Top Issues to Fix</div>
            <span className="badge badge-danger">{findings.ats.issues.length} issues</span>
          </div>
          {findings.ats.issues.slice(0, 3).map((issue, i) => (
            <FindingItem key={i} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ATS Tab ───────────────────────────────────
function ATSTab({ ats }) {
  if (!ats) return <EmptyState message="Run an analysis to see ATS results." />;

  return (
    <div className="animate-in">
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <ScoreCircle score={ats.score} size={120} label="ATS Score" />
          <div style={{ marginTop: 'var(--space-md)' }}>
            {ats.passed ? (
              <span className="badge badge-success badge-score"><CheckCircle size={14} /> ATS Compatible</span>
            ) : (
              <span className="badge badge-danger badge-score"><XCircle size={14} /> Issues Found</span>
            )}
          </div>
        </div>
        <div className="card">
          <h4 style={{ marginBottom: 'var(--space-md)' }}>What ATS Checks</h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            ATS (Applicant Tracking Systems) parse your resume into structured data. Issues like multi-column
            layouts, images with text, and non-standard headers can cause critical parsing failures — meaning
            your resume gets garbled or dropped entirely.
          </p>
        </div>
      </div>

      {ats.issues?.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Issues Found</div>
            <span className="badge badge-warning">{ats.issues.length}</span>
          </div>
          {ats.issues.map((issue, i) => (
            <FindingItem key={i} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 'var(--space-md)' }} />
          <h3>All clear!</h3>
          <p style={{ color: 'var(--text-muted)' }}>No ATS compatibility issues detected.</p>
        </div>
      )}
    </div>
  );
}

// ─── Impact Tab ────────────────────────────────
function ImpactTab({ impact, rewrites }) {
  if (!impact) return <EmptyState message="Run an analysis to see impact scores." />;

  return (
    <div className="animate-in">
      <div className="grid-3" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{impact.summary?.total || 0}</div>
          <div className="stat-label">Total Bullets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{impact.summary?.strong || 0}</div>
          <div className="stat-label">Strong Verbs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{impact.summary?.weak || 0}</div>
          <div className="stat-label">Weak Verbs</div>
        </div>
      </div>

      <div className="stat-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quantified Bullets</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {impact.summary?.quantified || 0} / {impact.summary?.total || 0}
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)' }}>
          <div style={{
            height: '100%',
            width: `${impact.summary?.total ? (impact.summary.quantified / impact.summary.total * 100) : 0}%`,
            background: 'var(--accent-gradient)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 1s ease',
          }} />
        </div>
      </div>

      {impact.bullets?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Bullet Analysis</div>
          </div>
          {impact.bullets.map((bullet, i) => (
            <BulletItem key={i} bullet={bullet} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Keywords Tab ──────────────────────────────
function KeywordsTab({ keywords }) {
  if (!keywords) return <EmptyState message="Analyze with a job description to see keyword matching." />;

  return (
    <div className="animate-in">
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <ScoreCircle score={keywords.score} size={100} label="Match" />
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'var(--space-md)', fontSize: '0.85rem' }}>
          {keywords.matchRate || 'N/A'} keywords matched
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--success)' }}>✓ Matched Keywords</div>
            <span className="badge badge-success">{keywords.matched?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
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
            <div className="card-title" style={{ color: 'var(--danger)' }}>✗ Missing Keywords</div>
            <span className="badge badge-danger">{keywords.missing?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {(keywords.missing || []).map((kw, i) => (
              <span key={i} className="badge badge-danger">{kw}</span>
            ))}
            {(!keywords.missing || keywords.missing.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No missing keywords!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Readability Tab ───────────────────────────
function ReadabilityTab({ readability, bias }) {
  return (
    <div className="animate-in">
      {readability && (
        <>
          <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{readability.fleschKincaid}</div>
              <div className="stat-label">Flesch-Kincaid</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{readability.stats?.wordCount || 0}</div>
              <div className="stat-label">Words</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{readability.stats?.avgWordsPerSentence || 0}</div>
              <div className="stat-label">Avg Words/Sentence</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{readability.stats?.sentenceCount || 0}</div>
              <div className="stat-label">Sentences</div>
            </div>
          </div>

          {readability.buzzwords?.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="card-header">
                <div className="card-title">⚡ Buzzwords Detected</div>
                <span className="badge badge-warning">{readability.buzzwords.length}</span>
              </div>
              {readability.buzzwords.map((bw, i) => (
                <div key={i} className="finding-item">
                  <div className="finding-severity medium" />
                  <div className="finding-content">
                    <div className="finding-message">"{bw.term}"</div>
                    <div className="finding-suggestion">{bw.suggestion}</div>
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
            <div className="card-title">🛡️ Bias & Inclusive Language</div>
            <span className="badge badge-info">{bias.flags.length} flags</span>
          </div>
          {bias.flags.map((flag, i) => (
            <div key={i} className="finding-item">
              <div className={`finding-severity ${flag.severity}`} />
              <div className="finding-content">
                <div className="finding-category">{flag.type}</div>
                <div className="finding-message">{flag.message}</div>
                <div className="finding-suggestion">{flag.suggestion}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(!readability?.buzzwords?.length && !bias?.flags?.length) && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: 'var(--space-md)' }} />
          <h3>Looking good!</h3>
          <p style={{ color: 'var(--text-muted)' }}>No readability or bias issues detected.</p>
        </div>
      )}
    </div>
  );
}

// ─── Heatmap Tab ───────────────────────────────
function HeatmapTab({ heatmap }) {
  if (!heatmap) return <EmptyState message="Run an analysis to see the attention heatmap." />;

  const cells = heatmap.cells || [];
  const insights = heatmap.insights || [];

  return (
    <div className="animate-in">
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">👁️ Recruiter Attention Map</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
            Simulates a 6-second recruiter F-pattern scan. Brighter = more attention.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cells.map((cell, i) => (
              <div
                key={i}
                className="heatmap-cell"
                style={{
                  background: `rgba(99, 102, 241, ${cell.attention * 0.6})`,
                  borderLeft: `4px solid rgba(99, 102, 241, ${cell.attention})`,
                  opacity: 0.4 + cell.attention * 0.6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cell.heading}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {Math.round(cell.attention * 100)}% attention
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">💡 Insights</div>
          </div>
          {insights.map((insight, i) => (
            <div key={i} className="finding-item">
              <div className="finding-severity medium" />
              <div className="finding-content">
                <div className="finding-message">{insight}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Rewrites Tab ──────────────────────────────
function RewritesTab({ rewrites }) {
  if (!rewrites || rewrites.length === 0) return <EmptyState message="No rewrite suggestions available. AI rewrites require an LLM API key." />;

  return (
    <div className="animate-in">
      <h3 style={{ marginBottom: 'var(--space-lg)' }}>AI Rewrite Suggestions</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>
        STAR-format rewrites for your weakest bullet points. Review each suggestion before applying.
      </p>
      {rewrites.map((rw, i) => (
        <div key={i} className="rewrite-card animate-slide" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="rewrite-original">
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>ORIGINAL</div>
            {rw.original}
          </div>
          {rw.rewritten && (
            <div className="rewrite-suggested">
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>SUGGESTED</div>
              {rw.rewritten}
            </div>
          )}
          <div className="rewrite-explanation">{rw.explanation}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Interview Tab ─────────────────────────────
function InterviewTab({ questions, loading, onLoad }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
        <Loader2 size={36} style={{ color: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: 'var(--space-md)', color: 'var(--text-muted)' }}>Generating interview questions...</p>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <HelpCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }} />
        <h3>Interview Question Predictor</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
          Generate likely interview questions based on your resume content.
        </p>
        <button className="btn btn-primary" onClick={onLoad}>
          <MessageSquare size={16} />
          Generate Questions
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
          <h3 style={{ textTransform: 'capitalize', marginBottom: 'var(--space-md)' }}>
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

// ─── Shared Components ─────────────────────────
function SubScoreBar({ label, icon, score }) {
  const getColor = (s) => {
    if (s >= 80) return 'var(--score-excellent)';
    if (s >= 60) return 'var(--score-good)';
    if (s >= 40) return 'var(--score-fair)';
    return 'var(--score-poor)';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {icon} {label}
        </div>
        <span style={{ fontWeight: 700, color: getColor(score), fontSize: '0.9rem' }}>{Math.round(score || 0)}</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)' }}>
        <div style={{
          height: '100%',
          width: `${score || 0}%`,
          background: getColor(score),
          borderRadius: 'var(--radius-full)',
          transition: 'width 1s ease',
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
          <div className="finding-suggestion" style={{ marginTop: 'var(--space-sm)' }}>
            💡 {issue.suggestion}
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
  const tierColors = {
    strong: 'var(--success)',
    moderate: 'var(--info)',
    weak: 'var(--danger)',
  };

  return (
    <div className="finding-item">
      <div className="finding-severity" style={{ background: tierColors[bullet.verbTier] || 'var(--text-muted)' }} />
      <div className="finding-content">
        <div className="finding-message" style={{ fontSize: '0.85rem' }}>{bullet.text}</div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <span className={`badge ${bullet.verbTier === 'strong' ? 'badge-success' : bullet.verbTier === 'weak' ? 'badge-danger' : 'badge-info'}`}>
            {bullet.verb} — {bullet.verbTier}
          </span>
          {bullet.quantified ? (
            <span className="badge badge-success">📊 Quantified</span>
          ) : (
            <span className="badge badge-warning">No metrics</span>
          )}
        </div>
        {bullet.suggestion && (
          <div className="finding-suggestion" style={{ marginTop: 'var(--space-sm)' }}>💡 {bullet.suggestion}</div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 'var(--space-md)', cursor: 'pointer' }} onClick={() => setShowTip(!showTip)}>
      <div className="finding-message" style={{ marginBottom: 'var(--space-sm)' }}>
        {question.question}
      </div>
      <div className="finding-category" style={{ marginBottom: showTip ? 'var(--space-sm)' : 0 }}>
        Based on: {question.context}
      </div>
      {showTip && (
        <div className="finding-suggestion" style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-md)', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)' }}>
          💡 <strong>Tip:</strong> {question.tip}
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
