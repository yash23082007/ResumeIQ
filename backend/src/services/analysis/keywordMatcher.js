/**
 * Keyword Matcher — Lexical & Technical Skill Matching against Job Descriptions
 *
 * Implements strict boundary checking (prevents "java" matching "javascript")
 * and canonical skill alias expansion (e.g. "K8s" matches "Kubernetes").
 */

// Skill aliases map: alias / abbreviation -> canonical keyword
const SKILL_ALIASES = {
  'js': 'javascript',
  'ts': 'typescript',
  'k8s': 'kubernetes',
  'kube': 'kubernetes',
  'reactjs': 'react',
  'react.js': 'react',
  'nodejs': 'node.js',
  'node': 'node.js',
  'vuejs': 'vue',
  'angularjs': 'angular',
  'postgres': 'postgresql',
  'psql': 'postgresql',
  'mongo': 'mongodb',
  'es6': 'javascript',
  'aws': 'amazon web services',
  'gcp': 'google cloud platform',
  'ci/cd': 'cicd',
  'ci-cd': 'cicd',
  'ml': 'machine learning',
  'ai': 'artificial intelligence',
  'nlp': 'natural language processing',
  'rest': 'rest api',
  'restful': 'rest api',
};

// Common general words to filter out from technical matching
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'this', 'that', 'these', 'those', 'it', 'its', 'we', 'you', 'they', 'them',
  'our', 'your', 'their', 'my', 'his', 'her', 'who', 'which', 'what', 'where',
  'when', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very',
  'just', 'also', 'about', 'up', 'out', 'if', 'then', 'else', 'while',
  'including', 'must', 'able', 'etc', 'well', 'using', 'work', 'working',
  'experience', 'required', 'preferred', 'strong', 'excellent', 'good',
  'responsibilities', 'requirements', 'qualifications', 'job', 'role', 'position',
  'looking', 'candidate', 'team', 'company', 'opportunity', 'years', 'plus',
  'skills', 'ability', 'degree', 'computer', 'science', 'engineering',
]);

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a specific keyword or any of its aliases exists in text using word boundaries.
 */
function textContainsKeyword(text, keyword) {
  const normalizedText = ` ${text.toLowerCase()} `;
  const kw = keyword.toLowerCase();

  // Direct word boundary test
  const directRegex = new RegExp(`(^|[^a-z0-9])${escapeRegex(kw)}([^a-z0-9]|$)`, 'i');
  if (directRegex.test(normalizedText)) return true;

  // Check aliases
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    if (canonical === kw || alias === kw) {
      const targetTerm = canonical === kw ? alias : canonical;
      const aliasRegex = new RegExp(`(^|[^a-z0-9])${escapeRegex(targetTerm)}([^a-z0-9]|$)`, 'i');
      if (aliasRegex.test(normalizedText)) return true;
    }
  }

  return false;
}

/**
 * Extract meaningful keywords from job description.
 * @param {string} text
 * @returns {Set<string>}
 */
export function extractKeywords(text) {
  if (!text) return new Set();

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+#./]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w));

  return new Set(words);
}

/**
 * Score keyword match between resume and job description using word boundaries and aliases.
 * @param {string} resumeText
 * @param {string} jdText
 * @returns {{ score: number, matched: string[], missing: string[], total: number, matchRate: string }}
 */
export function matchKeywords(resumeText, jdText) {
  if (!jdText || !resumeText) {
    return { score: 100, matched: [], missing: [], total: 0, matchRate: 'N/A' };
  }

  const jdKeywords = extractKeywords(jdText);
  if (jdKeywords.size === 0) {
    return { score: 100, matched: [], missing: [], total: 0, matchRate: 'N/A' };
  }

  const matched = [];
  const missing = [];

  for (const kw of jdKeywords) {
    if (textContainsKeyword(resumeText, kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const uniqueMatched = [...new Set(matched)].slice(0, 35);
  const uniqueMissing = [...new Set(missing)].slice(0, 25);

  const score = jdKeywords.size > 0
    ? Math.round((matched.length / jdKeywords.size) * 100)
    : 100;

  return {
    score: Math.min(score, 100),
    matched: uniqueMatched,
    missing: uniqueMissing,
    total: jdKeywords.size,
    matchRate: `${matched.length}/${jdKeywords.size}`,
    type: 'lexical_and_aliases',
  };
}
