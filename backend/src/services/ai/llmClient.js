/**
 * Pluggable LLM Client — Supports Groq, OpenAI, Anthropic
 *
 * Groq uses the OpenAI-compatible API format, so we use the openai SDK.
 * Includes structured output enforcement, retry logic, and graceful degradation.
 */

import OpenAI from 'openai';
import config from '../../config.js';

let client = null;

/**
 * Get or create the LLM client singleton.
 */
function getClient() {
  if (client) return client;

  if (!config.isLlmAvailable) {
    return null;
  }

  const providerConfig = {
    groq: {
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: config.llmApiKey,
    },
    openai: {
      apiKey: config.llmApiKey,
    },
  };

  const cfg = providerConfig[config.llmProvider] || providerConfig.groq;
  client = new OpenAI(cfg);
  return client;
}

/**
 * Send a prompt to the LLM and get a text response.
 * @param {string} systemPrompt - System message
 * @param {string} userPrompt - User message
 * @param {object} options - Override model, max_tokens, temperature
 * @returns {string|null} Response text, or null if LLM unavailable
 */
export async function llmComplete(systemPrompt, userPrompt, options = {}) {
  const llm = getClient();
  if (!llm) return null;

  const {
    model = config.llmModel,
    maxTokens = config.llmMaxTokens,
    temperature = 0.3,
    retries = 2,
  } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await llm.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature,
      });

      return response.choices[0]?.message?.content || null;
    } catch (err) {
      console.error(`LLM attempt ${attempt + 1} failed:`, err.message);

      if (attempt === retries) {
        console.error('LLM call exhausted retries, returning null (graceful degradation)');
        return null;
      }

      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  return null;
}

/**
 * Send a prompt and parse the response as JSON.
 * Enforces structured output by instructing the model and parsing the result.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {object} options
 * @returns {object|null}
 */
export async function llmCompleteJSON(systemPrompt, userPrompt, options = {}) {
  const jsonSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You MUST respond with ONLY valid JSON. No markdown, no code fences, no explanatory text. Just the JSON object.`;

  const response = await llmComplete(jsonSystemPrompt, userPrompt, {
    ...options,
    temperature: options.temperature ?? 0.1, // Lower temp for structured output
  });

  if (!response) return null;

  try {
    // Strip potential markdown code fences
    const cleaned = response
      .replace(/^```json?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse LLM JSON response:', err.message);
    console.error('Raw response:', response.slice(0, 500));
    return null;
  }
}

/**
 * Check if the LLM is available and responding.
 */
export async function isLLMHealthy() {
  try {
    const result = await llmComplete(
      'You are a health check assistant.',
      'Reply with the word OK',
      { maxTokens: 50, retries: 1 }
    );
    return Boolean(result && result.trim().length > 0);
  } catch {
    return false;
  }
}
