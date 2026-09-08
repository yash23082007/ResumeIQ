import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

const features = [
  'Resume parsing and version history',
  'ATS compatibility checks',
  'Job description matching',
  'Tailoring workspace with Groq assistance',
  'DOCX, PDF, and data exports',
];

export default function PricingPage() {
  return (
    <div className="product-page">
      <section className="product-hero compact">
        <div>
          <p className="landing-kicker">Pricing</p>
          <h1>Everything you need to make one strong application.</h1>
          <p>ResumeIQ is free while the core workspace is being refined. No hidden trial, no credit card, and your data stays yours.</p>
          <Link href="/auth" className="btn btn-primary">Start for free <ArrowRight size={15} /></Link>
        </div>
      </section>
      <section className="product-section">
        <div className="card" style={{ maxWidth: 620, margin: '0 auto', padding: 32 }}>
          <p className="landing-kicker">Free workspace</p>
          <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>Build with evidence, not guesswork.</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Use every analysis and builder workflow without a paywall.</p>
          <ul style={{ display: 'grid', gap: 14, marginBottom: 28 }}>
            {features.map(feature => <li key={feature} style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Check size={17} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />{feature}</li>)}
          </ul>
          <Link href="/auth" className="btn btn-primary">Create your workspace <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  );
}
