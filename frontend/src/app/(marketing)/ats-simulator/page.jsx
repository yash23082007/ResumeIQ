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
  X,
  Code
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function ATSSimulatorPage() {
  const [selectedEngine, setSelectedEngine] = useState('workday');

  const engineSpecs = {
    workday: {
      name: 'Workday Heuristic Profile',
      category: 'Enterprise Linear Stream Archetype',
      marketContext: 'Used by >50% of Fortune 500 companies (Amazon, Salesforce, Walmart).',
      description: 'Workday’s document ingestion engine reads PDF coordinate streams linearly from top-to-bottom across the entire horizontal page width. When a resume uses a two-column layout, the parser reads across both columns simultaneously, interleaving unrelated sentences.',
      failureExample: {
        rawInput: 'Column 1 (Experience): "Senior Engineer at CloudScale"\nColumn 2 (Skills): "Proficient in React, Node.js, AWS"',
        parsedOutput: '"Senior Proficient Engineer in at React, CloudScale Node.js, AWS"',
        risk: 'High: Sentences become completely garbled and unsearchable.'
      },
      rules: [
        { title: 'Multi-Column Traps', status: 'critical', msg: 'Two-column layouts risk horizontal sentence interleaving during linear PDF extraction.' },
        { title: 'Header / Footer Margins', status: 'critical', msg: 'Contact info placed inside Microsoft Word or PDF header/footer margin zones is frequently discarded.' },
        { title: 'Date Format Normalization', status: 'warning', msg: 'Prefers standard (MM/YYYY – MM/YYYY or YYYY – Present) chronological ranges.' },
        { title: 'Standard Section Titles', status: 'pass', msg: 'Recognizes: Summary, Experience, Education, Technical Skills.' }
      ]
    },
    greenhouse: {
      name: 'Greenhouse & Lever Heuristic Profile',
      category: 'Modern Entity Tokenization Archetype',
      marketContext: 'Standard ATS for fast-growing technology companies, scale-ups, and startups.',
      description: 'Greenhouse and Lever tokenize resume text into discrete structured candidate entities (Education records, Company timeline items, Categorized skill badges). Canonical headings and standard date strings ensure accurate candidate card generation.',
      failureExample: {
        rawInput: 'Section Header: "Where I have been working & making things"',
        parsedOutput: 'Unrecognized Section -> Merged into general notes text blob',
        risk: 'Medium: Experience history fails to map into recruiter timeline fields.'
      },
      rules: [
        { title: 'Canonical Headings', status: 'critical', msg: 'Non-standard headings ("My Journey", "Things I Built") fail automated section mapping.' },
        { title: 'Skill Token Extraction', status: 'pass', msg: 'Extracts categorized hard and soft skills directly into candidate tags.' },
        { title: 'Contact Card Parsing', status: 'pass', msg: 'Parses email, phone, and LinkedIn links into clickable recruiter contact cards.' },
        { title: 'Role Title Normalization', status: 'warning', msg: 'Creative job titles (e.g., "Software Wizard") hinder automated seniority matching.' }
      ]
    },
    taleo: {
      name: 'Oracle Taleo Heuristic Profile',
      category: 'Legacy Enterprise Plain-Text Archetype',
      marketContext: 'Prevalent in government agencies, defense contractors, healthcare, and traditional banking.',
      description: 'Taleo strips complex document formatting down to a single raw ASCII/Unicode text stream. Custom bullet icons (diamonds, stars, arrows) are stripped or replaced with replacement glyphs (e.g. ), breaking sentence structure.',
      failureExample: {
        rawInput: 'Bullet: "✦ Spearheaded cloud migration resulting in 35% latency drop"',
        parsedOutput: '" Spearheaded cloud migration resulting in 35% latency drop"',
        risk: 'High: Glyph decoding errors disrupt search indexing and parsing.'
      },
      rules: [
        { title: 'Custom Bullet Glyph Stripping', status: 'critical', msg: 'Non-standard vector bullet symbols can turn into garbled replacement characters.' },
        { title: 'Floating Text Boxes', status: 'critical', msg: 'Text inside floating shape containers is completely omitted from the plain-text stream.' },
        { title: 'Plain-Text Contact Availability', status: 'pass', msg: 'Requires standard plain text email and phone strings in main body.' },
        { title: 'Section Separator Recognition', status: 'pass', msg: 'Standard uppercase headings make boundaries unambiguous.' }
      ]
    },
    icims: {
      name: 'iCIMS Heuristic Profile',
      category: 'Enterprise Talent Cloud Archetype',
      marketContext: 'Widely used across retail, logistics, manufacturing, and healthcare enterprises.',
      description: 'iCIMS utilizes strict boundary delimitation for parsing candidate metadata. Complex table borders or non-standard delimiters in contact sections can cause missing contact records.',
      failureExample: {
        rawInput: 'Header: "Alex Morgan ~ (555) 019-2834 ~ San Francisco, CA"',
        parsedOutput: 'Candidate Name: "Alex Morgan ~ (555) 019-2834 ~ San Francisco, CA"',
        risk: 'Medium: Non-standard delimiter causes name and phone to merge.'
      },
      rules: [
        { title: 'Delimiter Splitting', status: 'warning', msg: 'Non-standard delimiters (|, ~, •) in headers can cause metadata field merging.' },
        { title: 'Tabular Extraction Boundaries', status: 'critical', msg: 'Bordered tables can disrupt the sequential reading stream.' },
        { title: 'Technical Skill Extraction', status: 'pass', msg: 'Extracts programming languages, frameworks, and cloud tools cleanly.' },
        { title: 'Standard Education Structure', status: 'pass', msg: 'Maps degree, institution, and graduation timeline.' }
      ]
    }
  };

  const activeEngine = engineSpecs[selectedEngine];

  return (
    <div style={{ paddingTop: 100, paddingBottom: 80, maxWidth: 1140, margin: '0 auto', paddingLeft: 20, paddingRight: 20 }}>
      {/* ─── Hero Section ─── */}
      <section style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 36 }}>
        <ScrollReveal>
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>
            <Cpu size={13} /> ATS Parsing Heuristics
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: 16 }}>
            Enterprise ATS Parser Simulation Lab
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto 32px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Understand the exact document parsing failure modes across the 4 major enterprise ATS archetypes before submitting your application.
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
      <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 36, marginTop: 24, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <div className="badge badge-blue" style={{ marginBottom: 8 }}>{activeEngine.category}</div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>{activeEngine.name}</h2>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{activeEngine.marketContext}</span>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 28 }}>
          {activeEngine.description}
        </p>

        {/* Failure Mode Code Box */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 20, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Code size={16} style={{ color: 'var(--accent)' }} />
            <strong style={{ fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Document Parsing Failure Mode Example:</strong>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            <div style={{ background: 'var(--bg-app)', padding: 14, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Raw Document Text:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{activeEngine.failureExample.rawInput}</pre>
            </div>
            
            <div style={{ background: 'var(--bg-app)', padding: 14, borderRadius: 'var(--r-sm)', border: '1px solid var(--danger-border)' }}>
              <div style={{ color: 'var(--danger)', marginBottom: 4, fontWeight: 600 }}>ATS Extracted Output:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--danger-text)' }}>{activeEngine.failureExample.parsedOutput}</pre>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong>Impact:</strong> {activeEngine.failureExample.risk}
          </div>
        </div>

        {/* Heuristic Rules List */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Evaluated Parser Rules & Compatibility Checks:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {activeEngine.rules.map((rule, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: 16, 
                  background: 'var(--bg-surface)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--r-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong style={{ fontSize: '0.88rem' }}>{rule.title}</strong>
                    {rule.status === 'critical' && <span className="badge badge-red">Critical Trap</span>}
                    {rule.status === 'warning' && <span className="badge badge-yellow">Watch Out</span>}
                    {rule.status === 'pass' && <span className="badge badge-green">Standard Rule</span>}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {rule.msg}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom CTA ─── */}
      <section style={{ marginTop: 48, padding: '36px', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Test your resume against all 4 ATS profiles in seconds</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 560, margin: '0 auto 24px' }}>
          Upload your resume in PDF, DOCX, or TXT format and receive an immediate diagnostic breakdown.
        </p>
        <Link href="/auth" className="btn btn-primary btn-lg">
          Run Free ATS Diagnostic <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
