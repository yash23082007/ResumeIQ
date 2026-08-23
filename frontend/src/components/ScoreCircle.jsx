/**
 * ScoreCircle — Animated circular score display for Senior UI/UX
 */

export default function ScoreCircle({ score, size = 120, label = 'Overall Score', showLabel = true }) {
  const strokeWidth = size > 90 ? 7 : 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const validScore = score != null && !isNaN(score) ? Math.min(Math.max(score, 0), 100) : null;
  const progress = validScore != null ? (validScore / 100) * circumference : 0;
  const offset = circumference - progress;

  const getColor = (s) => {
    if (s >= 80) return 'var(--score-excellent)';
    if (s >= 60) return 'var(--score-good)';
    if (s >= 40) return 'var(--score-fair)';
    return 'var(--score-poor)';
  };

  const color = validScore != null ? getColor(validScore) : 'var(--text-muted)';

  return (
    <div className="score-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        {validScore != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        )}
      </svg>
      <div style={{ textAlign: 'center', position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          className="score-circle-value"
          style={{
            color,
            fontSize: size > 90 ? '2.1rem' : size > 60 ? '1.25rem' : '0.95rem',
            fontWeight: 800,
          }}
        >
          {validScore != null ? Math.round(validScore) : '—'}
        </div>
        {showLabel && size > 90 && (
          <div className="score-circle-label">{label}</div>
        )}
      </div>
    </div>
  );
}
