'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Lock, 
  Target, 
  BarChart3,
  Layers,
  Code
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function AboutPage() {
  return (
    <div className="info-page">
      <div className="info-hero">
        <span className="section-label">Engineering Manifesto</span>
        <h1>Why we built ResumeIQ</h1>
        <p>
          Career technology has stagnated between two broken paradigms: predatory keyword checkers that gate basic advice behind $50/month subscriptions, and noisy AI wrappers that invent non-reproducible scores.
        </p>
      </div>

      {/* The Two Failures of Existing Tools */}
      <ScrollReveal>
        <div className="method-grid" style={{ gridTemplateColumns: '1fr 1.3fr', marginTop: 32 }}>
          <div className="method-copy">
            <span className="section-label">The Problem</span>
            <h2>Two generations of broken resume technology</h2>
            <p>
              Candidates deserve tools that provide transparent diagnostics rather than arbitrary numbers designed to induce anxiety and subscription conversions.
            </p>
            <div className="method-note">
              <AlertTriangle size={16} />
              <span>
                A score without an explainable mathematical formula is not feedback — it is a marketing funnel.
              </span>
            </div>
          </div>

          <div>
            <div className="dimension-row" style={{ alignItems: 'flex-start' }}>
              <div>
                <strong>1. The 1st-Gen Flaw: Naive Keyword Stuffing</strong>
                <p>Legacy tools use basic string substring searches (`indexOf`) that reward unnatural keyword spamming, ruining resume readability for human hiring managers.</p>
              </div>
              <span className="badge badge-red">Broken</span>
            </div>

            <div className="dimension-row" style={{ alignItems: 'flex-start' }}>
              <div>
                <strong>2. The 2nd-Gen Flaw: LLM Prompt Drift & PII Leaks</strong>
                <p>Generic ChatGPT wrappers send raw resumes with names and phone numbers to 3rd-party APIs, generating wildly fluctuating scores (±16% drift) across consecutive scans.</p>
              </div>
              <span className="badge badge-red">Broken</span>
            </div>

            <div className="dimension-row" style={{ alignItems: 'flex-start' }}>
              <div>
                <strong>3. Opaque Black-Box Numbers</strong>
                <p>Showing a candidate "68/100" without the exact mathematical weights or direct links to specific bullet lines provides zero actionable engineering direction.</p>
              </div>
              <span className="badge badge-red">Broken</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* The ResumeIQ Solution */}
      <ScrollReveal>
        <div style={{ paddingTop: 64, paddingBottom: 48 }}>
          <div style={{ maxWidth: 680, marginBottom: 36 }}>
            <span className="section-label">The Architecture</span>
            <h2 style={{ margin: '12px 0', fontSize: '1.8rem' }}>Deterministic Heuristics + Grounded Coaching</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              ResumeIQ was engineered with a strict separation of concerns: deterministic algorithms for mathematical scoring, and selective, PII-sanitized LLM agents for generative writing assistance.
            </p>
          </div>

          <div className="method-principles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <div>
              <Cpu size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
              <h3>100% Reproducible Scoring</h3>
              <p>Scores are calculated using a published 5-axis formula. Scan the same resume 100 times and the score will never drift.</p>
            </div>

            <div>
              <Layers size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
              <h3>Real ATS AST Emulation</h3>
              <p>Simulates document coordinate streams to test against known layout traps in Workday, Greenhouse, Taleo, and iCIMS.</p>
            </div>

            <div>
              <Lock size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
              <h3>In-Flight PII Redaction</h3>
              <p>Candidate names, phone numbers, and addresses are scrubbed and tokenized in-memory before any generative coaching prompt.</p>
            </div>

            <div>
              <Target size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
              <h3>Evidence-Linked Diagnostics</h3>
              <p>Every finding points to an exact line in your document, a specific unquantified bullet, or a verified job requirement.</p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Bottom CTA */}
      <div className="info-cta">
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: 4 }}>Experience transparent resume intelligence</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Open the free workspace and run your diagnostic in under 50ms.</p>
        </div>
        <Link href="/auth" className="btn btn-primary btn-lg">
          Get Started <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
