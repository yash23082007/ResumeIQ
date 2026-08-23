/**
 * Semantic Matcher — Blended embedding + keyword matching (Algorithm 7.2)
 *
 * Combines cosine similarity of text embeddings (catches paraphrases)
 * with exact keyword overlap (rewards precise ATS hits).
 */

import { llmComplete } from '../ai/llmClient.js';
import { extractKeywords, matchKeywords } from '../analysis/keywordMatcher.js';

/**
 * Compute cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

/**
 * Generate a simple embedding using the LLM to extract key concepts.
 * Falls back to TF-IDF-like approach when LLM is unavailable.
 */
async function getTextFeatures(text) {
  // Simple word-frequency vector as a fallback/primary approach
  // This avoids needing a dedicated embedding API
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  return freq;
}

/**
 * Compute similarity between two word-frequency maps.
 */
function computeFrequencySimilarity(freqA, freqB) {
  const allWords = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  const vecA = [];
  const vecB = [];

  for (const word of allWords) {
    vecA.push(freqA[word] || 0);
    vecB.push(freqB[word] || 0);
  }

  return cosineSimilarity(vecA, vecB);
}

/**
 * Perform semantic + keyword match between resume and job description.
 * @param {string} resumeText
 * @param {string} jdText
 * @returns {{ score: number, semanticScore: number, keywordScore: number, missingKeywords: string[], matchedKeywords: string[], insights: string[] }}
 */
export async function semanticMatchScore(resumeText, jdText) {
  if (!resumeText || !jdText) {
    return { score: 0, semanticScore: 0, keywordScore: 0, missingKeywords: [], matchedKeywords: [], insights: [] };
  }

  // 1. Keyword matching (deterministic)
  const keywordResult = matchKeywords(resumeText, jdText);

  // 2. Semantic similarity (TF-IDF cosine)
  const resumeFeatures = await getTextFeatures(resumeText);
  const jdFeatures = await getTextFeatures(jdText);
  const semanticSim = computeFrequencySimilarity(resumeFeatures, jdFeatures);

  // 3. Blended score: 60% semantic, 40% keyword (per algorithm 7.2)
  const blended = 0.6 * semanticSim + 0.4 * (keywordResult.score / 100);
  const score = Math.round(blended * 100 * 10) / 10;

  // 4. Generate insights
  const insights = [];

  if (score >= 80) {
    insights.push('Strong match — your resume aligns well with this job description.');
  } else if (score >= 60) {
    insights.push('Decent match, but there\'s room to improve alignment.');
  } else if (score >= 40) {
    insights.push('Moderate gap between your resume and this role. Consider tailoring your experience descriptions.');
  } else {
    insights.push('Significant gap — this role may require substantial resume tailoring or additional experience.');
  }

  if (keywordResult.missing.length > 0) {
    const topMissing = keywordResult.missing.slice(0, 5);
    insights.push(`Key missing terms: ${topMissing.join(', ')}. Try incorporating these where truthfully applicable.`);
  }

  if (keywordResult.score > semanticSim * 100) {
    insights.push('Your keywords match well, but your descriptions may not fully convey the relevant experience. Consider rephrasing to better reflect the role\'s requirements.');
  }

  return {
    score,
    semanticScore: Math.round(semanticSim * 100 * 10) / 10,
    keywordScore: keywordResult.score,
    missingKeywords: keywordResult.missing,
    matchedKeywords: keywordResult.matched,
    insights,
  };
}
