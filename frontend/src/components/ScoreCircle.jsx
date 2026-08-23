/**
 * ScoreCircle — Animated circular score display
 */

export default function ScoreCircle({ score, size = 120, label = 'Overall' }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score != null ? (score / 100) * circumference : 0;
  const offset = circumference - progress;

  const getColor = (s) => {
    if (s >= 80) return 'var(--score-excellent)';
    if (s >= 60) return 'var(--score-good)';
    if (s >= 40) return 'var(--score-fair)';
    return 'var(--score-poor)';
  };

  const color = score != null ? getColor(score) : 'var(--text-muted)';

  return (
    <div className="score-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="5"
        />
        {/* Progress arc */}
        {score != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease',
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        )}
      </svg>
      <div style={{ textAlign: 'center', position: 'absolute' }}>
        <div className="score-circle-value" style={{
          color,
          fontSize: size > 80 ? '1.8rem' : '1.2rem',
        }}>
          {score != null ? Math.round(score) : '—'}
        </div>
        {size > 80 && (
          <div className="score-circle-label">{label}</div>
        )}
      </div>
    </div>
  );
}
