'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Eye, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const templates = [
  { id: 'classic', name: 'Classic', detail: 'Traditional and readable', accent: '#1f2933' },
  { id: 'modern', name: 'Modern', detail: 'Clean with a clear hierarchy', accent: '#275d52' },
  { id: 'compact', name: 'Compact', detail: 'Dense, useful, one-page friendly', accent: '#8a4b2a' },
];

const initialResume = {
  name: 'Alex Morgan',
  role: 'Senior Software Engineer',
  contact: 'alex.morgan@email.com  |  San Francisco, CA  |  linkedin.com/in/alexmorgan',
  summary: 'Software engineer with 6+ years of experience building reliable products, improving platform performance, and helping teams ship with confidence.',
  experience: [
    { role: 'Senior Software Engineer', company: 'CloudScale Technologies', dates: '2022 - Present', bullets: ['Reduced API latency by 42% by migrating a monolith to Node.js services for 1.5M monthly users.', 'Built deployment workflows that increased release cadence from twice monthly to five releases per day.'] },
    { role: 'Software Engineer', company: 'Nexa Solutions', dates: '2019 - 2022', bullets: ['Built real-time dashboards with React and TypeScript for customer operations teams.', 'Improved PostgreSQL throughput by 30% through query analysis and indexing.'] },
  ],
  skills: 'JavaScript, TypeScript, React, Node.js, PostgreSQL, Redis, Docker, AWS',
  education: 'Bachelor of Science in Computer Science - University of Washington, 2015 - 2019',
};

function Field({ label, value, onChange, multiline = false }) {
  const Element = multiline ? 'textarea' : 'input';
  return <label className="builder-field"><span>{label}</span><Element value={value} onChange={(event) => onChange(event.target.value)} rows={multiline ? 4 : undefined} /></label>;
}

