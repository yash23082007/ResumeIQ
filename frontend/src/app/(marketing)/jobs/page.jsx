'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bookmark, ExternalLink, MapPin, Search } from 'lucide-react';

const listings = [
  { id: 1, company: 'Northstar Systems', title: 'Senior Backend Engineer', location: 'Bengaluru, India', mode: 'Hybrid', category: 'Engineering', match: 92, age: '2 days ago', description: 'Build distributed payment services with PostgreSQL, Python, APIs, and observability tooling.', url: 'https://www.linkedin.com/jobs/' },
  { id: 2, company: 'Fieldline', title: 'Full Stack Engineer', location: 'Remote, India', mode: 'Remote', category: 'Engineering', match: 86, age: '4 days ago', description: 'Own product features across React, TypeScript, Node.js, and cloud infrastructure.', url: 'https://www.linkedin.com/jobs/' },
  { id: 3, company: 'Cedar Health', title: 'Platform Engineer', location: 'Pune, India', mode: 'On-site', category: 'Engineering', match: 74, age: '6 days ago', description: 'Improve deployment systems, Kubernetes workloads, service reliability, and developer tooling.', url: 'https://www.linkedin.com/jobs/' },
  { id: 4, company: 'Morrow Labs', title: 'Data Analyst', location: 'Remote, India', mode: 'Remote', category: 'Data', match: 68, age: '8 days ago', description: 'Turn product and customer data into reports using SQL, Python, and clear visual explanations.', url: 'https://www.linkedin.com/jobs/' },
  { id: 5, company: 'Aster Commerce', title: 'Engineering Manager', location: 'Mumbai, India', mode: 'Hybrid', category: 'Leadership', match: 61, age: '10 days ago', description: 'Lead a team delivering reliable commerce systems and mentor engineers through delivery.', url: 'https://www.linkedin.com/jobs/' },
];

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('All');
  const [saved, setSaved] = useState([]);
  const [status, setStatus] = useState({});
  const filtered = useMemo(() => listings.filter(job => {
    const haystack = `${job.title} ${job.company} ${job.location} ${job.category} ${job.description}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (mode === 'All' || job.mode === mode);
  }), [query, mode]);
  const toggleSaved = (id) => setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);

  return <div className="jobs-page"><section className="jobs-header"><div><p className="landing-kicker">Jobs / Resume match</p><h1>Find roles worth applying to.</h1><p>Search the listings, compare each role with your resume, and move a promising job into tailoring when you are ready.</p></div><Link href="/auth" className="btn btn-primary">Analyze a resume <ArrowRight size={15} /></Link></section><section className="jobs-workspace"><div className="jobs-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, company, skill, or location" aria-label="Search jobs" /></div><div className="jobs-filters" role="group" aria-label="Filter jobs by work mode">{['All', 'Remote', 'Hybrid', 'On-site'].map(item => <button type="button" className={mode === item ? 'active' : ''} key={item} onClick={() => setMode(item)}>{item}</button>)}</div><div className="jobs-count"><span>{filtered.length} roles</span><span>Sorted by resume match</span></div><div className="jobs-list">{filtered.map(job => <article className="job-row" key={job.id}><div className="job-main"><div className="job-company">{job.company}</div><h2>{job.title}</h2><p className="job-meta"><MapPin size={14} /> {job.location} · {job.mode} · {job.age}</p><p>{job.description}</p><div className="job-actions"><a href={job.url} target="_blank" rel="noreferrer" className="text-link">View listing <ExternalLink size={14} /></a><Link href="/tailor" className="text-link">Tailor resume <ArrowRight size={14} /></Link></div></div><div className="job-score"><span>Resume match</span><strong className="numeral">{job.match}%</strong><button type="button" className={saved.includes(job.id) ? 'save-button saved' : 'save-button'} onClick={() => toggleSaved(job.id)} aria-label={`${saved.includes(job.id) ? 'Remove' : 'Save'} ${job.title}`}><Bookmark size={18} fill={saved.includes(job.id) ? 'currentColor' : 'none'} /></button><select aria-label={`Application status for ${job.title}`} value={status[job.id] || 'Not started'} onChange={(event) => setStatus(current => ({ ...current, [job.id]: event.target.value }))}><option>Not started</option><option>Applied</option><option>Interviewing</option><option>Closed</option></select></div></article>)}</div>{filtered.length === 0 && <div className="jobs-empty"><h2>No matching roles</h2><p>Try a broader title, skill, or location.</p></div>}</section></div>;
}
