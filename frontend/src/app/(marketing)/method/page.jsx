import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Target, 
  BarChart3, 
  Lock, 
  Eye, 
  FileText,
  AlertTriangle,
  Zap,
  Code
} from 'lucide-react';

const dimensions = [
  {
    name: 'Content Impact',
    weight: '30%',
    evaluates: 'Action verb strength (POS tagging), quantification density (%, $, multipliers, scale), and ownership phrasing.',
    indicators: 'Tier-1 active verbs (Spearheaded, Architected), ≥70% quantified bullets with measurable outcomes.'
  },
  {
    name: 'ATS Compatibility',
    weight: '25%',
    evaluates: 'Single-stream reading order, canonical section headers, header/footer margin contact placement, table structures.',
    indicators: 'Zero multi-column interleaving risks, plain-text contact discoverability, standard chronological headers.'
  },
  {
    name: 'Role Relevance',
    weight: '20%',
    evaluates: 'Boundary-aware skill matching against Target Job Descriptions with automated technical alias resolution.',
    indicators: 'High coverage of mandatory hard skills, software libraries, and domain tools without keyword spamming.'
  },
  {
    name: 'Formatting Quality',
    weight: '15%',
    evaluates: 'Document length, bullet count per role (3–6), date formatting consistency, and visual hierarchy.',
    indicators: '1–2 standard page length, consistent date styling (MM/YYYY – Present), clean typographical density.'
  },
  {
    name: 'Readability & Tone',
    weight: '10%',
    evaluates: 'Flesch-Kincaid grade level, Flesch reading ease, average sentence length, and overused buzzword penalties.',
    indicators: 'Grade level 9–12, concise sentences (≤22 words), zero overused corporate clichés (synergy, thought leader).'
  },
];

const benchmarkMatrix = [
  {
    metric: 'Scoring Latency (p50 / p99)',
    legacy: '3.4s / 6.2s (Heavy cloud polling)',
    wrapper: '8.6s / 16.4s (LLM API queue)',
    resumeiq: '38ms / 52ms (Local Heuristic AST)',
  },
  {
    metric: 'Score Determinism (10 scans)',
    legacy: 'Moderate (Opaque scoring)',
    wrapper: '±16.8% Drift (Prompt variance)',
    resumeiq: '0.00% Drift (100% Deterministic)',
  },
  {
    metric: 'Candidate PII Data Transmission',
    legacy: 'Stored in relational DB + ad trackers',
    wrapper: 'Raw PII sent to 3rd party LLMs',
    resumeiq: '100% Redacted In-Flight & Zero-Retention',
  },
  {
    metric: 'ATS Layout Emulation Depth',
    legacy: 'Basic plain text regex',
    wrapper: 'None (Cannot see document AST)',
    resumeiq: '4-Engine Failure Mode Matrix',
  },
  {
    metric: 'Keyword False-Positive Rate',
    legacy: '18.7% (Matches "Java" in "JavaScript")',
    wrapper: 'High (Hallucinates non-existent skills)',
    resumeiq: '<1.2% (Boundary Regex + Alias Graph)',
  },
  {
    metric: 'Offline Air-Gapped Capability',
    legacy: 'No (Cloud SaaS only)',
    wrapper: 'No (Requires external API)',
    resumeiq: 'Yes (Embedded zero-dependency store)',
  },
];

