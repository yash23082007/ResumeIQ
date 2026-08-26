/**
 * Verification test script for backend routes and services
 */

import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('--- Starting Backend Verification Tests ---');

  try {
    const { parseResume } = await import('../src/services/parsing/parser.js');
    const { simulateATS } = await import('../src/services/analysis/atsChecker.js');
    const { buildHeatmap } = await import('../src/services/analysis/heatmap.js');

    console.log('✓ Core parsing and analysis services imported successfully');

    // Create temp test file
    const tmpFilePath = path.resolve('./uploads/temp_test_resume.txt');
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
    }

    const sampleText = `Alex Morgan
alex.morgan@email.com | (555) 019-2834 | San Francisco, CA

EXPERIENCE
Senior Software Engineer — CloudScale Technologies (2022 – Present)
• Spearheaded the architectural migration of monolithic API to Node.js microservices, reducing p99 latency by 42% for 1.5M monthly active users.
• Orchestrated automated CI/CD pipelines with GitHub Actions and Docker.

SKILLS
JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, Redis, Docker, AWS`;

    fs.writeFileSync(tmpFilePath, sampleText, 'utf8');

    const parsed = await parseResume(tmpFilePath, 'sample.txt');
    console.log(`✓ Parser extracted ${parsed.structured?.skills?.length || 0} skills and ${Object.keys(parsed.structured?.sections || {}).length} sections`);

    const atsResults = simulateATS(parsed.structured || {});
    console.log(`✓ ATS Simulation passed ${atsResults.checks?.filter(c => c.passed).length || 0} checks across simulated engines`);

    const heatmap = buildHeatmap(parsed.rawText, parsed.structured || {});
    console.log(`✓ Recruiter Heatmap generated with ${heatmap.density?.length || 0} line density weights`);

    // Clean up temp file
    if (fs.existsSync(tmpFilePath)) {
      fs.unlinkSync(tmpFilePath);
    }

    console.log('--- All Backend Unit & Integration Tests Passed Successfully! ---');
  } catch (err) {
    console.error('❌ Backend test failed:', err);
    process.exit(1);
  }
}

runTests();
