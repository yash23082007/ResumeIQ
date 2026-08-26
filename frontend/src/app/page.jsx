'use client';

import Link from 'next/link';
import { 
  Cpu, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Target, 
  HelpCircle, 
  Zap, 
  FileSearch, 
  TrendingUp,
  Database,
  Lock,
  GitBranch,
  Check,
  X,
  FileText,
  Search
} from 'lucide-react';
import InteractiveDemo from '@/components/InteractiveDemo';
import ScrollReveal from '@/components/ScrollReveal';

const checks = [
  { icon: FileText, title: 'Readable structure', text: 'Find layout and section choices that make a resume harder for hiring systems to parse.' },
  { icon: Target, title: 'Evidence of impact', text: 'Spot vague bullets and turn responsibilities into specific proof of what changed.' },
  { icon: Search, title: 'Role alignment', text: 'Compare your experience with a real job description and see what is still missing.' },
];

export default function LandingPage() {
  return (
    <div className="site-home">
      <section className="home-intro">
        <div className="home-intro-copy">
          <div className="eyebrow"><span className="eyebrow-mark" /> A clearer second pair of eyes</div>
          <h1>Make your resume easier to shortlist.</h1>
          <p>ResumeIQ reviews the document you actually send: how it reads, what it proves, and how closely it fits the role.</p>
          <div className="home-actions">
            <Link href="/auth" className="btn btn-primary btn-lg">Review my resume <ArrowRight size={16} /></Link>
            <Link href="/ats-simulator" className="text-action">Try the ATS check <ArrowRight size={14} /></Link>
          </div>
          <div className="home-note"><ShieldCheck size={15} /> Your document stays private while you work</div>
        </div>
        <div className="home-index" aria-label="Resume review overview">
          <div className="index-heading"><span>Resume review</span><span className="index-time">2 min read</span></div>
          <div className="index-row index-row-active"><span>01</span><strong>Structure</strong><em>Clear</em></div>
          <div className="index-row"><span>02</span><strong>Evidence</strong><em className="index-warning">Needs work</em></div>
          <div className="index-row"><span>03</span><strong>Role fit</strong><em>Ready</em></div>
          <div className="index-footer"><span>Last checked today</span><Link href="/auth">Open workspace <ArrowRight size={13} /></Link></div>
        </div>
      </section>

      <section className="home-demo-section">
        <div className="home-section-heading"><div><span className="section-label">A useful preview</span><h2>See the review before you sign in.</h2></div><p>The feedback is built around decisions you can make, not a mysterious score.</p></div>
        <InteractiveDemo />
      </section>

      <section className="home-checks">
        <div className="home-section-heading compact-heading"><div><span className="section-label">What gets checked</span><h2>Good resumes make the important parts obvious.</h2></div></div>
        <div className="check-grid">
          {checks.map(({ icon: Icon, title, text }) => (
            <article className="check-item" key={title}><Icon size={20} strokeWidth={1.8} /><h3>{title}</h3><p>{text}</p><CheckCircle2 size={15} className="check-item-status" /></article>
          ))}
        </div>
      </section>

      <section className="home-close"><div><span className="section-label">Start with the document</span><h2>Bring the next application into focus.</h2></div><Link href="/auth" className="btn btn-primary">Open your workspace <ArrowRight size={15} /></Link></section>
    </div>
  );
}

