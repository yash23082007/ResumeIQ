/**
 * AI Rewrite Suggester
 *
 * Proposes STAR-format, quantified rewrites for weak bullets.
 * User approves before applying.
 */

import { llmCompleteJSON } from './llmClient.js';

/**
 * Generate rewrite suggestions for flagged bullets.
 * @param {Array<{ text: string, verbTier: string, suggestion: string }>} flaggedBullets
 * @param {string} resumeContext - Full resume text for context
 * @returns {Array<{ original: string, rewritten: string, explanation: string }>}
 */
export async function suggestRewrites(flaggedBullets, resumeContext) {
  if (!flaggedBullets || flaggedBullets.length === 0) return [];

  const bulletsText = flaggedBullets
    .map((b, i) => `${i + 1}. "${b.text}" (Issue: ${b.suggestion || 'weak verb'})`)
    .join('\n');

  const result = await llmCompleteJSON(
    `You are an expert resume coach. Rewrite weak resume bullet points using the STAR format (Situation, Task, Action, Result). 

Rules:
- Use a strong, specific action verb at the start
- Include a quantified metric or measurable impact where plausible
- Keep each bullet to 1-2 lines
- ONLY reference information that could reasonably be inferred from the original bullet — do NOT invent specific numbers, companies, or technologies not implied by the original
- If you add a metric placeholder, use [X] to indicate the user should fill it in`,

    `Here are the bullet points to improve:

${bulletsText}

Resume context for reference:
${resumeContext?.slice(0, 2000) || 'No additional context'}

Respond with a JSON array of objects, each with: "original", "rewritten", "explanation"`,
    { maxTokens: 2000 }
  );

  if (!result || !Array.isArray(result)) {
    // Graceful fallback: return template suggestions
    return flaggedBullets.map(b => ({
      original: b.text,
      rewritten: null,
      explanation: b.suggestion || 'Consider using a stronger action verb and adding measurable impact.',
    }));
  }

  return result;
}

/**
 * Generate an AI-tailored resume draft for a specific job description.
 */
export async function generateTailoredResume(resumeText, jdText, parsedJson) {
  const result = await llmCompleteJSON(
    `You are an expert resume tailoring assistant. Given a resume and a job description, suggest specific modifications to better align the resume with the role.

Rules:
- ONLY suggest changes that are truthful — never fabricate experience
- Suggest rephrasing existing bullets to emphasize relevant skills
- Suggest reordering sections for maximum relevance
- Identify which existing experience is most relevant to highlight
- Use keywords from the job description where naturally applicable`,

    `RESUME:
${resumeText?.slice(0, 3000)}

JOB DESCRIPTION:
${jdText?.slice(0, 2000)}

Respond with a JSON object: {
  "suggestions": [{ "section": string, "original": string, "suggested": string, "rationale": string }],
  "keywordsToAdd": [string],
  "sectionsToReorder": [string],
  "summary": string
}`,
    { maxTokens: 3000 }
  );

  return result || {
    suggestions: [],
    keywordsToAdd: [],
    sectionsToReorder: [],
    summary: 'AI tailoring is currently unavailable. Try again later.',
  };
}
