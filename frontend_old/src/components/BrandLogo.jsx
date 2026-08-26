/**
 * BrandLogo — Extraordinary Vector Logo & Branding for ResumeIQ (100% Free SaaS)
 */

export default function BrandLogo({
  size = 'md',
  showBadge = true,
  badgeText = '100% Free',
  showText = true,
  className = '',
  onClick,
}) {
  // Dimensions based on size preset
  const dimensions = {
    sm: { iconSize: 28, fontSize: '1rem', badgeSize: '0.625rem' },
    md: { iconSize: 36, fontSize: '1.2rem', badgeSize: '0.68rem' },
    lg: { iconSize: 46, fontSize: '1.5rem', badgeSize: '0.75rem' },
  }[size] || { iconSize: typeof size === 'number' ? size : 36, fontSize: '1.2rem', badgeSize: '0.68rem' };

  return (
    <div
      className={`brand-logo-wrapper ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {/* ─── Premium Geometric Neural Prism Vector Icon ─── */}
      <div
        style={{
          width: dimensions.iconSize,
          height: dimensions.iconSize,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Primary Electric Gradient */}
            <linearGradient id="iqBrandGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Inner Refraction Accent */}
            <linearGradient id="iqBrandGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            {/* Radiant Spark Core */}
            <linearGradient id="iqCoreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#c7d2fe" />
            </linearGradient>

            {/* Ambient Shadow Filter */}
            <filter id="iqBrandShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="rgba(79, 70, 229, 0.35)" />
            </filter>
          </defs>

          {/* Base Hex-Prism Outer Shell */}
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="22"
            fill="url(#iqBrandGrad1)"
            filter="url(#iqBrandShadow)"
          />

          {/* Frosted Glass Geometric Fold */}
          <path
            d="M26 28 L74 28 C76.2 28 78 29.8 78 32 L78 68 C78 70.2 76.2 72 74 72 L42 72 L22 52 L22 32 C22 29.8 23.8 28 26 28 Z"
            fill="rgba(255, 255, 255, 0.16)"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1.5"
          />

          {/* Stylized Intelligent 'I' Pillar */}
          <rect
            x="32"
            y="36"
            width="8"
            height="28"
            rx="4"
            fill="#ffffff"
          />

          {/* Stylized Modern 'Q' Loop & Dynamic Forward Spark */}
          <circle
            cx="58"
            cy="47"
            r="12"
            stroke="#ffffff"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M65 55 L74 65"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* AI Radiant Micro-Spark */}
          <circle
            cx="36"
            cy="30"
            r="3"
            fill="#38bdf8"
          />
        </svg>
      </div>

      {/* ─── Typography & Wordmark ─── */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.1 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: dimensions.fontSize,
                letterSpacing: '-0.04em',
                color: 'var(--text-primary)',
              }}
            >
              Resume<span className="gradient-text">IQ</span>
            </span>

            {/* 100% Free SaaS Pill Badge */}
            {showBadge && (
              <span
                style={{
                  fontSize: dimensions.badgeSize,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%)',
                  color: '#059669',
                  border: '1px solid rgba(5, 150, 105, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  boxShadow: '0 1px 2px rgba(5, 150, 105, 0.08)',
                }}
              >
                {badgeText}
              </span>
            )}
          </div>

          <span
            style={{
              fontSize: '0.675rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            Neural Career Engine
          </span>
        </div>
      )}
    </div>
  );
}
