/**
 * Readability Scorer
 *
 * Computes Flesch-Kincaid readability, sentence complexity,
 * and jargon density for the resume text.
 */

/**
 * Count syllables in a word (approximation).
 */
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Split text into sentences.
 */
function splitSentences(text) {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);
}

/**
 * Split text into words.
 */
function splitWords(text) {
  return text.split(/\s+/).filter(w => w.replace(/[^a-z]/gi, '').length > 0);
}

/**
 * Compute Flesch-Kincaid Reading Ease score.
 * Higher = easier to read. Target: 40-60 for professional resumes.
 */
function fleschKincaid(text) {
  const sentences = splitSentences(text);
  const words = splitWords(text);

  if (sentences.length === 0 || words.length === 0) return 50;

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Detect overly complex/long sentences.
 */
function detectComplexSentences(text) {
  const sentences = splitSentences(text);
  const issues = [];

  for (const sentence of sentences) {
    const wordCount = splitWords(sentence).length;
    if (wordCount > 35) {
      issues.push({
        text: sentence.slice(0, 80) + (sentence.length > 80 ? '...' : ''),
        wordCount,
        issue: 'Very long sentence — may lose the reader\'s attention.',
        suggestion: 'Break into 2+ shorter sentences or use bullet points.',
      });
    }
  }

  return issues;
}

// Common resume jargon / buzzwords that dilute impact
const BUZZWORDS = new Set([
  'synergy', 'leverage', 'paradigm', 'proactive', 'dynamic',
  'results-driven', 'self-starter', 'team player', 'go-getter',
  'think outside the box', 'detail-oriented', 'hard-working',
  'motivated', 'passionate', 'guru', 'ninja', 'rockstar',
  'best-of-breed', 'cutting-edge', 'world-class', 'innovative',
  'strategic thinker', 'visionary', 'thought leader',
]);

/**
 * Detect buzzwords and jargon.
 */
function detectBuzzwords(text) {
  const lower = text.toLowerCase();
  const found = [];

  for (const word of BUZZWORDS) {
    if (lower.includes(word)) {
      found.push({
        term: word,
        suggestion: `"${word}" is a common buzzword — replace with a specific, quantified accomplishment.`,
      });
    }
  }

  return found;
}

/**
 * Full readability analysis.
 * @param {string} rawText
 * @returns {{ score: number, fleschKincaid: number, complexSentences: Array, buzzwords: Array, stats: object }}
 */
export function analyzeReadability(rawText) {
  if (!rawText) {
    return { score: 50, fleschKincaid: 50, complexSentences: [], buzzwords: [], stats: {} };
  }

  const fk = fleschKincaid(rawText);
  const complexSentences = detectComplexSentences(rawText);
  const buzzwords = detectBuzzwords(rawText);

  const words = splitWords(rawText);
  const sentences = splitSentences(rawText);

  const stats = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: sentences.length > 0
      ? Math.round(words.length / sentences.length)
      : 0,
    avgWordLength: words.length > 0
      ? Math.round((words.reduce((s, w) => s + w.length, 0) / words.length) * 10) / 10
      : 0,
  };

  // Score: penalize for low FK, complex sentences, and buzzwords
  let score = 100;

  // FK score contribution (target: 40-60)
  if (fk < 30) score -= 20;
  else if (fk < 40) score -= 10;
  else if (fk > 70) score -= 10; // Too simple for a professional doc

  // Complex sentences penalty
  score -= Math.min(complexSentences.length * 5, 20);

  // Buzzword penalty
  score -= Math.min(buzzwords.length * 3, 15);

  return {
    score: Math.max(score, 0),
    fleschKincaid: fk,
    complexSentences,
    buzzwords,
    stats,
  };
}
