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
  Code,
  TerminalSquare
} from 'lucide-react';
import InteractiveDemo from '@/components/InteractiveDemo';

const benchmarkData = [
  { metric: 'Core Compute Latency', legacy: '3,200ms – 5,500ms', llmWrapper: '8,400ms – 15,200ms', resumeiq: '<45ms (Heuristic Engine)' },
  { metric: 'Score Stability', legacy: 'Moderate', llmWrapper: '±16.8% Variance', resumeiq: '100% Deterministic' },
  { metric: 'PII Exposure', legacy: 'Stored in DB', llmWrapper: 'Streamed to 3rd-party', resumeiq: '100% In-Flight Redaction' },
  { metric: 'ATS Emulation', legacy: 'Generic parser', llmWrapper: 'No structural AST', resumeiq: '4-Engine Matrix' },
  { metric: 'Match Error Rate', legacy: '18.7% (False matches)', llmWrapper: 'High (Hallucinations)', resumeiq: '<1.2% (Boundary matching)' },
  { metric: 'Cost Per Scan', legacy: '$0.01 – $0.05', llmWrapper: '$0.05 – $0.20', resumeiq: '$0.00 (Offline-capable)' },
];

const pillars = [
  { icon: Cpu, title: 'Deterministic Heuristic Core', text: 'Scoring, ATS failure checks, readability analysis, and recruiter gaze models run on deterministic algorithms. Zero hallucination, zero score drift, instant execution.' },
  { icon: Layers, title: 'Multi-Engine ATS Simulation', text: 'Emulates specific failure modes across Workday, Greenhouse, Taleo, and iCIMS — including column scrambling, text box stripping, and header margin contact occlusion.' },
  { icon: Target, title: 'Action-Verb & Metric Extraction', text: 'POS syntactic tagging classifies leading verbs into strong/moderate/weak tiers and extracts verified quantitative proof (%, $, 3x multipliers, MAU scale).' },
  { icon: Lock, title: 'Privacy-First Architecture', text: 'All Personally Identifiable Information (PII) is tokenized before selective LLM calls. Runs fully offline with embedded zero-config storage.' },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      
      {/* ── Industrial Hero Section ── */}
      <header style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        minHeight: '85vh', 
        borderBottom: '2px solid var(--border-strong)',
        background: 'var(--bg-app)',
        paddingTop: 56 /* Offset for navbar */
      }}>
        {/* Left Column: Typography & CTAs */}
        <div style={{ 
          padding: '80px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          borderRight: '2px solid var(--border-strong)'
        }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.85rem', 
            textTransform: 'uppercase', 
            background: 'var(--accent)', 
            color: '#fff', 
            padding: '4px 12px', 
            alignSelf: 'flex-start',
            marginBottom: 32,
            boxShadow: 'var(--shadow-xs)',
            fontWeight: 700
          }}>
            <TerminalSquare size={14} /> SYS_ACTIVE // V1.0.0
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: 24 }}>
            DETERMINISTIC <br />
            <span style={{ color: 'var(--accent)' }}>ATS PARSING.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: 48, maxWidth: 600, color: 'var(--text-secondary)' }}>
            ResumeIQ replaces opaque keyword counters and slow AI wrappers with a deterministic heuristic engine. Test against 4 enterprise ATS architectures instantly.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/auth" className="btn btn-primary btn-xl">
              INITIALIZE WORKSPACE <ArrowRight size={16} />
            </Link>
            <Link href="/ats-simulator" className="btn btn-secondary btn-xl">
              EXPLORE ATS LAB <ArrowRight size={16} />
            </Link>
          </div>
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            <ShieldCheck size={14} /> ZERO PII RETENTION | 100% EXPLAINABLE SCORING
          </div>
        </div>

        {/* Right Column: Diagnostic HUD */}
        <div style={{ padding: '80px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 40, right: 40, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            SEQ_ID: 9X-ALPHA-772 <br/> LATENCY: &lt;45MS
          </div>
          
          <div className="card" style={{ width: '100%', maxWidth: 500, background: '#fff' }}>
            <div style={{ borderBottom: '2px solid var(--border-strong)', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>DIAGNOSTIC_TELEMETRY</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--bg-app)', background: 'var(--accent)', padding: '2px 8px', fontWeight: 700 }}>RUNNING</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'ATS COMPATIBILITY', val: '95 / 100', status: 'OK', color: 'var(--success)' },
                { label: 'QUANTIFIED IMPACT', val: '41% (WARN)', status: 'WARN', color: 'var(--warning)' },
                { label: 'JD SKILL ALIGNMENT', val: '88% MATCH', status: 'OK', color: 'var(--success)' },
                { label: 'READABILITY GRADE', val: 'GRADE 11.2', status: 'OK', color: 'var(--success)' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border-subtle)', background: 'var(--bg-page)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-subtle)' }}>0{idx + 1}</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{item.label}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: item.color, fontWeight: 700 }}>{item.val}</span>
                    <div style={{ width: 8, height: 8, background: item.color, border: '1px solid #000' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Metric Proof Statistics ── */}
      <section style={{ borderBottom: '2px solid var(--border-strong)', background: 'var(--bg-app)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { val: '<45ms', label: 'COMPUTE LATENCY', sub: 'Instant deterministic execution.' },
            { val: '0.0%', label: 'SCORE VARIANCE', sub: '100% reproducible without temperature drift.' },
            { val: '100%', label: 'PII SANITIZATION', sub: 'In-flight candidate tokenization.' },
            { val: '4 PLATFORMS', label: 'ATS EMULATION', sub: 'Workday, Greenhouse, Taleo, iCIMS.' }
          ].map((m, i) => (
            <div key={i} style={{ padding: '48px 40px', borderRight: i !== 3 ? '2px solid var(--border-strong)' : 'none' }}>
              <div style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', marginBottom: 8, lineHeight: 1 }}>{m.val}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>{m.label}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Core Engineering Pillars ── */}
      <section style={{ padding: '120px 80px', background: 'var(--bg-surface)', borderBottom: '2px solid var(--border-strong)' }}>
        <div style={{ marginBottom: 64, maxWidth: 800 }}>
          <h2 style={{ fontSize: '3rem', marginBottom: 16 }}>ENGINEERING PILLARS</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Built on robust linguistics, parsing ASTs, and cognitive science.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
          {pillars.map((p, i) => (
            <div className="card" key={i} style={{ display: 'flex', gap: 24, padding: 40, background: '#fff' }}>
              <div style={{ width: 64, height: 64, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-xs)', border: '2px solid var(--border-strong)' }}>
                <p.icon size={28} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 12 }}>{p.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benchmark Comparison ── */}
      <section style={{ padding: '120px 80px', background: 'var(--bg-app)' }}>
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: '3rem', marginBottom: 16 }}>ARCHITECTURAL BENCHMARK</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Why separating deterministic scoring from generative coaching creates a superior tool.</p>
        </div>
        
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--border-strong)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              <tr>
                <th style={{ padding: '20px 24px' }}>CAPABILITY / BENCHMARK</th>
                <th style={{ padding: '20px 24px' }}>1ST GEN: LEGACY MATCHERS</th>
                <th style={{ padding: '20px 24px' }}>2ND GEN: LLM WRAPPERS</th>
                <th style={{ padding: '20px 24px', background: 'var(--accent)' }}>3RD GEN: RESUMEIQ</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkData.map((row, i) => (
                <tr key={i} style={{ borderBottom: i !== benchmarkData.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td style={{ padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700 }}>{row.metric.toUpperCase()}</td>
                  <td style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>{row.legacy}</td>
                  <td style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>{row.llmWrapper}</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700, color: 'var(--accent)' }}>{row.resumeiq.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section style={{ padding: '120px 80px', background: 'var(--accent)', color: '#fff', borderTop: '2px solid var(--border-strong)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3.5rem', marginBottom: 24, color: '#fff' }}>INITIALIZE WORKSPACE</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: 48, opacity: 0.9 }}>
            Stop guessing what the ATS sees. Get deterministic feedback on your resume structure and evidence today.
          </p>
          <Link href="/auth" className="btn btn-secondary btn-xl" style={{ border: '2px solid var(--border-strong)', background: '#fff', color: 'var(--text-primary)' }}>
            GET STARTED FREE <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
