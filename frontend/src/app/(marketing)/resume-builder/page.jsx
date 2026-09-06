import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';

const templates = ['Classic', 'Relay', 'Ledger', 'Arc', 'Signal'];
export default function ResumeBuilderPage() {
  return <div className="product-page"><section className="product-hero"><div><p className="landing-kicker">Resume builder / Structured editing</p><h1>Build a resume you can measure.</h1><p>Start with a clean template, edit sections as structured content, and keep the document ready for ATS checks as it changes.</p><Link href="/builder" className="btn btn-primary">Open the builder <ArrowRight size={15} /></Link></div><div className="builder-preview"><div className="preview-heading">Senior backend engineer</div><div className="preview-rule" /><div className="preview-lines" /> <div className="preview-lines short" /><div className="preview-section">Experience</div><div className="preview-lines" /><div className="preview-lines" /></div></section><section className="product-section"><p className="landing-kicker">Templates</p><h2>Choose a structure, then make it yours.</h2><div className="template-strip">{templates.map((name, index) => <Link href="/builder" className={`template-swatch template-${index}`} key={name}><span><FileText size={22} /></span><b>{name}</b><small>ATS-friendly layout</small></Link>)}</div></section></div>;
}
