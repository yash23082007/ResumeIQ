'use client';

import Link from 'next/link';
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';

const sections = [
  { label: 'Summary', lines: 'L05-L09', height: '14%' },
  { label: 'Experience', lines: 'L11-L34', height: '34%' },
  { label: 'Education', lines: 'L36-L42', height: '12%' },
  { label: 'Skills', lines: 'L44-L51', height: '13%' },
];

const resumeLines = [
  ['01', 'SENIOR BACKEND ENGINEER', 'heading'],
  ['02', 's.bhatnagar@email.com  |  +91 98765 43210', 'meta'],
  ['03', 'Bengaluru, India  |  linkedin.com/in/sbhatnagar', 'meta'],
  ['04', '', 'blank'],
  ['05', 'SUMMARY', 'section'],
  ['06', 'Backend engineer with 7+ years building reliable', 'body'],
  ['07', 'distributed systems and payment infrastructure.', 'body'],
  ['08', '', 'blank'],
  ['09', 'EXPERIENCE', 'section'],
  ['10', 'Acme Payments  /  Senior Engineer', 'job'],
  ['11', 'Led migration of 14 services to event-driven', 'body'],
  ['12', 'architecture, reducing settlement latency by 38%.', 'body'],
  ['13', 'Worked on the payments team and helped migrate', 'warn'],
  ['14', 'services across three regions.', 'body'],
  ['15', 'Designed observability standards for 6 squads.', 'body'],
  ['16', '', 'blank'],
  ['17', 'EDUCATION', 'section'],
  ['18', 'B.Tech Computer Science  /  PES University', 'body'],
];

