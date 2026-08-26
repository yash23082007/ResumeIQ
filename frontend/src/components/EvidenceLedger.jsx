'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, CircleAlert, Filter, Minus, Sparkles } from 'lucide-react';

function classify(line) {
  const hasMetric = /\d+[%+x]?|\$\s?\d|\b(?:daily|monthly|users|team|years|times)\b/i.test(line);
  const hasWeakVerb = /^(helped|assisted|responsible for|worked on|participated in)\b/i.test(line.trim().replace(/^[•●▪*-]\s*/, ''));
  if (hasMetric && !hasWeakVerb) return { label: 'Strong proof', tone: 'supported', action: 'Keep this result visible and specific.' };
  if (hasWeakVerb || !hasMetric) return { label: hasWeakVerb ? 'Weak ownership' : 'Missing proof', tone: 'partial', action: hasWeakVerb ? 'Name the action you personally owned.' : 'Add a truthful outcome, scope, or timeframe if you have one.' };
  return { label: 'Needs review', tone: 'partial', action: 'Check that the result is easy to verify.' };
}

export default function EvidenceLedger({ rawText = '', onOpenLine }) {
  const [filter, setFilter] = useState('all');
  const rows = useMemo(() => rawText.split('\n').map((line, index) => ({ line: line.trim(), lineNumber: index + 1 })).filter((item) => /^[•●▪*-]\s+/.test(item.line)).map((item) => ({ ...item, ...classify(item.line) })), [rawText]);
  const filtered = rows.filter((row) => filter === 'all' || (filter === 'proof' ? row.tone === 'partial' : row.tone === 'supported'));

  return <section className="ledger-shell" aria-label="Evidence ledger"><div className="ledger-heading"><div><span className="builder-kicker">SOURCE-LED REVIEW</span><h2>Evidence Ledger</h2><p>Every recommendation starts with a line from your document.</p></div><label className="ledger-filter"><Filter size={14} /><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter evidence"><option value="all">All evidence ({rows.length})</option><option value="proof">Needs proof</option><option value="strong">Strong proof</option></select></label></div>{filtered.length === 0 ? <div className="ledger-empty"><CircleAlert size={20} /><p>No bullet evidence found yet. Add experience bullets to build the ledger.</p></div> : <div className="ledger-table"><div className="ledger-table-header"><span>Line</span><span>Resume claim</span><span>Proof</span><span>Next action</span></div>{filtered.map((row) => <article className="ledger-row" key={`${row.lineNumber}-${row.line}`}><span className="ledger-line">{String(row.lineNumber).padStart(3, '0')}</span><div className="ledger-claim"><strong>{row.line.replace(/^[•●▪*-]\s*/, '')}</strong><small>Experience evidence</small></div><span className={`ledger-status ledger-status-${row.tone}`}>{row.tone === 'supported' ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}{row.label}</span><div className="ledger-action"><span>{row.action}</span><button className="text-action" onClick={() => onOpenLine?.(row.lineNumber)}>Inspect <ArrowRight size={13} /></button></div></article>)}</div>}<div className="ledger-footnote"><Sparkles size={14} /> AI drafts, when enabled, must use this source evidence and remain editable.</div></section>;
}
