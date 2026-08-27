/**
 * Cover Letter Generator
 *
 * Generates a tailored cover letter from resume + job description.
 */

import { llmComplete } from './llmClient.js';

/**
 * Generate a cover letter.
 * @param {string} resumeText
 * @param {string} jdText
 * @param {object} parsedJson - Parsed resume for structured access
 * @returns {{ coverLetter: string, highlights: string[] }}
 */
export async function generateCoverLetter(resumeText, jdText, parsedJson) {
  const contactInfo = parsedJson?.sections?.contact || {};
  const name = contactInfo.name || '[Your Name]';

  const coverLetter = await llmComplete(
    `You are an expert career coach writing a compelling, professional cover letter.

Rules:
- Write in first person from the candidate's perspective
- Reference ONLY experience, skills, and achievements actually present in the resume
- Connect the candidate's specific experience to the job requirements
- Keep it to 3-4 paragraphs, under 400 words
- Be confident but not arrogant
- Avoid generic filler — every sentence should add value
- Do NOT include placeholder addresses or dates — start with "Dear Hiring Manager,"
- End with a professional closing`,

    `Write a cover letter for this candidate.

CANDIDATE NAME: ${name}

RESUME:
${resumeText?.slice(0, 3000)}

JOB DESCRIPTION:
${jdText?.slice(0, 2000)}`,
    { maxTokens: 1500, temperature: 0.5 }
  );

  if (!coverLetter) {
    return {
      text: null,
      coverLetter: null,
      highlights: [],
      wordCount: 0,
      error: 'Cover letter generation is currently unavailable. Please ensure the LLM API key is configured.',
    };
  }

  // Extract key highlights that were emphasized
  const highlights = extractHighlights(coverLetter, resumeText);
  const wordCount = coverLetter.split(/\s+/).length;

  return {
    text: coverLetter,
    coverLetter, // backward-compatible alias
    highlights,
    wordCount,
  };
}

/**
 * Extract the key resume points that the cover letter emphasizes.
 */
function extractHighlights(coverLetter, resumeText) {
  const highlights = [];

  // Find sentences that reference specific achievements
  const sentences = coverLetter.split(/[.!]/).map(s => s.trim()).filter(s => s.length > 20);

  for (const sentence of sentences) {
    // Look for quantified achievements or specific skills mentioned
    if (/\d+%|\$[\d,.]+|\d+\+?\s*(year|project|team|client)/i.test(sentence)) {
      highlights.push(sentence);
    }
  }

  return highlights.slice(0, 5);
}
