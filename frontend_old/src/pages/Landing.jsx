import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Shield, Target, Sparkles, Zap,
  ArrowRight, CheckCheck, Play, CheckCircle2, Cpu,
  RefreshCw, Copy, Eye, BarChart2
} from 'lucide-react';
import ScoreCircle from '../components/ScoreCircle';
import BrandLogo from '../components/BrandLogo';

export default function Landing() {
  const navigate = useNavigate();

  // Interactive Live Document Simulator State
  const [activeDemoTab, setActiveDemoTab] = useState('simulated_ats');
  const [simulatedScore, setSimulatedScore] = useState(84);
  const [copiedRewrite, setCopiedRewrite] = useState(false);

  const sampleDemoLines = [
    { num: 1, text: "Alexandria Morgan", type: "header" },
    { num: 2, text: "alex.morgan@domain.com | (555) 019-2834 | San Francisco, CA", type: "contact" },
    { num: 3, text: "PROFESSIONAL SUMMARY", type: "section" },
    { num: 4, text: "Staff Software Engineer with 8+ years designing high-throughput distributed systems and AI platforms.", type: "text" },
    { num: 5, text: "WORK EXPERIENCE", type: "section" },
    { num: 6, text: "• Spearheaded monolithic API migration to Node.js microservices, cutting p99 latency by 42% for 2M users.", type: "strong" },
    { num: 7, text: "• Helped with database query optimization and team sprint planning.", type: "weak" },
    { num: 8, text: "• Engineered real-time data streaming pipeline with Redis and WebSockets, processing 65k events/sec.", type: "strong" },
    { num: 9, text: "TECHNICAL SKILLS", type: "section" },
    { num: 10, text: "TypeScript, React, Node.js, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, CI/CD", type: "skills" },
  ];

  return (
    <div className="landing">
      {/* Precision Top Navbar */}
      <nav className="landing-nav">
        <BrandLogo size="md" badgeText="100% Free SaaS" />

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/auth')}>
            Sign In
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>
            Launch Workspace
            <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="announcement-badge">
          <Cpu size={13} />
          <span>Zero Subscription • 100% Free Open SaaS Access</span>
        </div>

        <h1 style={{ fontSize: '2.75rem', lineHeight: 1.15, marginBottom: 16 }}>
          The Engineering Standard for <br />
          <span className="gradient-text">ATS Resume Intelligence</span>
        </h1>

        <p style={{ fontSize: '1.05rem', maxWidth: 620, margin: '0 auto 28px', color: 'var(--text-secondary)' }}>
          Simulate enterprise ATS parsers (Workday, Greenhouse, Taleo, iCIMS), quantify Google XYZ / STAR bullet achievements, and pass recruiter 6-second cognitive screens.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 48 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
            Evaluate Your Resume Free
            <ArrowRight size={15} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => {
            const el = document.getElementById('interactive-demo');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <Play size={14} style={{ color: 'var(--accent-primary)' }} />
            View Live Simulator
          </button>
        </div>

        {/* Floating Verification Strip */}
        <div style={{
          display: 'inline-flex',
          gap: 20,
          padding: '10px 22px',
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-xs)',
          fontSize: '0.775rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-display)', fontWeight: 600 }}>
            <CheckCircle2 size={13} style={{ color: 'var(--success)' }} /> Workday & Taleo Emulation
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-display)', fontWeight: 600 }}>
            <CheckCircle2 size={13} style={{ color: 'var(--success)' }} /> STAR Metric Scoring
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-display)', fontWeight: 600 }}>
            <CheckCircle2 size={13} style={{ color: 'var(--success)' }} /> 6s Recruiter Eye-Dwell Replay
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-display)', fontWeight: 600 }}>
            <CheckCircle2 size={13} style={{ color: 'var(--success)' }} /> 100% Free SaaS
          </span>
        </div>
      </header>

      {/* Interactive Split-Pane Product Demonstration */}
      <section id="interactive-demo" style={{ maxWidth: 1200, margin: '0 auto 72px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)' }}>
            Interactive Intelligence Workspace
          </span>
          <h2 style={{ fontSize: '1.8rem', marginTop: 4 }}>Real-Time Document Sheet & Diagnostics</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          background: '#ffffff',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          boxShadow: 'var(--shadow-paper)',
        }}>
          {/* Left: Interactive Simulated Document Sheet */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Document Canvas (Alexandria Morgan)
                </span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.675rem' }}>Live Parsed</span>
            </div>

            <div className="document-paper-canvas" style={{ minHeight: 380, padding: 22 }}>
              {sampleDemoLines.map(line => {
                if (line.type === 'header') {
                  return <div key={line.num} style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09090b', marginBottom: 2 }}>{line.text}</div>;
                }
                if (line.type === 'contact') {
                  return <div key={line.num} style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: 12 }}>{line.text}</div>;
                }
                if (line.type === 'section') {
                  return <div key={line.num} className="paper-section-title">{line.text}</div>;
                }

                let highlight = '';
                if (line.type === 'strong') highlight = 'highlight-strong';
                if (line.type === 'weak') highlight = 'highlight-weak';

                return (
                  <div key={line.num} className={`paper-line ${highlight}`} style={{ margin: '2px 0' }}>
                    <span className="paper-line-num">{line.num}</span>
                    <span style={{ flex: 1 }}>{line.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Live Diagnostics Inspector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Top Score Strip */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <ScoreCircle score={simulatedScore} size={74} strokeWidth={7} />
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>84 / 100 ATS Score</h3>
                    <p style={{ fontSize: '0.775rem', color: 'var(--success)' }}>
                      ✓ Clears Enterprise Workday & Greenhouse thresholds
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSimulatedScore(prev => (prev === 84 ? 92 : 84))}
                >
                  <RefreshCw size={12} />
                  Simulate Optimization
                </button>
              </div>
            </div>

            {/* Segmented Demo Tabs */}
            <div className="segmented-nav" style={{ marginBottom: 0 }}>
              <button
                className={`segmented-item ${activeDemoTab === 'simulated_ats' ? 'active' : ''}`}
                onClick={() => setActiveDemoTab('simulated_ats')}
              >
                <Shield size={13} />
                ATS Diagnostics
              </button>
              <button
                className={`segmented-item ${activeDemoTab === 'star_rewrite' ? 'active' : ''}`}
                onClick={() => setActiveDemoTab('star_rewrite')}
              >
                <Sparkles size={13} />
                STAR Transformation
              </button>
            </div>

            {activeDemoTab === 'simulated_ats' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="finding-item">
                  <div className="finding-severity strong" />
                  <div className="finding-content">
                    <div className="finding-category">ACTION VERB DENSITY</div>
                    <div className="finding-message">Strong Tier-1 leadership verbs detected: "Spearheaded", "Engineered".</div>
                  </div>
                </div>

                <div className="finding-item">
                  <div className="finding-severity weak" />
                  <div className="finding-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div className="finding-category">UNQUANTIFIED BULLET (LINE 7)</div>
                      <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>-10 pts</span>
                    </div>
                    <div className="finding-message">"Helped with database query optimization..." lacks measurable metrics.</div>
                    <div className="finding-suggestion">
                      <strong>Fix:</strong> Specify the latency reduction percentage, throughput increase, or database scale.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rewrite-card" style={{ marginBottom: 0 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--danger-text)', marginBottom: 4 }}>
                  Line 7 Original (Passive)
                </div>
                <div className="rewrite-original" style={{ fontSize: '0.775rem' }}>
                  "Helped with database query optimization and team sprint planning."
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--success-text)' }}>
                    STAR Quantified Upgrade
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText("Optimized PostgreSQL indexes and query plans, reducing p95 database response latency by 35% across 45M daily records.");
                      setCopiedRewrite(true);
                      setTimeout(() => setCopiedRewrite(false), 2000);
                    }}
                    style={{ fontSize: '0.675rem', padding: '2px 7px' }}
                  >
                    {copiedRewrite ? <><CheckCheck size={10} style={{ color: 'var(--success)' }} /> Copied</> : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
                <div className="rewrite-suggested" style={{ fontSize: '0.8rem' }}>
                  "Optimized PostgreSQL indexes and query plans, reducing p95 database response latency by 35% across 45M daily records."
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6 Core Capability Cards */}
      <section style={{ maxWidth: 1200, margin: '0 auto 72px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)' }}>
            System Architecture
          </span>
          <h2 style={{ fontSize: '1.8rem', marginTop: 4 }}>Deterministic ATS Intelligence Pipeline</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ marginBottom: 14 }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>Multi-Platform ATS Emulation</h3>
            <p style={{ fontSize: '0.825rem' }}>
              Identifies parsing pitfalls across Workday, Greenhouse, Taleo, and iCIMS before your application reaches a human recruiter.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ marginBottom: 14 }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>Google XYZ / STAR Formulation</h3>
            <p style={{ fontSize: '0.825rem' }}>
              Transforms weak passive duties (*"Responsible for..."*) into quantified achievement statements (*"Accomplished [X] by [Y] measured by [Z]"*).
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ marginBottom: 14 }}>
              <Eye size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>6s Recruiter Eye-Dwell Replay</h3>
            <p style={{ fontSize: '0.825rem' }}>
              Simulates visual F-pattern scanning to ensure critical skills and leadership metrics land directly within recruiter attention zones.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ marginBottom: 14 }}>
              <Target size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>Hard & Soft Skill Gap Match</h3>
            <p style={{ fontSize: '0.825rem' }}>
              Compares your resume against specific target Job Descriptions to surface high-value missing competencies.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ marginBottom: 14 }}>
              <BarChart2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>5-Axis Explainable Radar</h3>
            <p style={{ fontSize: '0.825rem' }}>
              Transparent mathematical scoring weighted across Impact (30%), ATS Health (25%), Keywords (20%), Formatting (15%), and Readability (10%).
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ marginBottom: 14 }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>Grounded Interview Anticipator</h3>
            <p style={{ fontSize: '0.825rem' }}>
              Predicts technical and behavioral interview questions tied directly to the claims and metrics in your uploaded resume.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: ResumeIQ vs Legacy Keyword Checkers */}
      <section style={{ maxWidth: 960, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.75rem' }}>ResumeIQ vs Legacy Keyword Counters</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>How deep semantic parsing outperforms basic substring matching.</p>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-display)' }}>Feature Dimension</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-muted)' }}>Legacy Keyword Tools</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--accent-primary)' }}>ResumeIQ Platform</th>
              </tr>
            </thead>
            <tbody>
              {[
                { dim: 'ATS Architecture Emulation', legacy: 'Simple string frequency count', iq: 'Multi-platform failure mode simulation (Workday, Taleo, Greenhouse)' },
                { dim: 'Impact Scoring', legacy: 'Not supported', iq: 'Google XYZ / STAR leadership verb quantification' },
                { dim: 'Recruiter Attention Simulation', legacy: 'None', iq: 'Interactive 6-second F-pattern eye-tracking dwell player' },
                { dim: 'Pricing Model', legacy: '$20 - $40 / month subscriptions', iq: '100% Free Open SaaS (Zero Paywalls)' },
                { dim: 'Document Canvas View', legacy: 'Plain text dump', iq: 'Real formatted document sheet with line-linked annotations' },
              ].map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: rIdx < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-display)' }}>{row.dim}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>{row.legacy}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--success-text)', background: 'rgba(5, 150, 105, 0.03)' }}>
                    ✓ {row.iq}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section style={{ maxWidth: 860, margin: '0 auto 80px', padding: '0 24px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '44px 28px', background: '#ffffff', border: '1px solid var(--border-strong)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 8 }}>Ready to audit your resume like a senior engineer?</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 24px' }}>
            Get instant ATS gatekeeper diagnostics, STAR rewrites, and target job matching without paying for a subscription.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')}>
            Get Started Free Now
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
