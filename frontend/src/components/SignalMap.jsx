'use client';

import { useState } from 'react';
import { ArrowRight, CircleAlert, List, Map, Minus, Target } from 'lucide-react';

function buildRelationships(rawText = '', skills = []) {
  const lines = rawText.split('\n');
  const bullets = lines.map((line, index) => ({ line: line.trim(), lineNumber: index + 1 })).filter((item) => /^[•●▪*-]\s+/.test(item.line));
  const skillNames = skills.map((skill) => typeof skill === 'string' ? skill : skill.name).filter(Boolean).slice(0, 4);
  return [...bullets.slice(0, 3).map((item, index) => ({ id: `bullet-${item.lineNumber}`, evidence: item.line.replace(/^[•●▪*-]\s*/, '').slice(0, 32), source: `Resume · line ${item.lineNumber}`, signal: skillNames[index] || 'Impact evidence', status: /\d+[%+x]?|\$\s?\d/i.test(item.line) ? 'supported' : 'partial', detail: /\d+[%+x]?|\$\s?\d/i.test(item.line) ? 'This line contains an action and measurable evidence.' : 'This line shows the work, but its outcome is not yet easy to verify.' })), ...(skillNames.length ? [{ id: 'skill-gap', evidence: 'Skills section', source: 'Resume · skills', signal: skillNames[skillNames.length - 1], status: 'partial', detail: 'The skill is listed. Add an experience example if it is central to this role.' }] : [])];
}

export default function SignalMap({ rawText = '', skills = [], jobTitle = 'your target role', onOpenLedger }) {
  const relationships = buildRelationships(rawText, skills);
  const [selectedId, setSelectedId] = useState('kubernetes');
  const [listView, setListView] = useState(false);
  const selected = relationships.find((item) => item.id === selectedId) || relationships[0] || { signal: 'No evidence yet', status: 'missing', source: 'Resume', detail: 'Add a resume with experience bullets to create evidence relationships.' };

  return <section className="signal-map-shell" aria-label="Resume evidence signal map">
    <div className="signal-map-heading"><div><span className="builder-kicker">EVIDENCE RELATIONSHIPS</span><h2>Signal Map</h2><p>Resume evidence connected to requirements for <strong>{jobTitle}</strong>.</p></div><div className="signal-map-actions"><button className={`btn btn-sm ${listView ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setListView(!listView)} aria-pressed={listView}>{listView ? <Map size={14} /> : <List size={14} />} {listView ? 'Open map' : 'Accessible list'}</button></div></div>
    {listView ? <div className="signal-list-view">{relationships.map((item) => <button className={`signal-list-row ${selectedId === item.id ? 'selected' : ''}`} key={item.id} onClick={() => setSelectedId(item.id)}><span className={`signal-status signal-status-${item.status}`} /> <span><strong>{item.signal}</strong><small>{item.source} · {item.status === 'partial' ? 'Needs evidence' : item.status}</small></span><ArrowRight size={14} /></button>)}</div> : <div className="signal-map-canvas"><div className="signal-column signal-column-evidence"><span className="signal-column-label">RESUME EVIDENCE</span>{relationships.map((item) => <button key={item.id} className={`signal-node ${selectedId === item.id ? 'selected' : ''}`} onClick={() => setSelectedId(item.id)}><span className={`signal-status signal-status-${item.status}`} /><span>{item.evidence}</span><small>{item.source}</small></button>)}</div><div className="signal-threads" aria-hidden="true">{relationships.map((item, index) => <div className={`signal-thread signal-thread-${item.status} ${selectedId === item.id ? 'selected' : ''}`} key={item.id}><span /></div>)}</div><div className="signal-column signal-column-targets"><span className="signal-column-label">ROLE SIGNALS</span>{relationships.map((item) => <button key={item.id} className={`signal-node signal-target ${selectedId === item.id ? 'selected' : ''}`} onClick={() => setSelectedId(item.id)}><span>{item.signal}</span><small>{item.status === 'missing' ? 'Target not found' : item.status === 'partial' ? 'Present but weak' : 'Supported'}</small><span className="target-mark"><Target size={13} /></span></button>)}</div></div>}
    <aside className="signal-inspector"><div className="signal-inspector-header"><span><span className={`signal-status signal-status-${selected.status}`} /> {selected.status}</span><span className="signal-source">{selected.source}</span></div><h3>{selected.signal}</h3><p>{selected.detail}</p><div className="signal-inspector-action"><span><CircleAlert size={15} /> Next action</span><strong>{selected.status === 'missing' ? 'Add truthful evidence if this is part of your work.' : 'Open the source line and strengthen the proof.'}</strong></div><button className="text-action" onClick={() => onOpenLedger?.(selected)}><Minus size={14} /> Open in Evidence Ledger <ArrowRight size={13} /></button></aside>
  </section>;
}
