/**
 * Readability Scorer
 *
 * Computes Flesch Reading Ease, Flesch-Kincaid Grade Level, sentence complexity,
 * and buzzword density for resume text.
 */

/**
 * Count syllables in a word (accurate linguistic approximation).
 */
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(matches.length, 1) : 1;
}

/**
 * Split text into sentences (accounts for bullet points and newline boundaries).
 */
function splitSentences(text) {
  const lines = text.split('\n');
  const sentences = [];

  for (const line of lines) {
    const trimmed = line.replace(/^[•●■◆▪→\-*]\s*/, '').trim();
    if (!trimmed) continue;

    // Split by terminal punctuation
    const chunks = trimmed.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
    if (chunks.length > 0) {
      sentences.push(...chunks);
    } else if (trimmed.length > 5) {
      sentences.push(trimmed);
    }
  }

  return sentences;
}

/**
 * Split text into valid words.
 */
function splitWords(text) {
  return text.split(/\s+/).filter(w => w.replace(/[^a-z0-9]/gi, '').length > 0);
}

/**
 * Compute Flesch Reading Ease score (0 - 100). Target: 50-70 for professional resumes.
 */
function computeReadingEase(words, sentences, totalSyllables) {
  if (sentences.length === 0 || words.length === 0) return 50;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

/**
 * Compute Flesch-Kincaid Grade Level (e.g. 10.4 = Grade 10). Target: Grade 9 - 12.
 */
function computeGradeLevel(words, sentences, totalSyllables) {
  if (sentences.length === 0 || words.length === 0) return 10.0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  return Math.max(1, Math.min(20, Math.round(grade * 10) / 10));
}

/**
 * Detect overly complex/long sentences (>32 words).
 */
function detectComplexSentences(sentences) {
  const issues = [];

  for (const sentence of sentences) {
    const wordCount = splitWords(sentence).length;
    if (wordCount > 32) {
      issues.push({
        text: sentence.slice(0, 90) + (sentence.length > 90 ? '...' : ''),
        wordCount,
        issue: 'Very long sentence — may cause recruiter fatigue during rapid screening.',
        suggestion: 'Break into 2 concise statements or separate into distinct bullet points.',
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
  'best-of-breed', 'cutting-edge', 'world-class',
  'strategic thinker', 'visionary', 'thought leader',
]);

/**
 * Detect buzzwords and jargon.
 */
function detectBuzzwords(text) {
  const lower = text.toLowerCase();
  const found = [];

  for (const word of BUZZWORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower)) {
      found.push({
        term: word,
        suggestion: `"${word}" is a common cliché — substitute with an active, quantified achievement.`,
      });
    }
  }

  return found;
}

/**
 * Full readability analysis.
 * @param {string} rawText
 * @returns {{ score: number, fleschReadingEase: number, fleschKincaidGrade: number, fleschKincaid: number, complexSentences: Array, buzzwords: Array, stats: object }}
 */
export function analyzeReadability(rawText) {
  if (!rawText) {
    return {
      score: 50,
      fleschReadingEase: 50,
      fleschKincaidGrade: 10,
      fleschKincaid: 50,
      complexSentences: [],
      buzzwords: [],
      stats: {},
    };
  }

  const words = splitWords(rawText);
  const sentences = splitSentences(rawText);
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const readingEase = computeReadingEase(words, sentences, totalSyllables);
  const gradeLevel = computeGradeLevel(words, sentences, totalSyllables);
  const complexSentences = detectComplexSentences(sentences);
  const buzzwords = detectBuzzwords(rawText);

  const stats = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: sentences.length > 0
      ? Math.round((words.length / sentences.length) * 10) / 10
      : 0,
    avgWordLength: words.length > 0
      ? Math.round((words.reduce((s, w) => s + w.length, 0) / words.length) * 10) / 10
      : 0,
  };

  // Score computation: optimal grade level 9 - 13
  let score = 100;

  if (gradeLevel > 14) score -= 15;
  else if (gradeLevel < 8) score -= 10;

  // Complex sentences penalty
  score -= Math.min(complexSentences.length * 5, 20);

  // Buzzword penalty
  score -= Math.min(buzzwords.length * 3, 15);

  return {
    score: Math.max(score, 0),
    fleschReadingEase: readingEase,
    fleschKincaidGrade: gradeLevel,
    fleschKincaid: readingEase, // backwards compatibility
    complexSentences,
    buzzwords,
    stats,
  };
}
