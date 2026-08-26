/**
 * ScoreRadar — Recharts Radar Chart for 5 Sub-Scores (Optimized Pure Light Theme)
 */

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const LABELS = {
  content_impact: 'Impact',
  ats_compatibility: 'ATS Engine',
  keyword_relevance: 'Keywords',
  formatting: 'Formatting',
  readability: 'Readability',
};

export default function ScoreRadar({ subScores }) {
  if (!subScores) return null;

  const data = Object.entries(LABELS).map(([key, label]) => ({
    subject: label,
    score: subScores[key] ?? 0,
    fullMark: 100,
  }));

  return (
    <div style={{ width: '100%', height: 280, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(15, 23, 42, 0.07)" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: '#334155',
              fontSize: 11.5,
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 9.5, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#4f46e5"
            strokeWidth={2.5}
            fill="#6366f1"
            fillOpacity={0.16}
            dot={{
              fill: '#ffffff',
              stroke: '#4f46e5',
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              fill: '#4f46e5',
              stroke: '#ffffff',
              strokeWidth: 2,
              r: 6,
            }}
            animationDuration={900}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
              color: '#0f172a',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
              padding: '8px 12px',
            }}
            formatter={(value) => [`${Math.round(value)} / 100`, 'Dimension Score']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
