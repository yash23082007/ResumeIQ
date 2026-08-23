/**
 * Attention Heatmap Simulation (Algorithm 7.5)
 *
 * Approximates a recruiter's ~6-second F-pattern scan.
 * Generates heatmap cells from resume section positions.
 */

/**
 * Build heatmap data from parsed resume structure.
 * @param {object} parsedJson - Parsed resume with sections and line counts
 * @returns {{ cells: Array<{ section: string, position: number, attention: number, label: string }>, insights: string[] }}
 */
export function buildHeatmap(parsedJson) {
  if (!parsedJson) {
    return { cells: [], insights: ['Unable to generate heatmap — resume could not be parsed.'] };
  }

  const sections = parsedJson.sections || {};
  const totalLines = parsedJson.lineCount || 100;
  const cells = [];
  const insights = [];

  // Section importance for F-pattern attention model
  const sectionWeights = {
    contact: 0.7,   // Name/contact gets a quick glance
    header: 0.8,    // Top of resume — high attention
    summary: 0.95,  // Summary/objective — highest attention zone
    experience: 0.85, // Experience — high, but decays down the page
    skills: 0.7,
    education: 0.5,
    certifications: 0.4,
    projects: 0.45,
    awards: 0.35,
    volunteer: 0.3,
    publications: 0.3,
    languages: 0.25,
    interests: 0.2,
    references: 0.15,
  };

  for (const [name, section] of Object.entries(sections)) {
    if (!section.startLine && section.startLine !== 0) continue;

    // Vertical position factor: attention decays from top to bottom
    const verticalPos = section.startLine / Math.max(totalLines, 1);
    const verticalWeight = 1 - (verticalPos * 0.6); // Top=1.0, Bottom=0.4

    // Section-type factor
    const sectionWeight = sectionWeights[name] || 0.3;

    // Combined attention score
    const attention = Math.round(clamp(verticalWeight * sectionWeight, 0, 1) * 100) / 100;

    cells.push({
      section: name,
      heading: section.heading || name,
      position: verticalPos,
      startLine: section.startLine,
      endLine: section.endLine,
      attention,
      contentLength: section.content?.length || 0,
    });
  }

  // Sort by position (top to bottom)
  cells.sort((a, b) => a.position - b.position);

  // Generate insights
  const highAttention = cells.filter(c => c.attention > 0.7);
  const lowAttention = cells.filter(c => c.attention < 0.3);

  if (highAttention.length > 0) {
    insights.push(`Your strongest visibility zones: ${highAttention.map(c => c.heading).join(', ')}. Make sure your best content is here.`);
  }

  if (sections.summary && sections.summary.startLine > 5) {
    insights.push('Your summary/profile section is not at the top — consider moving it up for maximum recruiter attention.');
  }

  if (!sections.summary) {
    insights.push('No summary/profile section detected. Adding one at the top significantly increases recruiter engagement in the first 6 seconds.');
  }

  if (sections.experience) {
    const expLines = (sections.experience.endLine || 0) - (sections.experience.startLine || 0);
    if (expLines < 10) {
      insights.push('Your experience section is short. Recruiters spend the most time here — expand with specific achievements.');
    }
  }

  if (lowAttention.length > 0) {
    insights.push(`Low-visibility zones: ${lowAttention.map(c => c.heading).join(', ')}. If these contain important info, move them higher.`);
  }

  return { cells, insights };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
