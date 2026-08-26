'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const pathname = usePathname();

  // Don't show footer on app pages
  const isAppPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/resume') || pathname?.startsWith('/builder');
  if (isAppPage) return null;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <BrandLogo size="md" showBadge={false} />
            <p>
              A practical workspace for turning a resume into clearer evidence of your work.
            </p>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#a1a1aa' }}>
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              <span>Your document stays yours</span>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <div className="footer-heading">Resume Tools</div>
            <ul className="footer-links">
              <li><Link href="/features">All Capabilities</Link></li>
              <li><Link href="/ats-lab">ATS Lab</Link></li>
              <li><Link href="/auth">Get Started</Link></li>
              <li><Link href="/dashboard">Workspace Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <div className="footer-heading">Platform</div>
            <ul className="footer-links">
              <li><Link href="/about">About ResumeIQ</Link></li>
              <li><Link href="/features">Engineering Specs</Link></li>
              <li><Link href="/method">Methodology</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/contact">Support & Help Desk</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <div className="footer-heading">Direct Contact</div>
            <ul className="footer-links">
              <li><Link href="/about">Our Mission</Link></li>
              <li><Link href="/contact">Send Inquiry</Link></li>
            </ul>

            <div className="footer-newsletter" style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d4d4d8', marginBottom: 8 }}>
                Candidate workspace
              </div>
              <Link
                href="/auth"
                className="btn btn-sm"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fafafa',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '0.8rem',
                  width: '100%',
                  textDecoration: 'none',
                }}
              >
                <Mail size={14} />
                Create Free Account
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ResumeIQ. Resume review for real applications.</p>
          <div className="footer-bottom-links">
            <Link href="/contact">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
