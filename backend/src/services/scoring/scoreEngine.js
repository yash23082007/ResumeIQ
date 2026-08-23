/**
 * Score Engine — Orchestrates all sub-scorers into an explainable composite score
 * (Algorithm 7.4)
 *
 * Runs ATS, keyword, readability, verb/impact, and bias checks.
 * Produces weighted sub-scores, findings, and an optional LLM narrative.
 */

import prisma from '../../database.js';
import { checkATSCompatibility } from '../analysis/atsChecker.js';
import { matchKeywords } from '../analysis/keywordMatcher.js';
import { scoreAllBullets } from '../analysis/verbScorer.js';
import { analyzeReadability } from '../analysis/readability.js';
import { detectBias } from '../analysis/biasDetector.js';
import { buildHeatmap } from '../analysis/heatmap.js';
import { llmComplete } from '../ai/llmClient.js';
import { suggestRewrites } from '../ai/rewriteSuggester.js';

// Sub-score weights (must sum to 1.0)
const WEIGHTS = {
  content_impact: 0.30,
  ats_compatibility: 0.25,
  keyword_relevance: 0.20,
  formatting: 0.15,
  readability: 0.10,
};

/**
 * Run the full analysis pipeline for a resume.
 * Updates the analysis record in the database when complete.
 *
 * @param {string} analysisId - The analysis record ID to update
 * @param {object} resume - The resume record from the database
 * @param {string|null} jobDescriptionId - Optional JD to match against
 */
export async function runFullAnalysis(analysisId, resume, jobDescriptionId) {
  try {
    const parsedJson = resume.parsedJson || {};
    const rawText = resume.rawText || '';

    // Fetch job description if provided
    let jdText = null;
    if (jobDescriptionId) {
      const jd = await prisma.jobDescription.findUnique({
        where: { id: jobDescriptionId },
      });
      jdText = jd?.rawText || null;
    }

    // ─── Run all sub-scorers ────────────────────
    const atsResult = checkATSCompatibility(parsedJson);
    const keywordResult = matchKeywords(rawText, jdText);
    const verbResult = scoreAllBullets(parsedJson);
    const readabilityResult = analyzeReadability(rawText);
    const biasResult = detectBias(rawText);
    const heatmapResult = buildHeatmap(parsedJson);

    // ─── Formatting score ───────────────────────
    const formattingScore = computeFormattingScore(parsedJson);

    // ─── Sub-scores ─────────────────────────────
    const subScores = {
      content_impact: verbResult.score,
      ats_compatibility: atsResult.score,
      keyword_relevance: jdText ? keywordResult.score : 75, // Default if no JD
      formatting: formattingScore,
      readability: readabilityResult.score,
    };

    // ─── Overall score ──────────────────────────
    const overall = Object.entries(WEIGHTS).reduce(
      (sum, [key, weight]) => sum + (subScores[key] || 50) * weight,
      0
    );
    const overallScore = Math.round(overall * 10) / 10;

    // ─── Collect all findings ───────────────────
    const findings = {
      ats: atsResult,
      keywords: keywordResult,
      impact: verbResult,
      readability: readabilityResult,
      bias: biasResult,
      formatting: { score: formattingScore },
    };

    // ─── AI-enhanced findings (optional) ────────
    let narrative = null;
    let rewrites = [];

    // Generate narrative explanation
    narrative = await generateNarrative(subScores, findings, overallScore);

    // Generate rewrite suggestions for weak bullets
    const weakBullets = (verbResult.bullets || []).filter(
      b => b.verbTier === 'weak' || !b.quantified
    );
    if (weakBullets.length > 0) {
      rewrites = await suggestRewrites(weakBullets.slice(0, 5), rawText);
    }

    findings.narrative = narrative;
    findings.rewrites = rewrites;
    findings.heatmap = heatmapResult;

    // ─── Update analysis record ─────────────────
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        overallScore,
        subScores,
        findings,
        heatmapData: heatmapResult,
        status: 'completed',
      },
    });

    console.log(`✓ Analysis ${analysisId} completed — score: ${overallScore}`);
  } catch (err) {
    console.error(`✗ Analysis ${analysisId} failed:`, err);

    // Mark as failed
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: 'failed',
        findings: { error: err.message },
      },
    });
  }
}

/**
 * Compute a formatting score from parsed metadata.
 */
function computeFormattingScore(parsedJson) {
  if (!parsedJson) return 50;

  let score = 100;
  const sections = parsedJson.sections || {};
  const layout = parsedJson.layout || {};

  // Check for key sections
  const expectedSections = ['summary', 'experience', 'education', 'skills'];
  const foundSections = Object.keys(sections);
  const missingSections = expectedSections.filter(s => !foundSections.includes(s));
  score -= missingSections.length * 8;

  // Word count check
  const wordCount = parsedJson.wordCount || 0;
  if (wordCount < 200) score -= 15;
  else if (wordCount < 300) score -= 5;
  else if (wordCount > 1200) score -= 10;

  // Page count check
  if (layout.pageCount > 2) score -= 10;

  // Bullet points check (experience should have bullets)
  if (sections.experience && (!sections.experience.bullets || sections.experience.bullets.length < 3)) {
    score -= 10;
  }

  return Math.max(score, 0);
}

/**
 * Generate a plain-English narrative explaining the scores.
 * Falls back to a template if LLM is unavailable.
 */
async function generateNarrative(subScores, findings, overallScore) {
  const llmNarrative = await llmComplete(
    `You are a career coach providing a concise, actionable summary of a resume analysis. 

Rules:
- Be encouraging but honest
- Reference SPECIFIC findings from the analysis data
- Prioritize the 2-3 most impactful improvements
- Keep it to 3-4 sentences
- Don't use generic advice — be specific to this resume's data`,

    `Resume analysis results:
Overall score: ${overallScore}/100
Sub-scores: ${JSON.stringify(subScores)}
ATS issues: ${findings.ats?.issues?.length || 0} found
Weak bullets: ${findings.impact?.summary?.weak || 0} out of ${findings.impact?.summary?.total || 0}
Quantified bullets: ${findings.impact?.summary?.quantified || 0} out of ${findings.impact?.summary?.total || 0}
Readability (Flesch-Kincaid): ${findings.readability?.fleschKincaid || 'N/A'}
Buzzwords found: ${findings.readability?.buzzwords?.length || 0}
Bias flags: ${findings.bias?.flags?.length || 0}
Keywords matched: ${findings.keywords?.matched?.length || 'N/A'}
Keywords missing: ${findings.keywords?.missing?.slice(0, 5)?.join(', ') || 'N/A'}

Write a concise narrative summary.`,
    { maxTokens: 500, temperature: 0.4 }
  );

  if (llmNarrative) return llmNarrative;

  // Fallback template narrative
  const parts = [];

  if (overallScore >= 80) {
    parts.push(`Your resume scores ${overallScore}/100 — strong overall.`);
  } else if (overallScore >= 60) {
    parts.push(`Your resume scores ${overallScore}/100 — good foundation with room for improvement.`);
  } else {
    parts.push(`Your resume scores ${overallScore}/100 — there are several areas that need attention.`);
  }

  if (findings.ats?.issues?.length > 0) {
    parts.push(`${findings.ats.issues.length} ATS compatibility issue(s) found that could prevent your resume from being parsed correctly.`);
  }

  if (findings.impact?.summary?.weak > 0) {
    parts.push(`${findings.impact.summary.weak} bullet point(s) use weak verbs — consider stronger action verbs with quantified results.`);
  }

  return parts.join(' ');
}
