import Link from 'next/link';
import { ArrowRight, CheckCircle2, Info, ShieldCheck } from 'lucide-react';

const dimensions = [
  ['Content impact', '30%', 'Action verbs, measurable evidence, and ownership across experience bullets.'],
  ['ATS compatibility', '25%', 'Reading order, section headings, contact discoverability, and format risks.'],
  ['Role relevance', '20%', 'Skills and requirements supported by real experience, not only a keyword list.'],
  ['Formatting quality', '15%', 'Length, consistency, spacing, dates, and document structure.'],
  ['Readability', '10%', 'Clarity and sentence density, treated as a directional signal for resume text.'],
];

export default function MethodPage() {
  return <main className="info-page"><div className="info-hero"><span className="section-label">Methodology</span><h1>Understand the signal before you change the resume.</h1><p>ResumeIQ is a diagnostic system. It shows how the document is being read, which claims are supported, and where a hiring signal becomes unclear.</p></div><section className="method-grid"><div className="method-copy"><h2>What the review measures</h2><p>Each dimension is calculated from the extracted document and, when provided, a target role. A score is never a hiring prediction or an official ATS result.</p><div className="method-note"><Info size={16} /><span>Confidence depends on extraction quality, document format, evidence coverage, and whether a target role is available.</span></div></div><div className="dimension-list">{dimensions.map(([name, weight, description]) => <div className="dimension-row" key={name}><div><strong>{name}</strong><p>{description}</p></div><span>{weight}</span></div>)}</div></section><section className="method-principles"><div><ShieldCheck size={18} /><h2>Candidate-controlled by design</h2><p>Suggestions are explanations and drafts. Nothing changes your resume without your approval, and missing metrics remain visible placeholders rather than invented facts.</p></div><div><CheckCircle2 size={18} /><h2>Deterministic first</h2><p>Parsing, scoring, and core findings work without an AI provider. Optional reasoning is labelled with its source, model, and evidence references.</p></div></section><div className="info-cta"><span>Ready to see your evidence?</span><Link href="/auth" className="btn btn-primary">Open workspace <ArrowRight size={15} /></Link></div></main>;
}
