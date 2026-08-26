/**
 * ScoreCircle — Extraordinary Animated Circular Gauge for Modern Light Theme
 */

export default function ScoreCircle({ score, size = 130, label = 'Overall Score', showLabel = true }) {
  const strokeWidth = size > 100 ? 9 : size > 70 ? 7 : 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const validScore = score != null && !isNaN(score) ? Math.min(Math.max(score, 0), 100) : null;
  const progress = validScore != null ? (validScore / 100) * circumference : 0;
  const offset = circumference - progress;

  // Tier configuration with modern gradients & pill labels
  const getTier = (s) => {
    if (s >= 80) {
      return {
        strokeStart: '#10b981',
        strokeEnd: '#059669',
        textColor: '#059669',
        badgeBg: 'rgba(16, 185, 129, 0.1)',
        badgeText: '#047857',
        badgeLabel: 'Exceptional',
        glow: 'rgba(16, 185, 129, 0.25)',
      };
    }
    if (s >= 65) {
      return {
        strokeStart: '#6366f1',
        strokeEnd: '#4f46e5',
        textColor: '#4f46e5',
        badgeBg: 'rgba(99, 102, 241, 0.1)',
        badgeText: '#4338ca',
        badgeLabel: 'Competitive',
        glow: 'rgba(99, 102, 241, 0.25)',
      };
    }
    if (s >= 45) {
      return {
        strokeStart: '#f59e0b',
        strokeEnd: '#d97706',
        textColor: '#d97706',
        badgeBg: 'rgba(245, 158, 11, 0.1)',
        badgeText: '#b45309',
        badgeLabel: 'Needs Polish',
        glow: 'rgba(245, 158, 11, 0.25)',
      };
    }
    return {
      strokeStart: '#f43f5e',
      strokeEnd: '#e11d48',
      textColor: '#e11d48',
      badgeBg: 'rgba(244, 63, 94, 0.1)',
      badgeText: '#be123c',
      badgeLabel: 'Critical Gap',
      glow: 'rgba(244, 63, 94, 0.25)',
    };
  };

  const tier = validScore != null ? getTier(validScore) : {
    strokeStart: '#94a3b8',
    strokeEnd: '#64748b',
    textColor: '#64748b',
    badgeBg: 'rgba(148, 163, 184, 0.12)',
    badgeText: '#64748b',
    badgeLabel: 'Pending',
    glow: 'none',
  };

  const gradId = `score-grad-${Math.round(score || 0)}-${size}`;

  return (
    <div className="score-circle-container" style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tier.strokeStart} />
            <stop offset="100%" stopColor={tier.strokeEnd} />
          </linearGradient>
          <filter id={`glow-${gradId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={tier.glow} />
          </filter>
        </defs>

        {/* Soft Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(226, 232, 240, 0.7)"
          strokeWidth={strokeWidth}
        />

        {/* Outer subtle guide ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + strokeWidth / 2 + 3}
          fill="none"
          stroke="rgba(226, 232, 240, 0.35)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />

        {/* Dynamic Progress Arc */}
        {validScore != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter={`url(#glow-${gradId})`}
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        )}
      </svg>

      {/* Center Metric Display */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: size > 110 ? '2.4rem' : size > 80 ? '1.5rem' : '1.1rem',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: tier.textColor,
            marginBottom: size > 90 ? 4 : 0,
          }}
        >
          {validScore != null ? Math.round(validScore) : '—'}
          {validScore != null && (
            <span style={{ fontSize: size > 110 ? '1.1rem' : '0.75rem', fontWeight: 600, opacity: 0.85 }}>
              %
            </span>
          )}
        </div>

        {showLabel && size > 100 && (
          <div
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}
          >
            {label}
          </div>
        )}

        {showLabel && size > 120 && validScore != null && (
          <span
            style={{
              marginTop: 4,
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: tier.badgeBg,
              color: tier.badgeText,
              letterSpacing: '0.02em',
            }}
          >
            {tier.badgeLabel}
          </span>
        )}
      </div>
    </div>
  );
}
