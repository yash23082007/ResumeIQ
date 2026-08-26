'use client';

import Link from 'next/link';
import { 
  Cpu, 
  Database, 
  Layers, 
  ShieldCheck, 
  Code2, 
  Zap, 
  FileText, 
  GitBranch, 
  ArrowRight,
  Server,
  Terminal,
  Sparkles
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function AboutPage() {
  const techStack = [
    { name: 'Next.js 15', desc: 'App Router & React 19 SSR', category: 'Frontend' },
    { name: 'Vanilla CSS', desc: 'Custom Design System & 3D Tokens', category: 'Styling' },
    { name: 'Node.js & Express', desc: 'High-Throughput API Gateway', category: 'Backend' },
    { name: 'Groq & LLaMA 3.3', desc: '70B Parameter Ultra-Fast Inference', category: 'AI/LLM' },
    { name: 'Compromise NLP', desc: 'Fast Rule-Based Syntax Extractor', category: 'NLP' },
    { name: 'Prisma ORM', desc: 'Type-Safe DB Modeling & Migrations', category: 'Database' },
    { name: 'PostgreSQL', desc: 'Relational Store with JSON Fallback', category: 'Database' },
    { name: 'Mammoth & PDF-Parse', desc: 'DOCX & PDF Document Ingestion', category: 'Parsing' }
  ];

  return (
    <div style={{ paddingTop: 100, paddingBottom: 80 }}>
      {/* ─── Hero Section ─── */}
      <section className="section" style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 40 }}>
        <ScrollReveal>
          <span className="section-label">About The Project</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: 16 }}>
            Demystifying the <span className="gradient-text">Hiring Black Box</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 32px', fontSize: '1.1rem' }}>
            ResumeIQ is built to replace opaque, expensive keyword tools with an open, engineer-grade career intelligence platform.
          </p>
        </ScrollReveal>
      </section>

      {/* ─── Mission & Narrative ─── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <ScrollReveal>
          <div className="card" style={{ padding: '40px 36px', marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>
              The Problem We Solve
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              <p>
                Every day, thousands of qualified professionals submit resumes that are automatically rejected before a human recruiter ever sees them. This happens not because the candidates lack skills, but because corporate Applicant Tracking Systems (ATS) like Workday, Taleo, and Greenhouse fail to parse non-standard document formatting, multi-column tables, or unquantified bullet points.
              </p>
              <p>
                Commercial resume checkers have capitalized on this anxiety by charging predatory $30 to $50 monthly subscriptions just to reveal which keywords were missed.
              </p>
              <p>
                <strong>ResumeIQ was created to change this paradigm:</strong> a high-performance, 100% free platform that brings transparent NLP parsing, simulated ATS failure mode detection, and STAR rewrite intelligence directly to job seekers worldwide.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Engineering Principles ─── */}
        <ScrollReveal>
          <div className="section-header" style={{ textAlign: 'left', marginBottom: 28 }}>
            <span className="section-label">Engineering Values</span>
            <h2 className="section-title">Core Architectural Principles</h2>
          </div>

          <div className="grid-3" style={{ marginBottom: 48 }}>
            <div className="card">
              <div className="feature-icon-wrapper">
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, marginBottom: 8 }}>Ultra-Low Latency</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Combining fast client-side heuristics with high-speed LLaMA 3.3 inference via Groq to deliver full multi-tab diagnostic audits in seconds.
              </p>
            </div>

            <div className="card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, marginBottom: 8 }}>Zero Lock-in & Privacy</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Your data is never monetized or used to train closed models. You have full export and one-click deletion control over every uploaded document.
              </p>
            </div>

            <div className="card">
              <div className="feature-icon-wrapper">
                <Terminal size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, marginBottom: 8 }}>Zero-Config Fallback</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Dual-mode database design supports enterprise PostgreSQL in production while maintaining a zero-config JSON fallback for local offline testing.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Technology Stack Grid ─── */}
        <ScrollReveal>
          <div className="section-header" style={{ textAlign: 'left', marginBottom: 24 }}>
            <span className="section-label">Under The Hood</span>
            <h2 className="section-title">Production Technology Stack</h2>
            <p className="section-desc" style={{ margin: 0 }}>
              The modern full-stack technologies powering the ResumeIQ engine.
            </p>
          </div>

          <div className="tech-grid" style={{ marginBottom: 48 }}>
            {techStack.map((tech, i) => (
              <div key={i} className="tech-item">
                <Code2 size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{tech.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ─── CTA Banner ─── */}
        <ScrollReveal>
          <div className="card gradient-border" style={{ padding: '36px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Sparkles size={22} style={{ color: 'var(--accent-primary)' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Free Candidate Empowerment</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 500 }}>
                  ResumeIQ is built to ensure every candidate has access to enterprise-grade resume auditing without recurring subscription costs.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/auth" className="btn btn-primary">
                  Start Free Audit <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