export default function BuilderPage() {
  const [resume, setResume] = useState(() => {
    if (typeof window === 'undefined') return initialResume;
    try { return JSON.parse(window.localStorage.getItem('resumeiq_builder_draft')) || initialResume; } catch { return initialResume; }
  });
  const [template, setTemplate] = useState('classic');
  const [showPreview, setShowPreview] = useState(true);
  const [saveState, setSaveState] = useState('Unsaved changes');

  const update = (key, value) => setResume((current) => ({ ...current, [key]: value }));
  const updateExperience = (index, key, value) => setResume((current) => ({ ...current, experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const updateBullet = (experienceIndex, bulletIndex, value) => setResume((current) => ({ ...current, experience: current.experience.map((item, itemIndex) => itemIndex === experienceIndex ? { ...item, bullets: item.bullets.map((bullet, currentBullet) => currentBullet === bulletIndex ? value : bullet) } : item) }));
  const addBullet = (experienceIndex) => setResume((current) => ({ ...current, experience: current.experience.map((item, itemIndex) => itemIndex === experienceIndex ? { ...item, bullets: [...item.bullets, 'Describe a result you delivered.'] } : item) }));
  const removeBullet = (experienceIndex, bulletIndex) => setResume((current) => ({ ...current, experience: current.experience.map((item, itemIndex) => itemIndex === experienceIndex ? { ...item, bullets: item.bullets.filter((_, currentBullet) => currentBullet !== bulletIndex) } : item) }));
  const addExperience = () => setResume((current) => ({ ...current, experience: [...current.experience, { role: 'New role', company: 'Company name', dates: 'Dates', bullets: ['Describe a result you delivered.'] }] }));
  const removeExperience = (index) => setResume((current) => ({ ...current, experience: current.experience.filter((_, itemIndex) => itemIndex !== index) }));
  const currentTemplate = templates.find((item) => item.id === template);

  return (
    <div className="builder-page">
      <header className="builder-header">
        <Link href="/dashboard" className="builder-back"><ArrowLeft size={16} /> Workspace</Link>
        <BrandLogo size="sm" showBadge={false} />
        <div className="builder-header-actions"><button className="btn btn-ghost btn-sm" onClick={() => setShowPreview((current) => !current)}><Eye size={15} /> {showPreview ? 'Hide preview' : 'Show preview'}</button><button className="btn btn-primary btn-sm" onClick={() => window.print()}><Download size={15} /> Export PDF</button></div>
      </header>

      <main className="builder-layout">
        <section className="builder-editor">
          <div className="builder-title-row"><div><span className="section-label">Resume builder</span><h1>Build a resume that sounds like you.</h1><p>Start with a structure, then make every line earn its place.</p></div><button className="btn btn-secondary btn-sm" onClick={() => { window.localStorage.setItem('resumeiq_builder_draft', JSON.stringify(resume)); setSaveState('Saved locally'); }}><Save size={14} /> {saveState}</button></div>

          <div className="builder-panel"><div className="builder-panel-heading"><div><span className="builder-kicker">01</span><h2>Choose a template</h2></div><span className="builder-muted">ATS-friendly layouts</span></div><div className="template-grid">{templates.map((item) => <button key={item.id} className={`template-choice ${template === item.id ? 'selected' : ''}`} onClick={() => setTemplate(item.id)}><span className="template-swatch" style={{ background: item.accent }} /><strong>{item.name}</strong><small>{item.detail}</small></button>)}</div></div>

          <div className="builder-panel"><div className="builder-panel-heading"><div><span className="builder-kicker">02</span><h2>Header and summary</h2></div></div><div className="builder-form-grid"><Field label="Full name" value={resume.name} onChange={(value) => update('name', value)} /><Field label="Target role" value={resume.role} onChange={(value) => update('role', value)} /></div><Field label="Contact line" value={resume.contact} onChange={(value) => update('contact', value)} /><Field label="Professional summary" value={resume.summary} onChange={(value) => update('summary', value)} multiline /></div>

          <div className="builder-panel"><div className="builder-panel-heading"><div><span className="builder-kicker">03</span><h2>Experience</h2></div><button className="text-action" onClick={addExperience}><Plus size={14} /> Add role</button></div>{resume.experience.map((item, index) => <div className="experience-editor" key={`${item.company}-${index}`}><div className="builder-form-grid"><Field label="Role" value={item.role} onChange={(value) => updateExperience(index, 'role', value)} /><Field label="Company" value={item.company} onChange={(value) => updateExperience(index, 'company', value)} /></div><Field label="Dates" value={item.dates} onChange={(value) => updateExperience(index, 'dates', value)} />{item.bullets.map((bullet, bulletIndex) => <div className="bullet-editor" key={`${index}-${bulletIndex}`}><Field label={`Impact bullet ${bulletIndex + 1}`} value={bullet} onChange={(value) => updateBullet(index, bulletIndex, value)} multiline /><button className="icon-button" title="Remove bullet" onClick={() => removeBullet(index, bulletIndex)}><Trash2 size={15} /></button></div>)}<button className="text-action" onClick={() => addBullet(index)}><Plus size={14} /> Add bullet</button></div>)}</div>

          <div className="builder-panel"><div className="builder-panel-heading"><div><span className="builder-kicker">04</span><h2>Skills and education</h2></div></div><Field label="Skills" value={resume.skills} onChange={(value) => update('skills', value)} /><Field label="Education" value={resume.education} onChange={(value) => update('education', value)} /></div>
        </section>

        {showPreview && <aside className="builder-preview-column"><div className="preview-toolbar"><span><Sparkles size={14} /> Live preview</span><span>{currentTemplate.name} template</span></div><article className={`resume-paper resume-paper-${template}`} style={{ '--resume-accent': currentTemplate.accent }}><h2>{resume.name}</h2><div className="resume-role">{resume.role}</div><div className="resume-contact">{resume.contact}</div><div className="resume-paper-rule" /><h3>Profile</h3><p>{resume.summary}</p><h3>Experience</h3>{resume.experience.map((item, index) => <div className="resume-job" key={`${item.company}-preview-${index}`}><div className="resume-job-heading"><strong>{item.role}</strong><span>{item.dates}</span></div><div className="resume-company">{item.company}</div><ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>)}<h3>Skills</h3><p>{resume.skills}</p><h3>Education</h3><p>{resume.education}</p></article><div className="preview-tip">Keep the strongest result in the first bullet of each role.</div></aside>}
      </main>
    </div>
  );
}