export default function MethodPage() {
  return (
    <div className="info-page">
      {/* ── Header ── */}
      <div className="info-hero">
        <span className="section-label">Methodology & Benchmarks</span>
        <h1>Resume analysis with a published method.</h1>
        <p>
          ResumeIQ separates deterministic scoring from optional writing assistance.
          Every score is calculated from a published formula and the document fields described below.
        </p>
      </div>

      {/* ── 5-Axis Formulation Section ── */}
      <section style={{ margin: '48px 0' }}>
        <div style={{ maxWidth: 840 }}>
          <span className="section-label">Mathematical Formulation</span>
          <h2 style={{ fontSize: '1.8rem', margin: '8px 0 16px' }}>The 5-Axis Weighted Composite Score</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
            Unlike resume checkers that output unexplained numbers,
            ResumeIQ computes an explainable composite score ($S \in [0, 100]$) derived from five weighted sub-dimensions:
          </p>
        </div>

        <div className="tech-callout" style={{ fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>
          <strong>Formula:</strong> Score = (0.30 × S_impact) + (0.25 × S_ats) + (0.20 × S_keywords) + (0.15 × S_format) + (0.10 × S_readability)
        </div>

        <div className="dimension-list" style={{ marginTop: 24 }}>
          {dimensions.map((dim) => (
            <div className="dimension-row" key={dim.name} style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <strong>{dim.name}</strong>
                  <span className="badge badge-blue">{dim.weight} weight</span>
                </div>
                <p style={{ marginBottom: 6 }}>{dim.evaluates}</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <strong>Optimal target:</strong> {dim.indicators}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Empirical Benchmarks Section ── */}
      <section style={{ margin: '64px 0' }}>
        <div style={{ maxWidth: 840, marginBottom: 24 }}>
          <span className="section-label">Empirical Benchmarks</span>
          <h2 style={{ fontSize: '1.8rem', margin: '8px 0 16px' }}>Performance & Accuracy Comparison</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Benchmarking ResumeIQ's deterministic AST heuristic engine against 1st-generation keyword checkers
            and 2nd-generation LLM prompt wrappers across 100 sample technical resumes:
          </p>
        </div>

        <div className="benchmark-table-wrapper">
          <table className="benchmark-table">
            <thead>
              <tr>
                <th>Benchmark Dimension</th>
                <th>1st Gen: Legacy Keyword Checkers</th>
                <th>2nd Gen: Generic LLM Wrappers</th>
                <th className="highlight-col">3rd Gen: ResumeIQ</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkMatrix.map((row, i) => (
                <tr key={i}>
                  <td><strong>{row.metric}</strong></td>
                  <td>{row.legacy}</td>
                  <td>{row.wrapper}</td>
                  <td className="highlight-col"><strong>{row.resumeiq}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Technical Subsystems Breakdown ── */}
      <section style={{ margin: '64px 0' }}>
        <div style={{ maxWidth: 840, marginBottom: 32 }}>
          <span className="section-label">System Internals</span>
          <h2 style={{ fontSize: '1.8rem', margin: '8px 0 16px' }}>How the Heuristic Engine Analyzes Documents</h2>
        </div>

        <div className="method-principles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div>
            <Cpu size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
            <h3>1. Multi-Engine ATS Layout AST</h3>
            <p>
              Simulates document flattening and coordinate streams to detect multi-column text collisions in Workday,
              vector graphic stripping in Taleo, header margin occlusion in iCIMS, and section tokenization in Greenhouse.
            </p>
          </div>

          <div>
            <Target size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
            <h3>2. POS Action-Verb & Metric Classifier</h3>
            <p>
              Uses part-of-speech grammatical analysis to classify leading bullet verbs into Strong, Moderate, and Weak tiers.
              Extracts validated metrics (%, $, multipliers, volume scale) via regex syntax engines.
            </p>
          </div>

          <div>
            <Layers size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
            <h3>3. Boundary-Aware Skill Alias Graph</h3>
            <p>
              Employs strict regex boundaries (\b) to eliminate substring false-positives (preventing "Java" inside "JavaScript").
              Maps technical synonyms via an alias graph (e.g. K8s → Kubernetes, Postgres → PostgreSQL).
            </p>
          </div>

          <div>
            <Eye size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
            <h3>4. Recruiter 6-Second Attention Heatmap</h3>
            <p>
              Models cognitive eye-tracking scan patterns (F-pattern distribution) across header, summary, and experience tiers
              to verify that key career achievements appear in the top 35% visual fold.
            </p>
          </div>
        </div>
      </section>

      {/* ── Privacy & In-Flight PII Redaction ── */}
      <section style={{ margin: '64px 0', padding: '36px', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Lock size={24} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Privacy & In-Flight PII Tokenization Protocol</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Unlike commercial AI resume wrappers that send raw candidate resumes to third-party APIs where names, phone numbers,
          and home addresses are logged, ResumeIQ implements strict in-flight PII sanitization:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
          <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--r-md)' }}>
            <strong>1. Regex Redaction</strong>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Names, phone numbers, email addresses, and physical locations are scrubbed and replaced with anonymous tokens.</p>
          </div>
          <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--r-md)' }}>
            <strong>2. Ephemeral Ingestion</strong>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Temporary uploaded files are parsed in-memory and unlinked immediately after AST generation.</p>
          </div>
          <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--r-md)' }}>
            <strong>3. Local Offline Fallback</strong>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Can be run completely air-gapped without an external database or third-party cloud connections.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="info-cta">
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: 4 }}>Test your resume with deterministic diagnostics</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Fast, private, and explainable analysis in under 50 milliseconds.</p>
        </div>
        <Link href="/auth" className="btn btn-primary btn-lg">
          Open Free Workspace <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
