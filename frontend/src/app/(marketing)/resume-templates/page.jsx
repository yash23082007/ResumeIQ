'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, FileText } from 'lucide-react';

const groups = ['All', 'One page', 'Two page', 'Student', 'Entry level', 'Senior level'];
const templates = [
	{ name: 'Classic', group: 'One page' },
	{ name: 'Relay', group: 'Senior level' },
	{ name: 'Ledger', group: 'Two page' },
	{ name: 'Arc', group: 'Student' },
	{ name: 'Signal', group: 'Entry level' },
	{ name: 'Plain text', group: 'One page' },
];

export default function ResumeTemplatesPage() {
	const [activeGroup, setActiveGroup] = useState('All');
	const visibleTemplates = templates.filter(template => activeGroup === 'All' || template.group === activeGroup);

	return <div className="product-page"><section className="product-hero compact"><div><p className="landing-kicker">Resume templates</p><h1>A clear starting point for every draft.</h1><p>Use an ATS-friendly structure, then edit it in the builder. The layout is a starting point, not a substitute for evidence.</p><Link href="/builder" className="btn btn-primary">Build a resume <ArrowRight size={15} /></Link></div></section><section className="product-section"><div className="filter-line" role="group" aria-label="Filter resume templates">{groups.map(group => <button type="button" className={activeGroup === group ? 'active' : ''} onClick={() => setActiveGroup(group)} key={group}>{group}</button>)}</div><div className="template-gallery">{visibleTemplates.map(({ name, group }, index) => <Link href="/builder" className="gallery-item" key={name}><div className={`gallery-paper template-${index}`}><FileText size={34} /><span /><span /><span /><span /></div><h3>{name}</h3><p>ATS-friendly structure · {group}</p></Link>)}</div></section></div>;
}
