import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Brain, Target, BarChart3, Eye,
  FileText, ArrowRight, Sparkles, Check,
  Play, RefreshCw, Copy, CheckCheck
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import ScoreCircle from '../components/ScoreCircle';

export default function Landing() {
  const navigate = useNavigate();

  // Interactive Demo State (Task 18)
  const [demoStep, setDemoStep] = useState(1);
  const [demoScanning, setDemoScanning] = useState(false);
  const [copiedBullet, setCopiedBullet] = useState(false);

  const triggerDemoScan = () => {
    setDemoScanning(true);
    setTimeout(() => {
      setDemoScanning(false);
      setDemoStep(2);
    }, 1200);
  };

  const copyRewrite = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(true);
    setTimeout(() => setCopiedBullet(false), 2000);
  };

  const features = [
    {
      icon: <Brain size={22} />,
      title: 'Semantic Context Matching',
      description: 'Understands deep technical competence and conceptual equivalencies beyond naive keyword stuffing.',
      tag: 'NLP Engine',
    },
    {
      icon: <Shield size={22} />,
      title: 'ATS Simulation Matrix',
      description: 'Identifies parsing failure modes across Workday, Greenhouse, Taleo, and iCIMS before human screeners see it.',
      tag: 'Compatibility',
    },
    {
      icon: <Target size={22} />,
      title: 'Action-Verb & Impact Scoring',
      description: 'Scores verbs into Strong, Moderate, and Weak tiers and detects measurable metric coverage across every bullet.',
      tag: 'Impact',
    },
    {
      icon: <Eye size={22} />,
      title: 'Recruiter Attention Heatmap',
      description: 'Simulates the cognitive 6-second F-pattern eye-tracking scan to ensure key achievements are in the line of sight.',
      tag: 'Cognitive UX',
    },
    {
      icon: <BarChart3 size={22} />,
      title: '5-Axis Explainable Radar',
      description: 'Transparent sub-score breakdowns tied directly to specific resume lines — no arbitrary black-box numbers.',
      tag: 'Explainability',
    },
    {
      icon: <Sparkles size={22} />,
      title: 'Iterative AI Career Coach',
      description: 'Generates quantified STAR-format rewrites and anticipates grounded behavioral and technical interview questions.',
      tag: 'AI Agent',
    },
  ];

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="logo-icon">IQ</div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>ResumeIQ</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <ThemeToggle />
          <button className="btn btn-ghost" onClick={() => navigate('/auth')}>
            Sign In
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>
            Get Started
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero animate-in">
        <div className="announcement-badge">
          <Sparkles size={14} />
          <span>Next-Generation Semantic Resume Intelligence</span>
        </div>

        <h1 style={{ fontSize: '3rem', lineHeight: 1.15, marginBottom: 'var(--space-md)', letterSpacing: '-0.04em' }}>
          Your Resume, Analyzed Like a <br />
          <span className="gradient-text">Principal Recruiter</span>
        </h1>

        <p style={{ fontSize: '1.1rem', maxWidth: 640, margin: '0 auto var(--space-xl)', color: 'var(--text-secondary)' }}>
          ResumeIQ replaces legacy keyword-stuffers with true semantic understanding, realistic ATS parsing simulation, and actionable STAR coaching.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-2xl)' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
            <FileText size={18} />
            Analyze Your Resume Free
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Play size={16} />
            Try Live Demo
          </button>
        </div>

        {/* Trust & Proof Metric Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-lg)',
          flexWrap: 'wrap',
          padding: 'var(--space-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: 760,
          margin: '0 auto',
          boxShadow: 'var(--shadow-xs)',
        }}>
          {[
            { label: '5 Radar Dimensions', desc: 'Content, ATS, Keywords, Format, Readability' },
            { label: '4 ATS Systems', desc: 'Workday, Greenhouse, Taleo, iCIMS' },
            { label: 'STAR Rewrites', desc: 'Metric-quantified AI suggestions' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--success-bg)', color: 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={12} strokeWidth={3} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{item.label}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Task 18: Interactive Landing Page Live Demo */}
      <section id="interactive-demo" style={{ maxWidth: 1100, margin: '0 auto var(--space-3xl)', padding: '0 var(--space-md)' }}>
        <div className="card" style={{ padding: 'var(--space-2xl)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 'var(--space-xl)' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 6 }}>Interactive Feature Preview</span>
              <h2 style={{ fontSize: '1.75rem' }}>Live Resume Intelligence Simulator</h2>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setDemoStep(1); triggerDemoScan(); }}
              disabled={demoScanning}
            >
              <RefreshCw size={14} className={demoScanning ? 'spin' : ''} />
              {demoScanning ? 'Scanning Document...' : 'Re-Run Live Demo'}
            </button>
          </div>

          <div className="grid-2" style={{ gap: 'var(--space-xl)' }}>
            {/* Left Column: Sample Resume with Interactive Hotspots */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
              fontSize: '0.85rem',
              lineHeight: 1.6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8, marginBottom: 12 }}>
                <span style={{ fontWeight: 700 }}>Alex Morgan — Staff Full Stack</span>
                <span className="badge badge-neutral">sample_resume.txt</span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>EXPERIENCE</p>

              {/* Bullet 1 (Strong) */}
              <div style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: demoStep === 2 ? 'var(--success-bg)' : 'transparent',
                border: demoStep === 2 ? '1px solid var(--success-border)' : '1px solid transparent',
                marginBottom: 8,
                transition: 'all 0.4s ease',
              }}>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>• Spearheaded</span> architectural migration to Node.js microservices, reducing p99 latency by <strong>42%</strong> for <strong>1.5M MAU</strong>.
                {demoStep === 2 && <span className="badge badge-success" style={{ marginLeft: 8, fontSize: '0.65rem' }}>✓ Strong Impact</span>}
              </div>

              {/* Bullet 2 (Weak / Needs Rewrite) */}
              <div style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: demoStep === 2 ? 'var(--danger-bg)' : 'transparent',
                border: demoStep === 2 ? '1px solid var(--danger-border)' : '1px solid transparent',
                marginBottom: 8,
                transition: 'all 0.4s ease',
              }}>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>• Helped with</span> database query optimization and wrote queries.
                {demoStep === 2 && <span className="badge badge-danger" style={{ marginLeft: 8, fontSize: '0.65rem' }}>⚠️ Weak Verb & No Metric</span>}
              </div>

              {/* Bullet 3 (Moderate) */}
              <div style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: demoStep === 2 ? 'var(--info-bg)' : 'transparent',
                border: demoStep === 2 ? '1px solid var(--info-border)' : '1px solid transparent',
                transition: 'all 0.4s ease',
              }}>
                <span style={{ color: 'var(--info)', fontWeight: 700 }}>• Built</span> real-time data streaming pipelines with Redis and WebSocket.
                {demoStep === 2 && <span className="badge badge-info" style={{ marginLeft: 8, fontSize: '0.65rem' }}>Moderate</span>}
              </div>
            </div>

            {/* Right Column: Dynamic Analysis Readout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {demoScanning ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 240, textAlign: 'center' }}>
                  <div className="spinner" style={{ marginBottom: 12 }} />
                  <p style={{ fontWeight: 600 }}>Simulating ATS parsers & NLP impact analysis...</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    <ScoreCircle score={demoStep === 2 ? 82 : null} size={90} label="Score" />
                    <div>
                      <h4 style={{ marginBottom: 2 }}>{demoStep === 2 ? '82% ATS Readiness' : 'Click to Scan Sample'}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {demoStep === 2 ? '2 strong quantified bullets, 1 weak phrasing detected.' : 'See real-time breakdown of parsing and impact metrics.'}
                      </p>
                    </div>
                  </div>

                  {demoStep === 2 ? (
                    <div style={{ padding: 'var(--space-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>
                          ⚡ AI STAR Rewrite Suggestion
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => copyRewrite('Optimized 20+ critical PostgreSQL database queries by introducing composite indexing, boosting throughput by 30% across 5M daily records.')}
                        >
                          {copiedBullet ? <><CheckCheck size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                        </button>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: 6 }}>
                        "Optimized 20+ critical PostgreSQL database queries by introducing composite indexing, boosting throughput by 30% across 5M daily records."
                      </p>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        Replaced passive "helped with" with quantified business outcome.
                      </span>
                    </div>
                  ) : (
                    <button className="btn btn-primary" onClick={triggerDemoScan}>
                      <Play size={16} />
                      Simulate Resume Analysis
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features-section" style={{ maxWidth: 1200, margin: '0 auto var(--space-3xl)', padding: '0 var(--space-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-xs)' }}>
            Engineered for Modern Hiring Pipelines
          </h2>
          <p>Every feature is designed to elevate candidate profiles from automatic rejection to interview shortlist.</p>
        </div>

        <div className="features-grid" style={{ marginBottom: 0 }}>
          {features.map(feature => (
            <div key={feature.title} className="feature-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <span className="badge badge-primary">{feature.tag}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-xs)' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto var(--space-3xl)',
        padding: 'var(--space-2xl) var(--space-xl)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <span className="badge badge-primary" style={{ marginBottom: 'var(--space-sm)' }}>Why ResumeIQ Wins</span>
          <h2>The Paradigm Shift in Resume Evaluation</h2>
        </div>

        <div className="grid-2" style={{ gap: 'var(--space-xl)' }}>
          <div style={{
            padding: 'var(--space-lg)',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <h4 style={{ color: 'var(--danger)', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
              ❌ Traditional Keyword Checkers
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>• Blindly counts keyword frequency with zero semantic context.</li>
              <li>• Misses parsing errors caused by complex tables, columns, or header zones.</li>
              <li>• Delivers arbitrary opaque scores without actionable fix guidance.</li>
              <li>• Rewards candidates who stuff repetitive buzzwords into invisible text.</li>
            </ul>
          </div>

          <div style={{
            padding: 'var(--space-lg)',
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <h4 style={{ color: 'var(--success)', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
              ✨ ResumeIQ Semantic Intelligence
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>• Uses semantic vector similarity to evaluate authentic competence.</li>
              <li>• Emulates 4 enterprise ATS engines to prevent real parsing dropouts.</li>
              <li>• 5-dimensional explainable radar breakdown tied to specific resume lines.</li>
              <li>• Coaches you with STAR-method rewrites and predicted interview questions.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer style={{
        textAlign: 'center',
        padding: 'var(--space-3xl) var(--space-md)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-xs)' }}>
            Start Optimizing Your Career Today
          </h2>
          <p style={{ marginBottom: 'var(--space-lg)' }}>
            Upload your resume now and get explainable feedback, ATS simulation, and STAR rewrites in seconds.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
            Get Started Free
            <ArrowRight size={18} />
          </button>
        </div>
        <div style={{ marginTop: 'var(--space-2xl)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} ResumeIQ — Built for modern engineering and leadership careers.
        </div>
      </footer>
    </div>
  );
}
