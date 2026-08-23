/**
 * ATS Compatibility Checker
 *
 * Scores resume against documented ATS parsing failure modes.
 * Works directly from layout metadata and parsed structure.
 */

/**
 * Check ATS compatibility and return a score + issues list.
 * @param {object} parsedJson - The structured resume data from parsing
 * @returns {{ score: number, issues: Array<{ category: string, message: string, severity: string, deduction: number }> }}
 */
export function checkATSCompatibility(parsedJson) {
  if (!parsedJson) return { score: 50, issues: [{ category: 'parse', message: 'Resume could not be fully parsed', severity: 'critical', deduction: 50 }] };

  const layout = parsedJson.layout || {};
  const sections = parsedJson.sections || {};
  const issues = [];
  let score = 100;

  // 1. Multi-column tables
  if (layout.hasMultiColumnTables) {
    issues.push({
      category: 'layout',
      message: 'Multi-column tables often parse out of order in ATS systems, scrambling your experience entries.',
      severity: 'high',
      deduction: 20,
      suggestion: 'Replace tables with simple lists or single-column layout.',
    });
    score -= 20;
  }

  // 2. Text embedded in images
  if (layout.hasImages) {
    issues.push({
      category: 'content',
      message: 'Text embedded in images is invisible to ATS parsers — any skills, titles, or content in images will be lost.',
      severity: 'critical',
      deduction: 30,
      suggestion: 'Move all text content out of images into regular text.',
    });
    score -= 30;
  }

  // 3. Contact info in header/footer
  if (layout.contactInHeaderFooter) {
    issues.push({
      category: 'structure',
      message: 'Contact information placed in the document header/footer is often dropped by ATS parsers.',
      severity: 'medium',
      deduction: 10,
      suggestion: 'Move your name, email, and phone number into the main body of the document.',
    });
    score -= 10;
  }

  // 4. Non-standard section headers
  const standardSections = ['summary', 'experience', 'education', 'skills'];
  const foundSections = Object.keys(sections).filter(s => s !== 'header' && s !== 'contact');
  const hasStandardHeaders = standardSections.some(s => foundSections.includes(s));

  if (!hasStandardHeaders) {
    issues.push({
      category: 'structure',
      message: 'Non-standard section headers (e.g., "My Journey" instead of "Experience") confuse ATS parsers.',
      severity: 'medium',
      deduction: 10,
      suggestion: 'Use standard headers: "Experience", "Education", "Skills", "Summary".',
    });
    score -= 10;
  }

  // 5. Multi-column layout
  if (layout.hasColumns) {
    issues.push({
      category: 'layout',
      message: 'Multi-column layouts can cause ATS systems to read content in the wrong order.',
      severity: 'high',
      deduction: 15,
      suggestion: 'Use a single-column layout for maximum ATS compatibility.',
    });
    score -= 15;
  }

  // 6. Non-standard fonts
  if (layout.hasNonStandardFonts) {
    issues.push({
      category: 'formatting',
      message: 'Decorative or non-standard fonts can render as garbled text in some ATS systems.',
      severity: 'low',
      deduction: 5,
      suggestion: 'Use standard fonts: Arial, Calibri, Times New Roman, Helvetica.',
    });
    score -= 5;
  }

  // 7. Missing key sections
  if (!sections.experience && !sections.header?.content?.includes('experience')) {
    issues.push({
      category: 'structure',
      message: 'No "Experience" section detected — this is the most important section for ATS matching.',
      severity: 'high',
      deduction: 15,
      suggestion: 'Add a clearly labeled "Experience" or "Work Experience" section.',
    });
    score -= 15;
  }

  if (!sections.education) {
    issues.push({
      category: 'structure',
      message: 'No "Education" section detected — many ATS systems require this for automatic screening.',
      severity: 'medium',
      deduction: 5,
      suggestion: 'Add an "Education" section, even if brief.',
    });
    score -= 5;
  }

  // 8. Very short resume
  const wordCount = parsedJson.wordCount || 0;
  if (wordCount < 150) {
    issues.push({
      category: 'content',
      message: `Resume is very short (${wordCount} words). ATS keyword matching works better with more content.`,
      severity: 'medium',
      deduction: 10,
      suggestion: 'Expand your experience descriptions with specific accomplishments and metrics.',
    });
    score -= 10;
  }

  // 9. Too long
  const pageCount = layout.pageCount || 1;
  if (pageCount > 2) {
    issues.push({
      category: 'formatting',
      message: `Resume is ${pageCount} pages. Most recruiters and ATS systems expect 1-2 pages.`,
      severity: 'low',
      deduction: 5,
      suggestion: 'Condense to 1-2 pages by focusing on your most recent and relevant experience.',
    });
    score -= 5;
  }

  return {
    score: Math.max(score, 0),
    issues,
    passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
  };
}

/**
 * Simulate parsing across common ATS platform families.
 * Tests the resume against documented parsing failure modes.
 */
export function simulateATS(parsedJson) {
  const layout = parsedJson?.layout || {};
  const sections = parsedJson?.sections || {};

  const atsProfiles = [
    {
      name: 'Workday',
      type: 'Enterprise ATS',
      strengths: ['Good at PDF text extraction', 'Handles standard formatting well'],
      weaknesses: ['Struggles with multi-column layouts', 'Drops header/footer content'],
    },
    {
      name: 'Greenhouse',
      type: 'Modern ATS',
      strengths: ['Better handling of varied formats', 'Good section detection'],
      weaknesses: ['Can miss content in tables', 'Image text not extracted'],
    },
    {
      name: 'Taleo',
      type: 'Legacy ATS',
      strengths: ['Widely used', 'Basic text extraction works'],
      weaknesses: ['Poor with non-standard layouts', 'Limited font support', 'Tables frequently scrambled'],
    },
    {
      name: 'iCIMS',
      type: 'Enterprise ATS',
      strengths: ['Decent PDF parsing', 'Standard section recognition'],
      weaknesses: ['Multi-column issues', 'Special characters can cause problems'],
    },
  ];

  const results = atsProfiles.map(ats => {
    const issues = [];
    let parsedCorrectly = true;

    // Common failure scenarios
    if (layout.hasMultiColumnTables && ['Taleo', 'Workday'].includes(ats.name)) {
      issues.push('Table content may be scrambled or lost');
      parsedCorrectly = false;
    }

    if (layout.hasColumns && ats.name === 'Taleo') {
      issues.push('Multi-column layout likely to cause reading-order issues');
      parsedCorrectly = false;
    }

    if (layout.hasImages) {
      issues.push('Image-embedded text will not be extracted');
      parsedCorrectly = false;
    }

    if (layout.contactInHeaderFooter && ['Workday', 'Taleo'].includes(ats.name)) {
      issues.push('Contact info in header/footer may be dropped');
      parsedCorrectly = false;
    }

    if (!sections.experience) {
      issues.push('Missing standard "Experience" section header');
      parsedCorrectly = false;
    }

    return {
      ats: ats.name,
      type: ats.type,
      parsedCorrectly,
      issues,
      confidence: parsedCorrectly ? 'high' : 'low',
    };
  });

  const passCount = results.filter(r => r.parsedCorrectly).length;

  return {
    summary: `${passCount} of ${results.length} simulated ATS systems parsed this resume correctly.`,
    results,
    disclaimer: 'Heuristic simulation based on documented parser failure modes, not a direct connection to proprietary ATS internal engines.',
    recommendation: passCount < results.length
      ? 'Fix the flagged issues to ensure your resume works across all major ATS platforms.'
      : 'Your resume format is compatible with all tested ATS platforms.',
  };
}
