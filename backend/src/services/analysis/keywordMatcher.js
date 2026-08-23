/**
 * Keyword Matcher — Exact-match scoring against a job description
 *
 * Extracts keywords from both resume and JD, computes overlap,
 * and identifies missing keywords.
 */

// Common stop words to filter out
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
]);

/**
 * Extract meaningful keywords/phrases from text.
 * @param {string} text
 * @returns {Set<string>}
 */
export function extractKeywords(text) {
  if (!text) return new Set();

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+#./]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  // Also extract multi-word phrases (bigrams) for technical terms
  const phrases = [];
  const wordArray = text.toLowerCase().replace(/[^a-z0-9\s\-+#.]/g, ' ').split(/\s+/).filter(Boolean);

  for (let i = 0; i < wordArray.length - 1; i++) {
    const bigram = `${wordArray[i]} ${wordArray[i + 1]}`;
    if (!STOP_WORDS.has(wordArray[i]) && !STOP_WORDS.has(wordArray[i + 1])) {
      phrases.push(bigram);
    }
  }

  return new Set([...words, ...phrases]);
}

/**
 * Score keyword match between resume and job description.
 * @param {string} resumeText
 * @param {string} jdText
 * @returns {{ score: number, matched: string[], missing: string[], total: number, details: object }}
 */
export function matchKeywords(resumeText, jdText) {
  if (!jdText) {
    return { score: 100, matched: [], missing: [], total: 0, details: {} };
  }

  const resumeKw = extractKeywords(resumeText);
  const jdKw = extractKeywords(jdText);

  // Prioritize JD keywords — which ones does the resume have?
  const matched = [];
  const missing = [];

  for (const kw of jdKw) {
    if (resumeKw.has(kw) || resumeText.toLowerCase().includes(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  // Filter missing to only meaningful/unique terms (remove duplicates of matched bigrams)
  const filteredMissing = missing.filter(m => {
    // If it's a single word that's part of a matched bigram, skip
    if (!m.includes(' ')) {
      return !matched.some(matched_kw => matched_kw.includes(m));
    }
    return true;
  });

  // Deduplicate and take top missing keywords
  const uniqueMissing = [...new Set(filteredMissing)].slice(0, 20);
  const uniqueMatched = [...new Set(matched)].slice(0, 30);

  const score = jdKw.size > 0
    ? Math.round((matched.length / jdKw.size) * 100)
    : 100;

  return {
    score: Math.min(score, 100),
    matched: uniqueMatched,
    missing: uniqueMissing,
    total: jdKw.size,
    matchRate: `${matched.length}/${jdKw.size}`,
  };
}
