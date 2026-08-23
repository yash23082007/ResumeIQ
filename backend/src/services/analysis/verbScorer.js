/**
 * Action-Verb & Impact Scorer (Algorithm 7.3)
 *
 * Classifies leading verbs by strength tier, detects quantified metrics,
 * and suggests improvements for weak bullets.
 */

const VERB_STRENGTH = {
  strong: new Set([
    'spearheaded', 'architected', 'negotiated', 'transformed', 'pioneered',
    'orchestrated', 'revolutionized', 'championed', 'accelerated', 'eliminated',
    'maximized', 'optimized', 'streamlined', 'launched', 'established',
    'generated', 'secured', 'delivered', 'exceeded', 'drove',
    'overhauled', 'redesigned', 'engineered', 'automated', 'scaled',
    'consolidated', 'innovated', 'mentored', 'influenced',
  ]),
  moderate: new Set([
    'managed', 'developed', 'led', 'built', 'created', 'designed',
    'implemented', 'improved', 'increased', 'reduced', 'analyzed',
    'coordinated', 'collaborated', 'maintained', 'supervised',
    'organized', 'trained', 'evaluated', 'directed', 'produced',
    'resolved', 'planned', 'achieved', 'contributed', 'facilitated',
    'initiated', 'presented', 'supported', 'administered', 'conducted',
  ]),
  weak: new Set([
    'responsible for', 'worked on', 'helped with', 'assisted',
    'tasked with', 'involved in', 'participated in', 'handled',
    'dealt with', 'was responsible', 'in charge of',
  ]),
};

const QUANTIFIER_REGEX = /(\$[\d,.]+[MKB]?|\d+%|\d+x|\d{2,}(?:,\d{3})*\b|\d+\+?\s*(?:users?|clients?|customers?|teams?|members?|people|employees?|projects?|accounts?))/i;

const STRONG_VERB_SUGGESTIONS = {
  'responsible for': ['Led', 'Directed', 'Managed', 'Drove'],
  'worked on': ['Developed', 'Built', 'Delivered', 'Engineered'],
  'helped with': ['Contributed to', 'Supported', 'Facilitated', 'Enabled'],
  'assisted': ['Supported', 'Facilitated', 'Collaborated on'],
  'handled': ['Managed', 'Oversaw', 'Directed'],
  'tasked with': ['Executed', 'Delivered', 'Accomplished'],
  'dealt with': ['Resolved', 'Addressed', 'Managed'],
  'participated in': ['Contributed to', 'Collaborated on', 'Drove'],
  'involved in': ['Contributed to', 'Led', 'Supported'],
  'managed': ['Directed', 'Orchestrated', 'Spearheaded'],
};

/**
 * Extract the leading verb/phrase from a bullet point.
 */
function extractLeadingVerb(bullet) {
  const cleaned = bullet
    .replace(/^[•●■◆▪→\-*]\s*/, '')
    .trim();

  // Check multi-word weak phrases first
  for (const phrase of VERB_STRENGTH.weak) {
    if (cleaned.toLowerCase().startsWith(phrase)) {
      return phrase;
    }
  }

  // Extract first word
  const firstWord = cleaned.split(/\s+/)[0];
  return firstWord ? firstWord.toLowerCase() : '';
}

/**
 * Classify a verb into a strength tier.
 */
function classifyVerb(verb) {
  if (!verb) return 'unknown';

  const lower = verb.toLowerCase();

  // Check weak phrases first (multi-word)
  for (const phrase of VERB_STRENGTH.weak) {
    if (lower === phrase || lower.startsWith(phrase)) return 'weak';
  }

  if (VERB_STRENGTH.strong.has(lower)) return 'strong';
  if (VERB_STRENGTH.moderate.has(lower)) return 'moderate';

  return 'moderate'; // Default: benefit of the doubt
}

/**
 * Score a single bullet point for verb strength and quantification.
 * @param {string} bullet
 * @returns {{ text: string, verbTier: string, verb: string, quantified: boolean, suggestion: string|null }}
 */
export function scoreBullet(bullet) {
  const verb = extractLeadingVerb(bullet);
  const verbTier = classifyVerb(verb);
  const quantified = QUANTIFIER_REGEX.test(bullet);

  let suggestion = null;

  if (verbTier === 'weak') {
    const alternatives = STRONG_VERB_SUGGESTIONS[verb] || ['Consider a stronger action verb'];
    suggestion = `Replace "${verb}" with a stronger verb like: ${alternatives.join(', ')}.`;
  }

  if (!quantified) {
    const metricHint = 'Add a measurable impact (%, $, # of users, time saved, etc.).';
    suggestion = suggestion ? `${suggestion} ${metricHint}` : metricHint;
  }

  return {
    text: bullet,
    verb,
    verbTier,
    quantified,
    suggestion,
  };
}

/**
 * Score all bullets in a resume.
 * @param {object} parsedJson - Parsed resume JSON with sections
 * @returns {{ score: number, bullets: Array, summary: object }}
 */
export function scoreAllBullets(parsedJson) {
  const sections = parsedJson?.sections || {};
  const allBullets = [];

  // Collect bullets from experience and projects sections
  for (const [name, section] of Object.entries(sections)) {
    if (['experience', 'projects'].includes(name) && section.bullets) {
      allBullets.push(...section.bullets);
    }
  }

  // Also check lines that look like bullets in the content
  if (allBullets.length === 0 && sections.experience?.content) {
    const lines = sections.experience.content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 20 && /^[A-Z]/.test(trimmed)) {
        allBullets.push(trimmed);
      }
    }
  }

  if (allBullets.length === 0) {
    return {
      score: 50,
      bullets: [],
      summary: { total: 0, strong: 0, moderate: 0, weak: 0, quantified: 0 },
    };
  }

  const scored = allBullets.map(scoreBullet);

  const summary = {
    total: scored.length,
    strong: scored.filter(b => b.verbTier === 'strong').length,
    moderate: scored.filter(b => b.verbTier === 'moderate').length,
    weak: scored.filter(b => b.verbTier === 'weak').length,
    quantified: scored.filter(b => b.quantified).length,
  };

  // Score: weighted by verb strength and quantification
  const verbScore = (
    (summary.strong * 100 + summary.moderate * 70 + summary.weak * 20) /
    Math.max(summary.total, 1)
  );
  const quantScore = (summary.quantified / Math.max(summary.total, 1)) * 100;

  const score = Math.round(verbScore * 0.6 + quantScore * 0.4);

  return { score, bullets: scored, summary };
}
