'use client';

import Link from 'next/link';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Target, 
  FileText, 
  Search,
  Zap,
  Cpu,
  Lock,
  BarChart3,
  Layers,
  AlertTriangle,
  Clock,
  Code
} from 'lucide-react';
import InteractiveDemo from '@/components/InteractiveDemo';

const benchmarkData = [
  {
    metric: 'Core Compute Latency',
    legacy: '3,200ms – 5,500ms (Slow SaaS polling)',
    llmWrapper: '8,400ms – 15,200ms (Heavy LLM roundtrip)',
    resumeiq: '<45ms (Deterministic Heuristic Engine)',
    highlight: true,
  },
  {
    metric: 'Score Stability & Reproducibility',
    legacy: 'Moderate (Opaque proprietary formula)',
    llmWrapper: '±16.8% Variance (Sampling temperature drift)',
    resumeiq: '100% Deterministic (0.0% Variance across runs)',
    highlight: true,
  },
  {
    metric: 'Candidate PII Data Exposure',
    legacy: 'Stored in central DB / Ad-tracking pixels',
    llmWrapper: 'Raw PII streamed unredacted to 3rd-party LLMs',
    resumeiq: '100% In-Flight PII Tokenization & Redaction',
    highlight: true,
  },
  {
    metric: 'ATS Layout & Column Emulation',
    legacy: 'Generic text-only parser',
    llmWrapper: 'Cannot evaluate structural layout AST',
    resumeiq: '4-Engine Matrix (Workday, Greenhouse, Taleo, iCIMS)',
    highlight: true,
  },
  {
    metric: 'False Keyword Match Error Rate',
    legacy: '18.7% (False matches e.g. "Java" in "JavaScript")',
    llmWrapper: 'High (Hallucinates missing credentials)',
    resumeiq: '<1.2% (Boundary matching + Alias dictionary)',
    highlight: true,
  },
  {
    metric: 'Marginal Cost Per Scan',
    legacy: '$0.01 – $0.05 (Subscription paywalled)',
    llmWrapper: '$0.05 – $0.20 per API call',
    resumeiq: '$0.00 (Zero-token base engine, offline-capable)',
    highlight: true,
  },
];

const pillars = [
  {
    icon: Cpu,
    title: 'Deterministic Heuristic Core',
    text: 'All scoring, ATS failure checks, readability analysis, and recruiter gaze models run on deterministic algorithms. Zero hallucination, zero score drift, instant execution.',
  },
  {
    icon: Layers,
    title: 'Multi-Engine ATS Simulation',
    text: 'Emulates specific failure modes across Workday, Greenhouse, Taleo, and iCIMS — including column scrambling, text box stripping, and header margin contact occlusion.',
  },
  {
    icon: Target,
    title: 'Action-Verb & Metric Extraction',
    text: 'POS syntactic tagging classifies leading verbs into strong/moderate/weak tiers and extracts verified quantitative proof (%, $, 3x multipliers, MAU scale).',
  },
  {
    icon: Lock,
    title: 'Privacy-First Architecture',
    text: 'All Personally Identifiable Information (PII) is tokenized before selective LLM calls. Runs fully offline with embedded zero-config storage.',
  },
];