function Specimen() {
  return (
    <div className="landing-specimen" aria-label="Annotated sample resume showing measured sections and findings" role="img">
      <div className="specimen-topline"><span>Annotated specimen</span><span>Resume_v3.pdf</span></div>
      <div className="specimen-stage">
        <div className="specimen-dimensions" aria-hidden="true">
          {sections.map((section, index) => (
            <div className={`specimen-dimension ${index === 1 ? 'is-active' : ''}`} key={section.label} style={{ height: section.height }}>
              <span>{section.label}</span><small>{section.lines}</small>
            </div>
          ))}
        </div>
        <div className="specimen-paper">
          <div className="specimen-paper-inner">
            {resumeLines.map(([number, text, type]) => (
              <div className={`specimen-line specimen-line-${type}`} key={number}>
                <span>{number}</span><b>{text}</b>
                {number === '13' && <i className="specimen-callout">04</i>}
              </div>
            ))}
          </div>
          <div className="specimen-title-block">
            <span>Composite score</span><strong>73.4<small>/100</small></strong>
            <em>Method 2026.08.1  /  Conf 0.91  /  2 pp</em>
          </div>
        </div>
        <div className="specimen-attention" aria-label="Attention density by document section">
          <div className="attention-fold">6 sec</div>
          {[0.92, 0.78, 0.66, 0.42, 0.25, 0.18, 0.12].map((opacity, index) => (
            <div key={index} style={{ '--attention': opacity }}><span>{opacity.toFixed(2)}</span></div>
          ))}
        </div>
      </div>
      <div className="specimen-footer"><span><i className="legend-dot legend-blue" /> selected dimension</span><span><i className="legend-dot legend-orange" /> finding 04</span><span>line references are parser output</span></div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-kicker">ResumeIQ / Resume measurement</p>
          <h1>Make every application easier to shortlist.</h1>
          <p className="landing-lead">See your resume the way an applicant tracking system sees it. Fix the structure, evidence, and job-specific gaps before you apply.</p>
          <div className="landing-actions">
            <Link href="/auth?next=/app" className="btn btn-primary btn-xl">Analyze a resume <ArrowRight size={16} /></Link>
            <Link href="/ats-simulator" className="btn btn-ghost btn-xl">Check ATS without an account</Link>
          </div>
          <p className="landing-trust"><ShieldCheck size={15} /> No third-party service ever sees your file. Same input, same score, every time.</p>
        </div>
        <Specimen />
      </section>

      <section className="landing-proof-strip" aria-label="ResumeIQ product facts">
        <div><strong className="numeral">5</strong><span>measured axes</span></div>
        <div><strong className="numeral">4</strong><span>parser simulations</span></div>
        <div><strong className="numeral">&lt;45ms</strong><span>local score calculation</span></div>
        <div><strong className="numeral">1</strong><span>published method</span></div>
      </section>

      <section className="landing-toolkit">
        <div className="section-heading"><p className="landing-kicker">The toolkit</p><h2>One workspace for the work between drafts.</h2><p>Start with the document you have. Measure it, revise the weak lines, then compare the version you are ready to send.</p></div>
        <div className="landing-toolkit-grid">
          <article><span className="tool-number">01</span><h3>Measure the document</h3><p>Composite score, five weighted axes, parser failure checks, and a line-by-line evidence trail.</p><Link href="/ats-simulator" className="text-link">Run an ATS check <ArrowRight size={14} /></Link></article>
          <article><span className="tool-number">02</span><h3>Improve the evidence</h3><p>Find weak verbs, unquantified claims, dense sentences, and sections that need clearer proof.</p><Link href="/features" className="text-link">See what is measured <ArrowRight size={14} /></Link></article>
          <article><span className="tool-number">03</span><h3>Fit a specific role</h3><p>Compare your resume with a job description and see which terms are present, missing, or not measured.</p><Link href="/auth" className="text-link">Open the workspace <ArrowRight size={14} /></Link></article>
        </div>
      </section>

      <section className="landing-spec-section">
        <div className="section-heading"><p className="landing-kicker">What the instrument reads</p><h2>Five measurements. One reproducible result.</h2></div>
        <div className="landing-table-wrap">
          <table className="landing-table">
            <thead><tr><th>Axis</th><th>Weight</th><th>What it measures</th><th>What fails it</th></tr></thead>
            <tbody>
              <tr><th scope="row">Content impact</th><td className="numeral">30%</td><td>Evidence, action verbs, and quantified outcomes</td><td>Weak or unmeasured bullets</td></tr>
              <tr><th scope="row">ATS compatibility</th><td className="numeral">25%</td><td>Parser-safe structure across four engines</td><td>Columns, images, and header contact details</td></tr>
              <tr><th scope="row">Keyword relevance</th><td className="numeral">20%</td><td>Lexical overlap with a supplied job description</td><td>Missing role-specific terms</td></tr>
              <tr><th scope="row">Formatting</th><td className="numeral">15%</td><td>Length, sections, and document conventions</td><td>Missing sections or extreme length</td></tr>
              <tr><th scope="row">Readability</th><td className="numeral">10%</td><td>Reading ease, sentence complexity, and buzzwords</td><td>Dense sentences and vague language</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="landing-method-section">
        <div><p className="landing-kicker">The score, and how it is built</p><h2>Measurement you can inspect.</h2><p>When no job description is supplied, keyword relevance is not measured and the remaining weights are re-normalised. A null stays null.</p><Link href="/method" className="text-link">Read the methodology <ArrowRight size={14} /></Link></div>
        <div className="formula-block"><code>composite = Σ (axis_score × weight) ÷ Σ (active weights)</code><div className="formula-weights"><span>30</span><span>25</span><span>20</span><span>15</span><span>10</span></div><small>content impact&nbsp;&nbsp;&nbsp; ATS compatibility&nbsp;&nbsp;&nbsp; keyword relevance&nbsp;&nbsp;&nbsp; formatting&nbsp;&nbsp;&nbsp; readability</small></div>
      </section>

      <section className="landing-workflow">
        <div className="workflow-copy"><p className="landing-kicker">From draft to decision</p><h2>Know what changed before you send it.</h2><p>Each version keeps its score, method version, confidence, and findings. Compare the numbers and the source lines instead of relying on a vague sense that the resume “looks better.”</p><Link href="/method" className="text-link">How the score works <ArrowRight size={14} /></Link></div>
        <div className="workflow-versions"><div><span>v2</span><strong>67.2</strong><small>6 open findings</small></div><div className="workflow-arrow">→</div><div className="is-current"><span>v3 / current</span><strong>73.4</strong><small>2 open findings</small></div></div>
      </section>

      <section className="landing-final-cta"><FileText size={24} /><div><h2>Run your resume through the instrument.</h2><p>Find the lines worth fixing before a recruiter does.</p></div><Link href="/auth" className="btn btn-secondary">Start an analysis <ArrowRight size={15} /></Link></section>
    </div>
  );
}
