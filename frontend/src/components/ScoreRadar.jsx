/**
 * ScoreRadar — Recharts Radar Chart for 5 sub-scores with adaptive Light/Dark theme
 */

import { useContext } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { ThemeContext } from '../context/ThemeContext';

const LABELS = {
  content_impact: 'Impact',
  ats_compatibility: 'ATS',
  keyword_relevance: 'Keywords',
  formatting: 'Formatting',
  readability: 'Readability',
};

export default function ScoreRadar({ subScores }) {
  const { theme } = useContext(ThemeContext);

  if (!subScores) return null;

  const isDark = theme === 'dark';

  const data = Object.entries(LABELS).map(([key, label]) => ({
    subject: label,
    score: subScores[key] ?? 0,
    fullMark: 100,
  }));

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)';
  const tickColor = isDark ? '#94a3b8' : '#475569';
  const radiusTickColor = isDark ? '#64748b' : '#94a3b8';
  const tooltipBg = isDark ? '#171926' : '#ffffff';
  const tooltipBorder = isDark ? '#232738' : '#e2e8f0';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: tickColor, fontSize: 11.5, fontFamily: 'Plus Jakarta Sans, Inter', fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: radiusTickColor, fontSize: 9 }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="var(--accent-primary)"
          fill="var(--accent-primary)"
          fillOpacity={isDark ? 0.25 : 0.18}
          strokeWidth={2.5}
          dot={{ fill: 'var(--accent-primary)', r: 3.5 }}
          animationDuration={800}
        />
        <Tooltip
          contentStyle={{
            background: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'Plus Jakarta Sans, Inter',
            color: tooltipText,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          formatter={(value) => [`${Math.round(value)} / 100`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
