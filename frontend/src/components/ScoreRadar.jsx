/**
 * ScoreRadar — Recharts Radar Chart for 5 sub-scores
 */

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const LABELS = {
  content_impact: 'Impact',
  ats_compatibility: 'ATS',
  keyword_relevance: 'Relevance',
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
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#a0a0b8', fontSize: 12, fontFamily: 'Inter' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#6b6b80', fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#6366f1"
          fill="rgba(99, 102, 241, 0.2)"
          strokeWidth={2}
          dot={{ fill: '#6366f1', r: 4 }}
          animationDuration={1200}
        />
        <Tooltip
          contentStyle={{
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'Inter',
          }}
          formatter={(value) => [`${Math.round(value)}/100`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
