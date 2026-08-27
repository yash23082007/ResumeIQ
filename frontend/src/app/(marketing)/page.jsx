'use client';

import Link from 'next/link';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Target, 
  FileText,
  Search
} from 'lucide-react';
import InteractiveDemo from '@/components/InteractiveDemo';

const checks = [
  { icon: FileText, title: 'Readable structure', text: 'Find layout and section choices that make a resume harder for hiring systems to parse.' },
  { icon: Target, title: 'Evidence of impact', text: 'Spot vague bullets and turn responsibilities into specific proof of what changed.' },
  { icon: Search, title: 'Role alignment', text: 'Compare your experience with a real job description and see what is still missing.' },
];

export default function LandingPage() {
  return (
    <div className="site-home">
      <section className="home-intro">
        <div className="home-intro-copy">
          <div className="eyebrow"><span className="eyebrow-mark" /> A clearer second pair of eyes</div>
          <h1>Make your resume easier to shortlist.</h1>
          <p>ResumeIQ reviews the document you actually send: how it reads, what it proves, and how closely it fits the role.</p>
          <div className="home-actions">
            <Link href="/builder" className="btn btn-primary btn-lg">Build a resume <ArrowRight size={16} /></Link>
            <Link href="/ats-simulator" className="text-action">Try the ATS check <ArrowRight size={14} /></Link>
          </div>
          <div className="home-note"><ShieldCheck size={15} /> Your document stays private while you work</div>
        </div>
        <div className="home-index" aria-label="Resume review overview">
          <div className="index-heading"><span>Resume review</span><span className="index-time">2 min read</span></div>
          <div className="index-row index-row-active"><span>01</span><strong>Structure</strong><em>Clear</em></div>
          <div className="index-row"><span>02</span><strong>Evidence</strong><em className="index-warning">Needs work</em></div>
          <div className="index-row"><span>03</span><strong>Role fit</strong><em>Ready</em></div>
          <div className="index-footer"><span>Sample data preview</span><Link href="/auth">Open workspace <ArrowRight size={13} /></Link></div>
        </div>
      </section>

      <section className="home-demo-section">
        <div className="home-section-heading"><div><span className="section-label">A useful preview</span><h2>See the review before you sign in.</h2></div><p>The feedback is built around decisions you can make, not a mysterious score.</p></div>
        <InteractiveDemo />
      </section>

      <section className="home-checks">
        <div className="home-section-heading compact-heading"><div><span className="section-label">What gets checked</span><h2>Good resumes make the important parts obvious.</h2></div></div>
        <div className="check-grid">
          {checks.map(({ icon: Icon, title, text }) => (
            <article className="check-item" key={title}><Icon size={20} strokeWidth={1.8} /><h3>{title}</h3><p>{text}</p><CheckCircle2 size={15} className="check-item-status" /></article>
          ))}
        </div>
      </section>

      <section className="home-close"><div><span className="section-label">Start with the document</span><h2>Bring the next application into focus.</h2></div><Link href="/auth" className="btn btn-primary">Open your workspace <ArrowRight size={15} /></Link></section>
    </div>
  );
}
