/**
 * Comprehensive verification and test runner for ResumeIQ services
 */

import { checkATSCompatibility, simulateATS } from '../src/services/analysis/atsChecker.js';
import { scoreBullet, scoreAllBullets } from '../src/services/analysis/verbScorer.js';
import { matchKeywords } from '../src/services/analysis/keywordMatcher.js';
import { analyzeReadability } from '../src/services/analysis/readability.js';
import { detectBias } from '../src/services/analysis/biasDetector.js';
import { buildHeatmap } from '../src/services/analysis/heatmap.js';
import { semanticMatchScore } from '../src/services/semantic/matcher.js';
import { isLLMHealthy } from '../src/services/ai/llmClient.js';
import { extractSections } from '../src/services/parsing/sectionExtractor.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🧪 Starting ResumeIQ Verification Test Suite...\n');

  // Test 1: Section Extractor
  console.log('1. Section Segmentation & Parsing:');
  const sampleResume = `
John Doe
john.doe@example.com | (555) 123-4567 | linkedin.com/in/johndoe

SUMMARY
Experienced Software Engineer with 5+ years building scalable distributed systems and cloud services.

EXPERIENCE
Senior Software Engineer - TechCorp (2021 - Present)
• Spearheaded migration of legacy monolith to microservices, reducing latency by 45% for 2M daily active users.
• Responsible for leading a team of 4 engineers and maintaining CI/CD pipelines.
• Helped with debugging production incidents and wrote technical documentation.

EDUCATION
B.S. in Computer Science - University of California (2016 - 2020)

SKILLS
JavaScript, TypeScript, Node.js, React, Python, PostgreSQL, Docker, AWS
  `.trim();

  const sections = extractSections(sampleResume);
  assert(sections.summary !== undefined, 'Extracts summary section');
  assert(sections.experience !== undefined, 'Extracts experience section');
  assert(sections.education !== undefined, 'Extracts education section');
  assert(sections.skills !== undefined, 'Extracts skills section');
  assert(sections.experience?.bullets?.length >= 2, 'Extracts bullet points from experience');

  // Test 2: Action-Verb & Impact Scorer (Algorithm 7.3)
  console.log('\n2. Action-Verb & Impact Scoring:');
  const bullet1 = scoreBullet('Spearheaded migration of legacy monolith to microservices, reducing latency by 45% for 2M users.');
  const bullet2 = scoreBullet('Responsible for leading a team of 4 engineers.');
  const bullet3 = scoreBullet('Helped with debugging production incidents.');

  assert(bullet1.verbTier === 'strong', 'Detects strong verb "spearheaded"');
  assert(bullet1.quantified === true, 'Detects quantified metric "45%" and "2M"');
  assert(bullet2.verbTier === 'weak', 'Detects weak phrase "responsible for"');
  assert(bullet3.verbTier === 'weak', 'Detects weak phrase "helped with"');
  assert(bullet3.quantified === false, 'Detects unquantified bullet');

  const allBulletsResult = scoreAllBullets({ sections });
  assert(allBulletsResult.score > 0, `Computes overall bullet impact score: ${allBulletsResult.score}/100`);

  // Test 3: ATS Compatibility Scorer (Algorithm 7.1)
  console.log('\n3. ATS Compatibility & Simulation:');
  const atsGood = checkATSCompatibility({
    layout: { hasMultiColumnTables: false, hasImages: false, hasColumns: false },
    sections: { summary: {}, experience: {}, education: {}, skills: {} },
    wordCount: 350,
  });
  assert(atsGood.score >= 90, `Clean layout receives high score (${atsGood.score}/100)`);

  const atsBad = checkATSCompatibility({
    layout: { hasMultiColumnTables: true, hasImages: true, hasColumns: true },
    sections: {},
    wordCount: 50,
  });
  assert(atsBad.score < 50, `Problematic layout correctly flagged (${atsBad.score}/100)`);
  assert(atsBad.issues.length >= 3, `Flags layout issues (found ${atsBad.issues.length})`);

  const atsSim = simulateATS({ layout: { hasColumns: true }, sections: { experience: {} } });
  assert(atsSim.results.length === 4, 'Simulates across 4 ATS families (Workday, Greenhouse, Taleo, iCIMS)');

  // Test 4: Readability & Buzzwords
  console.log('\n4. Readability & Buzzword Analysis:');
  const readabilitySample = 'We leverage synergistic paradigms and dynamic cutting-edge solutions to maximize results.';
  const readabilityResult = analyzeReadability(readabilitySample);
  assert(readabilityResult.buzzwords.length >= 3, `Detects buzzwords (found ${readabilityResult.buzzwords.length})`);
  assert(readabilityResult.fleschKincaid >= 0, `Computes Flesch-Kincaid index: ${readabilityResult.fleschKincaid}`);

  // Test 5: Bias & Inclusive Language Detector (Algorithm 7.6)
  console.log('\n5. Bias & Inclusive Language:');
  const biasSample = 'Graduated with Bachelor degree in 1998. Experienced salesman and chairman. Married with 2 kids.';
  const biasResult = detectBias(biasSample);
  assert(biasResult.flags.some(f => f.type === 'age'), 'Flags old graduation date (1998)');
  assert(biasResult.flags.some(f => f.type === 'language'), 'Flags gendered language ("salesman"/"chairman")');
  assert(biasResult.flags.some(f => f.type === 'personal'), 'Flags marital/family status');

  // Test 6: Keyword Matcher & Semantic Similarity (Algorithm 7.2)
  console.log('\n6. Keyword & Semantic Matching:');
  const jd = 'Looking for a Senior Software Engineer with expertise in TypeScript, Node.js, React, AWS, Docker, Kubernetes, and GraphQL.';
  const kwResult = matchKeywords(sampleResume, jd);
  assert(kwResult.matched.length > 0, `Matches relevant keywords (found ${kwResult.matched.length})`);
  assert(kwResult.missing.includes('kubernetes') || kwResult.missing.includes('graphql'), 'Identifies missing JD keywords');

  const semanticResult = await semanticMatchScore(sampleResume, jd);
  assert(semanticResult.score > 0, `Computes blended semantic match score: ${semanticResult.score}%`);

  // Test 7: Recruiter Heatmap Simulation (Algorithm 7.5)
  console.log('\n7. Attention Heatmap (F-Pattern):');
  const heatmap = buildHeatmap({ sections, lineCount: 30 });
  assert(heatmap.cells.length > 0, 'Generates attention cells');
  assert(heatmap.cells[0].attention >= heatmap.cells[heatmap.cells.length - 1].attention, 'Top sections receive higher attention weight (F-pattern)');

  // Test 8: Groq LLM Connectivity Check
  console.log('\n8. Groq AI Service Health:');
  try {
    const isHealthy = await isLLMHealthy();
    assert(isHealthy, 'Groq API Key connects & responds successfully');
  } catch (err) {
    console.log(`  ℹ Groq check skipped or network timeout: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
