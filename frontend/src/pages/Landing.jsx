import { useNavigate } from 'react-router-dom';
import {
  Shield, Brain, Target, BarChart3, Eye,
  FileText, CheckCircle2, ArrowRight, Sparkles,
  Zap, Check, Layers, Cpu, Compass
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const navigate = useNavigate();

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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>ResumeIQ</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <ThemeToggle />
          <button className="btn btn-ghost" onClick={() => navigate('/auth')}>
            Sign In
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>
            Get Started Free
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
            onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Compass size={18} />
            Explore Methodology
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
          maxWidth: 720,
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
                display: 'flex', alignItems: 'center', justifyContent: 'center'
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

      {/* Feature Grid */}
      <section id="features-section" style={{ maxWidth: 1200, margin: '0 auto var(--space-3xl)', padding: '0 var(--space-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-xs)' }}>
            Engineered for Modern Hiring Pipelines
          </h2>
          <p>Every feature is designed to elevate candidate profiles from automatic rejection to interview shortlist.</p>
        </div>

        <div className="features-grid" style={{ marginBottom: 0 }}>
          {features.map((feature, i) => (
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

      {/* Comparison / Senior Engineering Section */}
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