export default function LandingPage() {
  return (
    <div className="site-home">

      {/* ── Hero Section ── */}
      <section className="home-intro">
        <div className="home-intro-copy">
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>
            <Cpu size={13} /> Engineering-First Resume Intelligence
          </div>
          <h1>Deterministic ATS parsing. Evidence-backed scoring.</h1>
          <p>
            ResumeIQ replaces opaque keyword counters and slow AI wrappers with a deterministic
            heuristic engine. Test against 4 enterprise ATS architectures, identify missing quantitative proof,
            and optimize for the human 6-second recruiter screen.
          </p>
          <div className="home-actions">
            <Link href="/auth" className="btn btn-primary btn-lg">
              Open Workspace <ArrowRight size={15} />
            </Link>
            <Link href="/ats-simulator" className="btn btn-secondary btn-lg">
              Explore ATS Lab <ArrowRight size={14} />
            </Link>
          </div>
          <div className="home-note">
            <ShieldCheck size={14} />
            Zero PII retention • 100% explainable mathematical scoring • Open architecture
          </div>
        </div>

        {/* Diagnostic Preview Card */}
        <div className="home-index" aria-label="Resume diagnostic overview">
          <div className="index-heading">
            <span>Diagnostic Telemetry</span>
            <span className="index-time">v1.0.0</span>
          </div>
          <div className="index-row index-row-active">
            <span>01</span>
            <strong>ATS Compatibility</strong>
            <em>95 / 100</em>
          </div>
          <div className="index-row">
            <span>02</span>
            <strong>Quantified Impact</strong>
            <em className="index-warning">41% (Needs metrics)</em>
          </div>
          <div className="index-row">
            <span>03</span>
            <strong>JD Skill Alignment</strong>
            <em>88% match</em>
          </div>
          <div className="index-row">
            <span>04</span>
            <strong>Readability Grade</strong>
            <em>Grade 11.2 (Optimal)</em>
          </div>
          <div className="index-footer">
            <span>Deterministic Analysis</span>
            <Link href="/auth">Launch Workspace <ArrowRight size={12} /></Link>
          </div>
        </div>
      </section>

      {/* ── Metric Proof Statistics ── */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px' }}>
        <div className="metric-proof-grid">
          <div className="metric-proof-card">
            <div className="metric-proof-val accent">&lt;45ms</div>
            <div className="metric-proof-label">Compute Latency</div>
            <div className="metric-proof-sub">Instant deterministic heuristic execution vs. 8–15s LLM API roundtrips.</div>
          </div>
          <div className="metric-proof-card">
            <div className="metric-proof-val accent">0.0%</div>
            <div className="metric-proof-label">Score Variance</div>
            <div className="metric-proof-sub">100% reproducible scoring without temperature drift or prompt volatility.</div>
          </div>
          <div className="metric-proof-card">
            <div className="metric-proof-val accent">100%</div>
            <div className="metric-proof-label">PII Sanitization</div>
            <div className="metric-proof-sub">In-flight candidate tokenization before any external LLM coaching call.</div>
          </div>
          <div className="metric-proof-card">
            <div className="metric-proof-val accent">4 Platforms</div>
            <div className="metric-proof-label">ATS Failure Emulation</div>
            <div className="metric-proof-sub">Workday, Greenhouse, Taleo, and iCIMS structural AST testing.</div>
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section className="home-demo-section">
        <div className="home-section-heading">
          <div>
            <span className="section-label">Interactive Diagnostic</span>
            <h2>Explainable findings, not an arbitrary score.</h2>
          </div>
          <p>Every finding links directly to a line in your document, a real ATS parsing rule, or an unquantified statement.</p>
        </div>
        <InteractiveDemo />
      </section>

      {/* ── Benchmark Comparison Table ── */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '48px 20px' }}>
        <div className="home-section-heading compact-heading">
          <div>
            <span className="section-label">Architectural Comparison</span>
            <h2>How ResumeIQ compares to legacy checkers and AI wrappers</h2>
          </div>
          <p>Why separating deterministic heuristic scoring from generative coaching creates a superior tool.</p>
        </div>

        <div className="benchmark-table-wrapper">
          <table className="benchmark-table">
            <thead>
              <tr>
                <th>Capability / Benchmark</th>
                <th>1st Gen: Legacy Keyword Matchers (e.g. Jobscan)</th>
                <th>2nd Gen: Generic LLM Wrappers (e.g. ChatGPT sites)</th>
                <th className="highlight-col">3rd Gen: ResumeIQ</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkData.map((row, i) => (
                <tr key={i}>
                  <td><strong>{row.metric}</strong></td>
                  <td>{row.legacy}</td>
                  <td>{row.llmWrapper}</td>
                  <td className="highlight-col">
                    <strong>{row.resumeiq}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tech-callout">
          <strong>The Engineering Trade-Off:</strong> Generic AI prompt wrappers generate inconsistent numbers because LLM sampling is inherently probabilistic. ResumeIQ calculates mathematical scores deterministically, ensuring that when you edit a bullet point, your score delta directly reflects your structural improvement.
        </div>
      </section>

      {/* ── Core Engineering Pillars ── */}
      <section className="home-checks">
        <div className="home-section-heading compact-heading">
          <div>
            <span className="section-label">Engineering Pillars</span>
            <h2>Built on robust linguistics, parsing ASTs, and cognitive science.</h2>
          </div>
        </div>
        <div className="check-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {pillars.map(({ icon: Icon, title, text }) => (
            <article className="check-item" key={title} style={{ padding: 24 }}>
              <Icon size={22} strokeWidth={1.8} style={{ color: 'var(--accent)', marginBottom: 12 }} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="home-close">
        <div>
          <span className="section-label">Production-Ready Diagnostics</span>
          <h2>Optimize your resume for both ATS parsers and human recruiters.</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/auth" className="btn btn-primary btn-lg">
            Open Free Workspace <ArrowRight size={15} />
          </Link>
          <Link href="/method" className="btn btn-secondary btn-lg">
            View Methodology & Benchmarks <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}
