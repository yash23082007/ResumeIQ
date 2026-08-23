/**
 * Interview Question Predictor
 *
 * Generates likely behavioral and technical questions
 * grounded in the resume's actual content.
 */

import { llmCompleteJSON } from './llmClient.js';

/**
 * Predict interview questions based on resume content.
 * @param {string} resumeText
 * @param {object} parsedJson
 * @returns {{ questions: Array<{ type: string, question: string, context: string, tip: string }> }}
 */
export async function predictInterviewQuestions(resumeText, parsedJson) {
  const result = await llmCompleteJSON(
    `You are an experienced technical interviewer and hiring manager. Based on the candidate's resume, predict the most likely interview questions they would face.

Rules:
- Generate questions that are DIRECTLY grounded in the resume's content
- Include a mix of behavioral (STAR-format) and technical questions
- Reference specific projects, technologies, or experiences from the resume
- For each question, explain WHY an interviewer would ask it (what they're probing)
- Include a brief tip on how to answer well
- Generate 8-12 questions total`,

    `RESUME:
${resumeText?.slice(0, 3000)}

Respond with a JSON object: {
  "questions": [
    {
      "type": "behavioral" or "technical" or "situational",
      "question": "the interview question",
      "context": "which part of the resume prompted this question",
      "tip": "brief advice on how to answer well"
    }
  ]
}`,
    { maxTokens: 2500 }
  );

  if (!result || !result.questions) {
    // Graceful fallback: generate generic but useful questions from resume sections
    return {
      questions: generateFallbackQuestions(parsedJson),
    };
  }

  return result;
}

/**
 * Generate basic interview questions without AI, based on resume structure.
 */
function generateFallbackQuestions(parsedJson) {
  const questions = [];
  const sections = parsedJson?.sections || {};

  if (sections.experience) {
    questions.push({
      type: 'behavioral',
      question: 'Tell me about a challenging project you worked on and how you overcame obstacles.',
      context: 'Work experience section',
      tip: 'Use the STAR format: Situation, Task, Action, Result. Be specific about your contribution.',
    });
    questions.push({
      type: 'behavioral',
      question: 'Describe a time you had to work with a difficult team member.',
      context: 'Team collaboration experience',
      tip: 'Focus on the positive outcome and what you learned.',
    });
  }

  if (sections.skills) {
    questions.push({
      type: 'technical',
      question: 'Walk me through your experience with the technologies listed in your skills section.',
      context: 'Technical skills',
      tip: 'Rate your proficiency honestly and provide specific project examples for your strongest skills.',
    });
  }

  if (sections.education) {
    questions.push({
      type: 'behavioral',
      question: 'How has your education prepared you for this role?',
      context: 'Education section',
      tip: 'Connect specific coursework or projects to the job requirements.',
    });
  }

  questions.push({
    type: 'situational',
    question: 'Where do you see yourself in 5 years?',
    context: 'Career trajectory',
    tip: 'Show ambition while aligning with the company\'s growth opportunities.',
  });

  questions.push({
    type: 'behavioral',
    question: 'What\'s your greatest professional achievement and why?',
    context: 'Overall resume',
    tip: 'Pick an achievement with measurable impact and explain the process, not just the result.',
  });

  return questions;
}
