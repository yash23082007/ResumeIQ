import Link from 'next/link';
import { ArrowRight, FileText, LockKeyhole, Trash2 } from 'lucide-react';

const rules = [
  ['Uploads are private', 'Documents are used to create your review and are not published or shared with other candidates.'],
  ['AI is optional', 'When AI features are enabled, only the smallest useful context should be sent to the configured provider.'],
  ['You control deletion', 'Delete a resume, its analysis, or your workspace when you are done. Derived results should not outlive the source without a clear reason.'],
];

export default function PrivacyPage() {
  return <main className="info-page"><div className="info-hero"><span className="section-label">Privacy</span><h1>Your career history is not product decoration.</h1><p>ResumeIQ treats resumes, job searches, and contact details as sensitive working documents. The interface should make data handling understandable before you upload anything.</p></div><section className="privacy-list">{rules.map(([title, text], index) => <article key={title}><span className="privacy-number">0{index + 1}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</section><section className="privacy-boundary"><LockKeyhole size={20} /><div><h2>What we do not promise</h2><p>ResumeIQ cannot guarantee hiring outcomes, official ATS behavior, or that an external AI provider retains nothing. Provider, model, and retention settings belong in your deployment configuration and should be disclosed at the point of use.</p></div></section><div className="privacy-links"><Link href="/contact" className="text-action"><FileText size={15} /> Ask a privacy question <ArrowRight size={14} /></Link><Link href="/auth" className="btn btn-primary">Open workspace <ArrowRight size={15} /></Link></div><div className="privacy-delete"><Trash2 size={15} /><span>Account deletion and data export belong in workspace settings.</span></div></main>;
}
