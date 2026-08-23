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

  const [demoStep, setDemoStep] = useState(1);
  const [demoScanning, setDemoScanning] = useState(false);
  const [copiedBullet, setCopiedBullet] = useState(false);

  const triggerDemoScan = () => {
    setDemoScanning(true);
    setTimeout(() => {
      setDemoScanning(false);
      setDemoStep(2);
    }, 1000);
  };

  const copyRewrite = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(true);
    setTimeout(() => setCopiedBullet(false), 2000);
  };

  const features = [
    {
      icon: <Brain size={20} />,
      title: 'Semantic Context Matching',
      description: 'Understands deep engineering competence and conceptual equivalencies beyond string frequency.',
      tag: 'NLP Engine',
    },
    {
      icon: <Shield size={20} />,
      title: 'ATS Simulation Matrix',
      description: 'Identifies layout failure modes across Workday, Greenhouse, Taleo, and iCIMS before screeners review.',
      tag: 'Compatibility',
    },
    {
      icon: <Target size={20} />,
      title: 'Impact & Verb Quantification',
      description: 'Classifies action verbs into distinct tiers and detects measurable metric coverage across every bullet.',
      tag: 'Impact',
    },
    {
      icon: <Eye size={20} />,
      title: 'Recruiter Attention Heatmap',
      description: 'Simulates the cognitive 6-second F-pattern eye-tracking scan to evaluate hierarchy and visual anchor points.',
      tag: 'Cognitive UX',
    },
    {
      icon: <BarChart3 size={20} />,
      title: '5-Axis Explainable Radar',
      description: 'Transparent sub-score breakdowns tied directly to specific resume lines — zero opaque black boxes.',
      tag: 'Explainability',
    },
    {
      icon: <Sparkles size={20} />,
      title: 'AI Career Copilot',
      description: 'Generates quantified STAR-format revisions and anticipates grounded technical and behavioral interview questions.',
      tag: 'AI Copilot',
    },
  ];

  return (
    <div className="landing">
      {/* Top Navbar */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="logo-icon">IQ</div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>ResumeIQ</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/auth')}>
            Sign In
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>
            Get Started
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero animate-in">
        <div className="announcement-badge">
          <Sparkles size={13} />
          <span>Next-Generation Semantic Resume Intelligence</span>
        </div>

        <h1 style={{ fontSize: '2.8rem', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.04em' }}>
          Evaluate Your Resume Like a <br />
          <span className="gradient-text">Principal Technical Recruiter</span>
        </h1>

        <p style={{ fontSize: '1.05rem', maxWidth: 600, margin: '0 auto 28px', color: 'var(--text-secondary)' }}>
          ResumeIQ replaces legacy keyword-checkers with deep semantic context, realistic ATS engine emulation, and actionable STAR coaching.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
            <FileText size={16} />
            Analyze Your Resume Free
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Play size={15} />
            Explore Live Simulator
          </button>
        </div>

        {/* Proof Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          flexWrap: 'wrap',
          padding: '12px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: 720,
          margin: '0 auto',
          boxShadow: 'var(--shadow-xs)',
        }}>
          {[
            { label: '5 Radar Dimensions', desc: 'Impact, ATS, Keywords, Format, Readability' },
            { label: '4 ATS Families', desc: 'Workday, Greenhouse, Taleo, iCIMS' },
            { label: 'STAR Quantification', desc: 'Measurable metric rewrites' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--success-bg)', color: 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={11} strokeWidth={3} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{item.label}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Simulator */}
      <section id="interactive-demo" style={{ maxWidth: 1040, margin: '0 auto 64px', padding: '0 20px' }}>
        <div className="card" style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 4 }}>Interactive Demo</span>
              <h2 style={{ fontSize: '1.5rem' }}>Live Neural Resume Scanner</h2>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setDemoStep(1); triggerDemoScan(); }}
              disabled={demoScanning}
            >
              <RefreshCw size={13} className={demoScanning ? 'spinner' : ''} />
              {demoScanning ? 'Evaluating...' : 'Re-Run Demo'}
            </button>
          </div>

          <div className="grid-2" style={{ gap: 24 }}>
            {/* Left Column: Interactive Sample Bullets */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              fontSize: '0.825rem',
              lineHeight: 1.6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8, marginBottom: 12 }}>
                <span style={{ fontWeight: 700 }}>Alex Morgan — Staff Profile</span>
                <span className="badge badge-neutral">sample_resume.txt</span>
              </div>

              <div style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: demoStep === 2 ? 'var(--success-bg)' : 'transparent',
                border: demoStep === 2 ? '1px solid var(--success-border)' : '1px solid transparent',
                marginBottom: 8,
                transition: 'all 0.3s ease',
              }}>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>• Spearheaded</span> architectural migration to Node.js microservices, reducing p99 latency by <strong>42%</strong> for <strong>1.5M MAU</strong>.
                {demoStep === 2 && <span className="badge badge-success" style={{ marginLeft: 6, fontSize: '0.65rem' }}>Strong Impact</span>}
              </div>

              <div style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: demoStep === 2 ? 'var(--danger-bg)' : 'transparent',
                border: demoStep === 2 ? '1px solid var(--danger-border)' : '1px solid transparent',
                marginBottom: 8,
                transition: 'all 0.3s ease',
              }}>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>• Helped with</span> database query optimization and wrote queries.
                {demoStep === 2 && <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: '0.65rem' }}>Weak Phrasing</span>}
              </div>

              <div style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: demoStep === 2 ? 'var(--info-bg)' : 'transparent',
                border: demoStep === 2 ? '1px solid var(--info-border)' : '1px solid transparent',
                transition: 'all 0.3s ease',
              }}>
                <span style={{ color: 'var(--info)', fontWeight: 700 }}>• Engineered</span> real-time streaming pipeline handling 50k events/sec.
                {demoStep === 2 && <span className="badge badge-info" style={{ marginLeft: 6, fontSize: '0.65rem' }}>Quantified</span>}
              </div>
            </div>

            {/* Right Column: Instant Intelligence Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {demoScanning ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200, textAlign: 'center' }}>
                  <div className="spinner" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Simulating parsers & computing impact metrics...</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    <ScoreCircle score={demoStep === 2 ? 82 : null} size={80} label="Score" />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: 2 }}>{demoStep === 2 ? '82% ATS Readiness' : 'Click to Scan Sample'}</h4>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                        {demoStep === 2 ? '2 strong quantified statements, 1 weak phrasing detected.' : 'See real-time breakdown of parsing and impact metrics.'}
                      </p>
                    </div>
                  </div>

                  {demoStep === 2 ? (
                    <div style={{ padding: '14px 16px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          STAR Revision Suggestion
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => copyRewrite('Optimized 20+ critical PostgreSQL queries with composite indexing, boosting throughput by 30% across 5M daily records.')}
                        >
                          {copiedBullet ? <><CheckCheck size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                        </button>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: 4 }}>
                        "Optimized 20+ critical PostgreSQL queries with composite indexing, boosting throughput by 30% across 5M daily records."
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Replaced passive phrasing with quantified business outcome.
                      </span>
                    </div>
                  ) : (
                    <button className="btn btn-primary" onClick={triggerDemoScan}>
                      <Play size={15} />
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
      <section style={{ maxWidth: 1040, margin: '0 auto 64px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: 6 }}>
            Engineered for Modern Engineering & Leadership Roles
          </h2>
          <p style={{ fontSize: '0.9rem' }}>Comprehensive diagnostics designed to advance candidates past automatic screening filters.</p>
        </div>

        <div className="features-grid" style={{ marginBottom: 0 }}>
          {features.map(feature => (
            <div key={feature.title} className="feature-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <span className="badge badge-primary">{feature.tag}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>{feature.title}</h3>
              <p style={{ fontSize: '0.825rem', lineHeight: 1.55 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '48px 20px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>
            Start Optimizing Your Career Today
          </h2>
          <p style={{ fontSize: '0.875rem', marginBottom: 20 }}>
            Upload your resume now and get explainable feedback, ATS simulation, and STAR rewrites in seconds.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
            Get Started Free
            <ArrowRight size={16} />
          </button>
        </div>
        <div style={{ marginTop: 32, fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} ResumeIQ — Built for modern engineering and leadership careers.
        </div>
      </footer>
    </div>
  );
}