function LegacyLandingPage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* ─── Hero Section ─── */}
      <section className="hero-section">
        <div className="hero-content animate-in">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Resume review, without the guesswork</span>
          </div>

          <h1 className="hero-title">Make your resume easier to shortlist.</h1>

          <p className="hero-subtitle">
            ResumeIQ checks the things that decide whether your experience gets noticed: clear structure, relevant skills, and evidence of impact.
          </p>

          <div className="hero-actions">
            <Link href="/auth" className="btn btn-primary btn-lg">
              Review my resume <ArrowRight size={16} />
            </Link>
            <Link href="/features" className="btn btn-secondary btn-lg">
              See how it works
            </Link>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <CheckCircle2 size={16} className="hero-trust-icon" />
              <span>Private by default</span>
            </div>
            <div className="hero-trust-item">
              <CheckCircle2 size={16} className="hero-trust-icon" />
              <span>Actionable feedback</span>
            </div>
            <div className="hero-trust-item">
              <CheckCircle2 size={16} className="hero-trust-icon" />
              <span>Free to get started</span>
            </div>
          </div>
        </div>

        <div className="hero-review-preview" aria-label="Resume review preview">
          <div className="preview-topbar">
            <div className="preview-file"><FileText size={15} /> Alex Chen / Resume.pdf</div>
            <span className="preview-status"><span /> Ready to review</span>
          </div>
          <div className="preview-body">
            <div className="preview-document">
              <div className="preview-name">ALEX CHEN</div>
              <div className="preview-role">SENIOR SOFTWARE ENGINEER</div>
              <div className="preview-rule" />
              <div className="preview-heading">EXPERIENCE</div>
              <div className="preview-line preview-line-long" />
              <div className="preview-line preview-line-full" />
              <div className="preview-line preview-line-medium" />
              <div className="preview-heading">SELECTED IMPACT</div>
              <div className="preview-line preview-line-full preview-marked" />
              <div className="preview-line preview-line-long" />
              <div className="preview-line preview-line-short" />
            </div>
            <div className="preview-findings">
              <div className="preview-findings-label">FIRST LOOK</div>
              <div className="preview-score"><strong>78</strong><span>/ 100</span></div>
              <div className="preview-finding"><span className="finding-dot finding-good" /> Structure reads cleanly</div>
              <div className="preview-finding"><span className="finding-dot finding-warn" /> Add impact to 2 bullets</div>
              <div className="preview-finding"><span className="finding-dot finding-good" /> Skills match your target</div>
              <Link href="/auth" className="preview-link">Open full review <ArrowRight size={13} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Interactive Product Sandbox ─── */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 60 }}>
        <ScrollReveal>
          <div className="section-header" style={{ marginBottom: 28 }}>
            <span className="section-label">Live Interactive Engine Sandbox</span>
            <h2 className="section-title">See How the Parsing Engine Evaluates Documents</h2>
            <p className="section-desc">
              Test how modern Applicant Tracking Systems deconstruct resumes, highlight missing metrics, and compute visual dwell time.
            </p>
          </div>
          <InteractiveDemo />
        </ScrollReveal>
      </section>

      {/* ─── Real Engine Technical Specs Strip ─── */}
      <section className="section-alt">
        <div className="section-inner">
          <ScrollReveal>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value gradient-text">4</div>
                <div className="stat-label">ATS Simulation Profiles</div>
                <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>
                  <span>Workday, Taleo, Greenhouse, Lever</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-value gradient-text">12</div>
                <div className="stat-label">Diagnostic Vectors</div>
                <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>
                  <span>Hard Skills, Soft Skills, STAR, Format</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-value gradient-text">LLaMA 3.3</div>
                <div className="stat-label">70B Parameter Inference</div>
                <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>
                  <span>Groq AI Ultra-Low Latency Engine</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-value gradient-text">$0</div>
                <div className="stat-label">100% Free Forever</div>
                <div className="stat-trend" style={{ color: 'var(--success)' }}>
                  <span>No Subscriptions • Open Source</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Asymmetric Bento Grid Features ─── */}
      <section className="section">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-label">Core Platform Capabilities</span>
            <h2 className="section-title">Engineered to Solve Real Hiring Bottlenecks</h2>
            <p className="section-desc">
              Most resume tools rely on basic regex keyword counters. ResumeIQ combines natural language parsing, LLM semantic scoring, and simulated recruiter attention modeling.
            </p>
          </div>

          <div className="bento-grid">
            {/* Hero Tile 1: Multi-Engine ATS Simulation */}
            <div className="bento-item">
              <div className="bento-icon">
                <Cpu size={24} />
              </div>
              <h3 className="bento-title">Multi-Engine ATS Parser Simulation</h3>
              <p className="bento-desc" style={{ marginBottom: 16 }}>
                Simulate how specific enterprise ATS platforms (Workday, Taleo, Greenhouse, Lever) deconstruct multi-column formatting, text boxes, and table layouts. Avoid automated disqualification from unparseable structures.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">Column Collision Detection</span>
                <span className="badge badge-primary">Font Normalization</span>
                <span className="badge badge-primary">Section Heading Standardization</span>
              </div>
            </div>

            {/* Tile 2: STAR Formula Quantifier */}
            <div className="bento-item">
              <div className="bento-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                <Sparkles size={24} />
              </div>
              <h3 className="bento-title">STAR Metric Rewriter</h3>
              <p className="bento-desc">
                Identifies weak, unquantified bullet points and automatically drafts high-impact Situation-Task-Action-Result alternatives with concrete metrics.
              </p>
            </div>

            {/* Tile 3: 6-Second Recruiter Attention Model */}
            <div className="bento-item">
              <div className="bento-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <Eye size={24} />
              </div>
              <h3 className="bento-title">6-Second Recruiter Replay</h3>
              <p className="bento-desc">
                Simulates real-world hiring manager gaze paths, highlighting whether your most critical accomplishments land in the prime visual scan zones.
              </p>
            </div>

            {/* Tile 4: Interview Question Predictor */}
            <div className="bento-item">
              <div className="bento-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                <HelpCircle size={24} />
              </div>
              <h3 className="bento-title">AI Interview Predictor</h3>
              <p className="bento-desc">
                Anticipates tough technical and behavioral questions interviewers will ask based specifically on the experience and claims in your resume.
              </p>
            </div>

            {/* Tile 5: Target JD Semantic Matching */}
            <div className="bento-item">
              <div className="bento-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-secondary)' }}>
                <Target size={24} />
              </div>
              <h3 className="bento-title">Role-Targeted JD Matching</h3>
              <p className="bento-desc">
                Paste any target Job Description to compute true semantic match scores, pinpoint missing hard skills, and generate tailored cover letters.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── How It Works (3-Step Pipeline) ─── */}
      <section className="section-alt">
        <div className="section-inner">
          <ScrollReveal>
            <div className="section-header">
              <span className="section-label">Operational Workflow</span>
              <h2 className="section-title">From Document Ingestion to Interview Readiness</h2>
              <p className="section-desc">
                Our automated pipeline processes documents through a multi-stage NLP and LLM analytical sequence in under 5 seconds.
              </p>
            </div>

            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <h3 className="step-title">Upload & Parsing</h3>
                <p className="step-desc">
                  Upload PDF, DOCX, or TXT. The engine parses raw text into clean semantic blocks using Mammoth and Compromise NLP.
                </p>
              </div>

              <div className="step-item">
                <div className="step-number">2</div>
                <h3 className="step-title">Diagnostic Scoring</h3>
                <p className="step-desc">
                  The system runs 12 scoring checks: keyword density, ATS compliance, bullet quantification, and category balance.
                </p>
              </div>

              <div className="step-item">
                <div className="step-number">3</div>
                <h3 className="step-title">Actionable Remediation</h3>
                <p className="step-desc">
                  Receive line-by-line STAR rewrites, predicted interview prep questions, and exportable tailored resumes.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Feature Comparison Table ─── */}
      <section className="section">
        <ScrollReveal>
          <div className="section-header">
            <span className="section-label">Honest Comparison</span>
            <h2 className="section-title">How ResumeIQ Compares to Commercial Alternatives</h2>
            <p className="section-desc">
              Why pay $30–$50/month for basic keyword scrapers when you can access full-depth NLP and LLM intelligence for free?
            </p>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Capability / Feature</th>
                  <th>Commercial Scanners (Jobscan / Rezi)</th>
                  <th className="comparison-iq">ResumeIQ (Open Source)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pricing Model</strong></td>
                  <td>$29 – $49/month recurring subscription</td>
                  <td className="comparison-iq"><strong>100% Free Forever (MIT License)</strong></td>
                </tr>
                <tr>
                  <td><strong>ATS Parser Simulation</strong></td>
                  <td>Generic keyword count match</td>
                  <td className="comparison-iq"><Check size={16} style={{ color: 'var(--success)' }} /> 4 Specific Engine Modes (Workday, Greenhouse, etc.)</td>
                </tr>
                <tr>
                  <td><strong>STAR Metric Bullet Rewriting</strong></td>
                  <td>Generic AI templates or paywalled</td>
                  <td className="comparison-iq"><Check size={16} style={{ color: 'var(--success)' }} /> Situation-Task-Action-Result deep inference</td>
                </tr>
                <tr>
                  <td><strong>Recruiter Gaze Heatmap</strong></td>
                  <td>Not available</td>
                  <td className="comparison-iq"><Check size={16} style={{ color: 'var(--success)' }} /> 6-Second Attention modeling</td>
                </tr>
                <tr>
                  <td><strong>Predicted Interview Questions</strong></td>
                  <td>Paywalled add-on</td>
                  <td className="comparison-iq"><Check size={16} style={{ color: 'var(--success)' }} /> Role & experience tailored questions</td>
                </tr>
                <tr>
                  <td><strong>Data Privacy & Self-Hosting</strong></td>
                  <td>Proprietary cloud storage</td>
                  <td className="comparison-iq"><Check size={16} style={{ color: 'var(--success)' }} /> Fully open source, self-hostable in Docker</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Final CTA Banner ─── */}
      <section className="cta-section">
        <ScrollReveal>
          <div className="cta-card">
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginBottom: 12 }}>
              Ready to Audit Your Resume Like a Senior Engineer?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 28px', fontSize: '1.05rem' }}>
              Upload your resume now to run full ATS diagnostics, review STAR recommendations, and practice predicted interview questions.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth" className="btn btn-primary btn-lg">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="btn btn-secondary btn-lg">
                Read Architectural Mission
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
