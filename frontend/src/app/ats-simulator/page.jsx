'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  FileText, 
  AlertCircle,
  FileCode,
  Check,
  X
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function ATSSimulatorPage() {
  const [selectedEngine, setSelectedEngine] = useState('workday');

  const engineSpecs = {
    workday: {
      name: 'Workday ATS Parser',
      share: 'Used by 48% of Fortune 500 enterprises',
      riskProfile: 'Strict Linear Flow • Multi-Column Failure • Table Fragility',
      description: 'Workday utilizes a single-pass linear text extractor. When candidates use two-column layouts, Workday reads horizontally across the entire page, merging disparate columns into gibberish sentences that fail automated scoring.',
      rules: [
        { title: 'Column Traps', status: 'critical', msg: 'Two-column resume layouts corrupt section reading order.' },
        { title: 'Header / Footer Text Boxes', status: 'critical', msg: 'Text placed inside Microsoft Word or PDF text boxes is completely ignored.' },
        { title: 'Date Format Normalization', status: 'warning', msg: 'Prefers standard (MM/YYYY – MM/YYYY) chronological ranges.' },
        { title: 'Standard Section Titles', status: 'pass', msg: 'Recognizes: Summary, Experience, Education, Technical Skills.' }
      ]
    },
    greenhouse: {
      name: 'Greenhouse & Lever Ingestion',
      share: 'Standard in High-Growth Tech & Scale-ups',
      riskProfile: 'Entity Extraction • Skill Tokenization • Contact Parsing',
      description: 'Greenhouse and Lever tokenize resumes into structured candidate entities (Education history, Company timeline, Skill badges). Missing standard headers or irregular date strings prevent automatic profile creation.',
      rules: [
        { title: 'Skill Token Extraction', status: 'pass', msg: 'Extracts categorized hard and soft skills directly into candidate tags.' },
        { title: 'Role Title Normalization', status: 'warning', msg: 'Non-standard titles (e.g., "Code Ninja") fail auto-matching filters.' },
        { title: 'Contact Extraction', status: 'pass', msg: 'Parses email, phone, LinkedIn, and GitHub links into candidate entities.' },
        { title: 'Chronological Continuity', status: 'warning', msg: 'Flags unexplained employment gaps exceeding 12 months.' }
      ]
    },
    taleo: {
      name: 'Oracle Taleo Enterprise',
      share: 'Common in Defense, Government & Legacy Enterprise',
      riskProfile: 'Legacy Binary Stripping • Symbol Sanitization • Keyword Thresholds',
      description: 'Oracle Taleo strips formatting down to raw ASCII text. Fancy bullet icons (diamonds, stars, custom vectors) often turn into garbled unicode characters like  or ???, breaking sentence semantics.',
      rules: [
        { title: 'Unicode Symbol Sanitization', status: 'critical', msg: 'Custom arrow or star bullet symbols turn into corrupt characters.' },
        { title: 'Exact Keyword Density Threshold', status: 'warning', msg: 'Requires exact grammatical matches for essential job requirements.' },
        { title: 'Graphic & Image Disqualification', status: 'critical', msg: 'Embedded logos and skill bar graphs are completely unreadable.' },
        { title: 'Section Separator Recognition', status: 'pass', msg: 'Requires distinct horizontal line breaks or bold uppercase titles.' }
      ]
    }
  };

  const activeEngine = engineSpecs[selectedEngine];

  return (
    <div style={{ paddingTop: 100, paddingBottom: 80 }}>
      {/* ─── Hero Section ─── */}
      <section className="section" style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 36 }}>
        <ScrollReveal>
          <span className="section-label">Enterprise Parser Simulator</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: 16 }}>
            Understand the <span className="gradient-text">ATS Filter</span> Before You Apply
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 32px', fontSize: '1.1rem' }}>
            Over 75% of resume rejections happen at the automated parser level before reaching a human recruiter. Learn how corporate ATS engines deconstruct documents.
          </p>

          {/* Engine Selector Pills */}
          <div className="segmented-nav" style={{ maxWidth: 540, margin: '0 auto' }}>
            <button
              className={`segmented-item ${selectedEngine === 'workday' ? 'active' : ''}`}
              onClick={() => setSelectedEngine('workday')}
            >
              Workday Parser
            </button>
            <button
              className={`segmented-item ${selectedEngine === 'greenhouse' ? 'active' : ''}`}
              onClick={() => setSelectedEngine('greenhouse')}
            >
              Greenhouse & Lever
            </button>
            <button
              className={`segmented-item ${selectedEngine === 'taleo' ? 'active' : ''}`}
              onClick={() => setSelectedEngine('taleo')}
            >
              Oracle Taleo
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Active Engine Deep Dive Card ─── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <ScrollReveal>
          <div className="card tilt-card" style={{ padding: '36px 32px', marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Cpu size={24} style={{ color: 'var(--accent-primary)' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeEngine.name}</h2>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activeEngine.share} • <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{activeEngine.riskProfile}</span>
                </div>
              </div>

              <Link href="/auth" className="btn btn-primary btn-sm">
                Test Resume Against {activeEngine.name} <ArrowRight size={14} />
              </Link>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
              {activeEngine.description}
            </p>

            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14 }}>
              Parser Vulnerability Matrix & Automated Checks:
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {activeEngine.rules.map((rule, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: rule.status === 'critical' ? 'var(--danger-bg)' : rule.status === 'warning' ? 'var(--warning-bg)' : 'var(--success-bg)',
                    border: `1px solid ${rule.status === 'critical' ? 'var(--danger-border)' : rule.status === 'warning' ? 'var(--warning-border)' : 'var(--success-border)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {rule.status === 'critical' ? (
                      <AlertCircle size={16} style={{ color: 'var(--danger-text)' }} />
                    ) : rule.status === 'warning' ? (
                      <AlertTriangle size={16} style={{ color: 'var(--warning-text)' }} />
                    ) : (
                      <CheckCircle2 size={16} style={{ color: 'var(--success-text)' }} />
                    )}
                    <span style={{ fontWeight: 750, fontSize: '0.85rem', color: rule.status === 'critical' ? 'var(--danger-text)' : rule.status === 'warning' ? 'var(--warning-text)' : 'var(--success-text)' }}>
                      {rule.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {rule.msg}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ─── 4 Common ATS Failure Modes ─── */}
        <ScrollReveal>
          <div className="section-header" style={{ textAlign: 'left', marginBottom: 24 }}>
            <span className="section-label">Diagnostic Intelligence</span>
            <h2 className="section-title">The 4 Major ATS Failure Modes ResumeIQ Fixes</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, marginBottom: 8 }}>1. Column Collision Trap</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Multi-column designs look nice to human eyes, but ATS text extractors read horizontally across columns, merging your job title with your contact info into unusable gibberish.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <FileCode size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, marginBottom: 8 }}>2. Non-Standard Headers</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Using headings like &quot;Where I&apos;ve Been&quot; instead of &quot;Experience&quot; causes parsers to classify your entire career history as unparsed miscellaneous text.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, marginBottom: 8 }}>3. Unquantified Passive Bullets</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Modern semantic ATS engines rank candidates by quantified impact metrics. Bullets lacking numbers, throughput, or business results receive bottom-quartile ranking scores.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="cta-section" style={{ paddingTop: 20 }}>
        <ScrollReveal>
          <div className="cta-card">
            <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Check Your Resume Against All 4 ATS Engines</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Upload your document for a free instant compliance audit, formatting risk report, and STAR metric rewrite recommendations.
            </p>
            <Link href="/auth" className="btn btn-primary btn-lg">
              Run Free ATS Audit <ArrowRight size={15} />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
