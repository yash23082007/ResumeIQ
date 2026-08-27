'use client';

import { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState('ats');

  const sampleResume = [
    { num: 1, text: "ALEX CHEN — SENIOR FULL-STACK ENGINEER", type: "header" },
    { num: 2, text: "San Francisco, CA • alex.chen@example.com • github.com/alexchen", type: "meta" },
    { num: 3, text: "EXPERIENCE", type: "section" },
    { num: 4, text: "CloudScale Systems — Senior Software Engineer (2022 – Present)", type: "job" },
    { num: 5, text: "• Built microservice APIs using Node.js and PostgreSQL for customer portal.", type: "bullet-weak", id: "b1" },
    { num: 6, text: "• Improved database queries to make dashboard load faster.", type: "bullet-weak", id: "b2" },
    { num: 7, text: "• Led migration of 14 core legacy services to Kubernetes, achieving 99.99% uptime.", type: "bullet-strong", id: "b3" },
    { num: 8, text: "TECHNICAL SKILLS", type: "section" },
    { num: 9, text: "JavaScript, TypeScript, React, Next.js, Node.js, PostgreSQL, Docker, AWS", type: "skills" }
  ];

  return (
    <div className="demo-container perspective-container">
      {/* Left Document Canvas */}
      <div className="document-paper-canvas">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Live Candidate Document Canvas</span>
          </div>
          <span className="badge badge-primary">Sample Mode</span>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
          {sampleResume.map((line) => {
            let lineClass = "paper-line";
            if (activeTab === 'ats' && line.id === 'b1') lineClass += " highlight-weak";
            if (activeTab === 'ats' && line.id === 'b3') lineClass += " highlight-strong";
            if (activeTab === 'star' && (line.id === 'b1' || line.id === 'b2')) lineClass += " highlight-weak";
            if (activeTab === 'heatmap' && line.type === 'job') lineClass += " highlight-strong";

            return (
              <div key={line.num} className={lineClass}>
                <span className="paper-line-num">{line.num}</span>
                <span style={{
                  fontWeight: line.type === 'header' || line.type === 'section' ? 750 : 400,
                  color: line.type === 'header' ? 'var(--text-display)' : line.type === 'section' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                }}>
                  {line.text}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Parser Engine: Compromise NLP v14.14</span>
          <span>ATS Compliance: 91%</span>
        </div>
      </div>

      {/* Right Interactive Intelligence Drawer */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', border: '1px solid var(--border)' }}>
        {/* Navigation Tabs */}
        <div className="segmented-nav" style={{ marginBottom: 16 }}>
          <button 
            className={`segmented-item ${activeTab === 'ats' ? 'active' : ''}`}
            onClick={() => setActiveTab('ats')}
          >
            <Cpu size={14} />
            ATS Diagnostics
          </button>
          <button 
            className={`segmented-item ${activeTab === 'star' ? 'active' : ''}`}
            onClick={() => setActiveTab('star')}
          >
            <Sparkles size={14} />
            STAR Rewriter
          </button>
          <button 
            className={`segmented-item ${activeTab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            <Eye size={14} />
            Recruiter Gaze
          </button>
        </div>

        {/* Tab 1: ATS Diagnostics */}
        {activeTab === 'ats' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Simulated Engine</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Workday & Greenhouse Parser</div>
              </div>
              <div className="badge badge-success">Passed 9/10 Checks</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', color: 'var(--success-text)' }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Standard Section Headers Detected:</strong> Experience and Skills are parsed into correct machine tables.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-sm)', color: 'var(--warning-text)' }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Unquantified Bullet Point:</strong> Line 5 lacks measurable metrics (e.g., latency, throughput, scale).
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
                <Cpu size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent-primary)' }} />
                <div>
                  <strong>Table & Font Validation:</strong> Single-column UTF-8 structure verified ATS-safe across all 4 benchmark engines.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: STAR Rewriter */}
        {activeTab === 'star' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 2 }}>
              <strong>AI STAR Optimization:</strong> Transforming passive statements into quantified impact statements.
            </div>

            <div className="rewrite-card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--danger)', marginBottom: 4 }}>
                Original Weak Statement (Line 5)
              </div>
              <div className="rewrite-original">
                &quot;Built microservice APIs using Node.js and PostgreSQL for customer portal.&quot;
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--success)', marginBottom: 4 }}>
                Quantified STAR Rewrite (Suggested)
              </div>
              <div className="rewrite-suggested">
                &quot;Architected and deployed 6 Node.js/PostgreSQL microservices, slashing p99 API response latency by 38% for 450K+ daily active users.&quot;
              </div>
              <div className="rewrite-explanation">
                <TrendingUp size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span>Added specific scale (6 services, 450K+ DAU) and quantified performance result (-38% latency).</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Recruiter Gaze */}
        {activeTab === 'heatmap' && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>6-Second Recruiter Attention Model:</strong> Heatmap visualizes the classic F-pattern scan of hiring managers.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>1.8s</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top Title & Header Anchor</div>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>3.2s</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recent Experience & Scope</div>
              </div>
            </div>

            <div style={{ padding: 10, background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--info-text)' }}>
              💡 <strong>Actionable Insight:</strong> Front-load action verbs and metrics in the first 4 words of each bullet point to capture maximum dwell time during rapid screening.
            </div>
          </div>
        )}

        {/* Bottom Action */}
        <div style={{ marginTop: 'auto', paddingTop: 14 }}>
          <Link href="/auth" className="btn btn-primary" style={{ width: '100%' }}>
            Scan Your Own Resume with AI <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
