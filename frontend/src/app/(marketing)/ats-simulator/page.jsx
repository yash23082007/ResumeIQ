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
      name: 'Workday Heuristic Profile',
      share: 'Enterprise ATS Archetype',
      riskProfile: 'Strict Linear Flow • Multi-Column Scramble • Table Fragility',
      description: 'Simulates single-pass linear text extraction. When documents use two-column layouts, single-pass extractors read horizontally across the entire page, potentially interleaving separate columns.',
      rules: [
        { title: 'Column Traps', status: 'critical', msg: 'Two-column resume layouts risk interleaving unrelated sections.' },
        { title: 'Header / Footer Text Boxes', status: 'critical', msg: 'Text placed inside Microsoft Word or PDF floating boxes is often skipped.' },
        { title: 'Date Format Normalization', status: 'warning', msg: 'Prefers standard (MM/YYYY – MM/YYYY or YYYY – YYYY) chronological ranges.' },
        { title: 'Standard Section Titles', status: 'pass', msg: 'Recognizes: Summary, Experience, Education, Technical Skills.' }
      ]
    },
    greenhouse: {
      name: 'Greenhouse & Lever Heuristic Profile',
      share: 'Modern Tech & Scale-Up Archetype',
      riskProfile: 'Entity Extraction • Skill Tokenization • Contact Parsing',
      description: 'Simulates modern structured tokenization into candidate entities (Education history, Company timeline, Skill badges). Standard headings and clear date strings ensure clean profile extraction.',
      rules: [
        { title: 'Skill Token Extraction', status: 'pass', msg: 'Extracts categorized hard and soft skills directly into candidate tags.' },
        { title: 'Role Title Normalization', status: 'warning', msg: 'Non-standard titles (e.g., "Code Ninja") can complicate automated role matching.' },
        { title: 'Contact Extraction', status: 'pass', msg: 'Parses email, phone, LinkedIn, and portfolio links into contact cards.' },
        { title: 'Chronological Continuity', status: 'warning', msg: 'Clear date ranges help recruiters follow your career progression.' }
      ]
    },
    taleo: {
      name: 'Oracle Taleo Heuristic Profile',
      share: 'Legacy Enterprise Archetype',
      riskProfile: 'Raw Text Flattening • Symbol Sanitization • Layout Constraints',
      description: 'Simulates text flattening down to plain text streams. Custom bullet icons (diamonds, stars, custom vectors) can turn into replacement characters, breaking sentence clarity.',
      rules: [
        { title: 'Symbol Sanitization', status: 'critical', msg: 'Non-standard arrow or custom bullet symbols may turn into garbled characters.' },
        { title: 'Keyword Clarity', status: 'warning', msg: 'Direct mention of required skills and tools ensures accurate matching.' },
        { title: 'Graphic & Image Traps', status: 'critical', msg: 'Embedded logos and skill bar graphics cannot be read by text extractors.' },
        { title: 'Section Separator Recognition', status: 'pass', msg: 'Standard uppercase headings make boundaries unambiguous.' }
      ]
    },
    icims: {
      name: 'iCIMS Heuristic Profile',
      share: 'Enterprise Talent Cloud Archetype',
      riskProfile: 'Multi-Column Alignment • Tabular Extraction • Header Contact Bounds',
      description: 'Simulates enterprise ATS parsing with strict section segmentation. Complex tabular formatting or contact info outside main body boundaries can cause missing contact fields.',
      rules: [
        { title: 'Header Contact Placement', status: 'warning', msg: 'Contact info placed inside PDF header margins may be skipped.' },
        { title: 'Table Alignment', status: 'critical', msg: 'Bordered tables can disrupt the sequential reading stream.' },
        { title: 'Technical Skill Extraction', status: 'pass', msg: 'Extracts programming languages, frameworks, and cloud tools.' },
        { title: 'Standard Education Structure', status: 'pass', msg: 'Maps degree, institution, and graduation timeline.' }
      ]
    }
  };

  const activeEngine = engineSpecs[selectedEngine];

  return (
    <div style={{ paddingTop: 100, paddingBottom: 80 }}>
      {/* ─── Hero Section ─── */}
      <section className="section" style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 36 }}>
        <ScrollReveal>
          <span className="section-label">ATS Heuristic Simulation Lab</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: 16 }}>
            Understand the <span className="gradient-text">Parser Rules</span> Before You Apply
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 32px', fontSize: '1.1rem' }}>
            Heuristic simulations of common document parsing failure modes across 4 enterprise ATS archetypes. Diagnostic insights, not vendor certifications.
          </p>

          {/* Engine Selector Pills */}
          <div className="segmented-nav" style={{ maxWidth: 640, margin: '0 auto' }}>
            <button
              className={`segmented-item ${selectedEngine === 'workday' ? 'active' : ''}`}
              onClick={() => setSelectedEngine('workday')}
            >
              Workday
            </button>
            <button
              className={`segmented-item ${selectedEngine === 'greenhouse' ? 'active' : ''}`}
              onClick={() => setSelectedEngine('greenhouse')}
            >
              Greenhouse
            </button>
            <button
              className={`segmented-item ${selectedEngine === 'taleo' ? 'active' : ''}`}
              onClick={() => setSelectedEngine('taleo')}
            >
              Taleo
            </button>
            <button
              className={`segmented-item ${selectedEngine === 'icims' ? 'active' : ''}`}
              onClick={() => setSelectedEngine('icims')}
            >
              iCIMS
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
              Documented Failure Modes & Diagnostic Checks:
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
            <h2 className="section-title">The 4 Major ATS Failure Modes ResumeIQ Audits</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, marginBottom: 8 }}>1. Column Collision Trap</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Multi-column designs look visually balanced, but simple text extractors read horizontally across columns, interleaving text across separate columns into disordered sentences.
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
                Recruiters look for verifiable evidence. Bullets lacking numbers, percentages, or concrete business outcomes are harder to evaluate for impact.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ background: 'var(--accent-primary-bg)', color: 'var(--accent-primary)' }}>
                <FileText size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, marginBottom: 8 }}>4. Table & Header Margin Collisions</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Placing contact information or dates inside complex table grids or header/footer boxes often leads to dropped or unindexed contact fields.
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
