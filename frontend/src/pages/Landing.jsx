import { useNavigate } from 'react-router-dom';
import {
  Zap, Shield, Brain, Target, BarChart3, Eye,
  FileText, CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain size={22} />,
      title: 'Semantic Job-Fit Matching',
      description: 'Goes beyond keywords — understands that "led a team" matches "managed personnel" using AI-powered semantic analysis.',
    },
    {
      icon: <Shield size={22} />,
      title: 'ATS Simulation Engine',
      description: 'Tests your resume against real ATS parsing failure modes used by Workday, Greenhouse, Taleo, and iCIMS.',
    },
    {
      icon: <Target size={22} />,
      title: 'Action-Verb & Impact Scoring',
      description: 'Flags weak verbs and unquantified achievements, then suggests STAR-format rewrites with measurable impact.',
    },
    {
      icon: <Eye size={22} />,
      title: 'Recruiter Attention Heatmap',
      description: 'Simulates a 6-second recruiter scan and shows where their eyes actually land on your resume.',
    },
    {
      icon: <BarChart3 size={22} />,
      title: 'Explainable Composite Score',
      description: 'Five sub-scores with plain-English reasoning — every point is tied to a specific line in your resume.',
    },
    {
      icon: <Sparkles size={22} />,
      title: 'AI Coaching, Not Just Grading',
      description: 'Every finding comes with a concrete suggestion or AI-powered rewrite. Coach over grader, always.',
    },
  ];

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="landing-content">
        {/* Navigation */}
        <nav className="landing-nav">
          <div className="logo">
            <div style={{
              width: 36, height: 36,
              background: 'var(--accent-gradient)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '0.9rem'
            }}>
              IQ
            </div>
            <h1>ResumeIQ</h1>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/auth')}>
              Log In
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/auth')}>
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">
            <Zap size={14} />
            AI-Powered Resume Intelligence
          </div>

          <h1>
            Your Resume, Analyzed<br />
            Like a <span className="gradient-text">Real Recruiter</span>
          </h1>

          <p className="subtitle">
            ResumeIQ goes past keyword-matching. It understands your resume semantically,
            simulates how real ATS systems actually behave, and coaches you iteratively — not just grades you.
          </p>

          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
              <FileText size={18} />
              Analyze Your Resume
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => {
              document.querySelector('.features-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              See How It Works
            </button>
          </div>

          {/* Trust signals */}
          <div style={{
            display: 'flex', gap: 'var(--space-xl)', justifyContent: 'center',
            flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.85rem'
          }}>
            {[
              ['5 Sub-Scores', 'explainable, not black-box'],
              ['4 ATS Engines', 'simulated parsing tests'],
              ['AI Coaching', 'STAR-format rewrites'],
            ].map(([title, sub]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                <span><strong style={{ color: 'var(--text-primary)' }}>{title}</strong> — {sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <div className="features-grid">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="feature-card"
              style={{ animationDelay: `${i * 100}ms`, animation: 'slideUp 0.6s ease forwards', opacity: 0 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{
          textAlign: 'center', padding: 'var(--space-3xl) 0', marginTop: 'var(--space-3xl)',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>
            Ready to <span className="gradient-text">level up</span> your resume?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>
            Upload your resume and get actionable insights in under 30 seconds.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
            Get Started Free
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
