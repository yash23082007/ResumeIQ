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
    const sections = parsed.structured?.sections || {};
    if (!sections.experience || !sections.skills) throw new Error('Parser did not extract required experience and skills sections.');
    if (!sections.skills.content.includes('JavaScript')) throw new Error('Parser skills section does not contain expected skill content.');
    console.log(`✓ Parser extracted required sections: ${Object.keys(sections).join(', ')}`);

    const atsResults = simulateATS(parsed.structured || {});
    if (!Array.isArray(atsResults.results) || atsResults.results.length !== 4) throw new Error('ATS simulation must return four profile results.');
    console.log(`✓ ATS Simulation returned ${atsResults.results.length} heuristic profiles`);

    const heatmap = buildHeatmap(parsed.structured || {});
    if (!Array.isArray(heatmap.cells) || heatmap.cells.length === 0) throw new Error('Recruiter heatmap returned no section cells.');
    console.log(`✓ Recruiter Heatmap generated ${heatmap.cells.length} section cells`);

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
