/**
 * Bias & Inclusive Language Detector (Algorithm 7.6)
 *
 * Flags age signals, gendered terms, and other potentially biasing content.
 * Offers neutral alternatives.
 */

const CURRENT_YEAR = new Date().getFullYear();

const GENDERED_TERMS = {
  'salesman': 'salesperson',
  'salesmen': 'salespeople',
  'chairman': 'chairperson',
  'manpower': 'workforce',
  'man-hours': 'person-hours',
  'mankind': 'humanity',
  'fireman': 'firefighter',
  'policeman': 'police officer',
  'stewardess': 'flight attendant',
  'waitress': 'server',
  'foreman': 'supervisor',
  'businessman': 'business professional',
  'craftsman': 'craftsperson',
  'freshman': 'first-year student',
  'mailman': 'mail carrier',
  'cameraman': 'camera operator',
  'spokesman': 'spokesperson',
  'workman': 'worker',
};

const AGE_SIGNAL_TERMS = [
  'seasoned professional',
  'years of wisdom',
  'mature',
  'extensive tenure',
  'long-standing career',
];

/**
 * Detect potential bias flags in resume text.
 * @param {string} text
 * @returns {{ score: number, flags: Array<{ type: string, message: string, severity: string, suggestion: string }> }}
 */
export function detectBias(text) {
  if (!text) return { score: 100, flags: [] };

  const flags = [];
  const lower = text.toLowerCase();

  // 1. Old graduation years (age signal)
  const gradYearRegex = /\b(19[5-9]\d|20[0-1]\d)\b/g;
  let match;
  while ((match = gradYearRegex.exec(text)) !== null) {
    const year = parseInt(match[1], 10);
    if (year < CURRENT_YEAR - 20) {
      // Check if it's near education-related context
      const context = text.slice(Math.max(0, match.index - 100), match.index + 50).toLowerCase();
      if (context.includes('graduat') || context.includes('degree') || context.includes('university') ||
          context.includes('college') || context.includes('bachelor') || context.includes('master')) {
        flags.push({
          type: 'age',
          found: match[1],
          message: `Graduation year ${match[1]} may invite age bias during screening.`,
          severity: 'medium',
          suggestion: 'Consider removing graduation years older than 15-20 years — your degree still counts without the date.',
        });
      }
    }
  }

  // 2. Gendered language
  for (const [term, alt] of Object.entries(GENDERED_TERMS)) {
    if (lower.includes(term)) {
      flags.push({
        type: 'language',
        found: term,
        message: `"${term}" uses gendered language.`,
        severity: 'low',
        suggestion: `Consider using "${alt}" instead.`,
      });
    }
  }

  // 3. Age-signaling phrases
  for (const phrase of AGE_SIGNAL_TERMS) {
    if (lower.includes(phrase)) {
      flags.push({
        type: 'age',
        found: phrase,
        message: `"${phrase}" can signal age and invite bias.`,
        severity: 'low',
        suggestion: 'Replace with specific accomplishments and measurable impact.',
      });
    }
  }

  // 4. Personal info that's irrelevant to most roles
  const personalPatterns = [
    { regex: /\b(married|single|divorced|widowed)\b/i, type: 'personal', message: 'Marital status is unnecessary and may invite bias.' },
    { regex: /\b(age|born|date of birth|dob)\s*[:\-]?\s*\d/i, type: 'age', message: 'Including age/DOB is unnecessary in most regions and invites age bias.' },
    { regex: /\b(children|kids|dependents)\s*[:\-]?\s*\d/i, type: 'personal', message: 'Family details are unnecessary and may invite bias.' },
    { regex: /\bphoto(graph)?\b/i, type: 'personal', message: 'Including a photo is not standard in US/UK resumes and can invite bias.' },
  ];

  for (const { regex, type, message } of personalPatterns) {
    if (regex.test(text)) {
      flags.push({
        type,
        found: text.match(regex)?.[0] || '',
        message,
        severity: 'medium',
        suggestion: 'Remove this information unless specifically required by the role or region.',
      });
    }
  }

  // Score
  let score = 100;
  score -= flags.filter(f => f.severity === 'medium').length * 10;
  score -= flags.filter(f => f.severity === 'low').length * 5;

  return {
    score: Math.max(score, 0),
    flags,
    hasCritical: flags.some(f => f.severity === 'high'),
  };
}
