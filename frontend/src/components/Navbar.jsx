'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AuthContext } from '@/context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isMounted } = useContext(AuthContext);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Don't show navbar on app pages (dashboard, resume detail)
  const isAppPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/resume');
  if (isAppPage) return null;

  const links = [
    { href: '/features', label: 'Product' },
    { href: '/ats-simulator', label: 'ATS check' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <BrandLogo size="md" badgeText="Free" />
          </Link>

          <ul className="navbar-links">
            {links.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            {isMounted && user ? (
              <>
              <Link href="/dashboard" className="btn btn-secondary btn-sm" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button type="button" className="btn btn-ghost-nav btn-sm" onClick={logout}>Sign out</button>
              </>
            ) : (
              <>
              <Link href="/auth" className="btn btn-ghost-nav btn-sm">
                Sign In
              </Link>
              <Link href="/auth" className="btn btn-primary btn-sm">
                Get Started Free <ArrowRight size={13} />
              </Link>
              </>
            )}

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`mobile-drawer-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <BrandLogo size="sm" showBadge={false} />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="mobile-drawer-link"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isMounted && user ? (
            <Link href="/dashboard" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
              Workspace Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
            <Link href="/auth" className="btn btn-secondary" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link href="/auth" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
              Get Started Free <ArrowRight size={14} />
            </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
