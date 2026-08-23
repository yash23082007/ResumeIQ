/**
 * Section Extractor — Segments resume text into canonical sections
 *
 * Detects headings via known patterns and separates content into:
 * contact, summary, experience, education, skills, certifications, projects, other
 */

// Common resume section header patterns (case-insensitive)
const SECTION_PATTERNS = {
  contact: /^(contact\s*(info(rmation)?)?|personal\s*(info(rmation)?|details)?)/i,
  summary: /^(summary|profile|objective|about(\s+me)?|professional\s+summary|career\s+summary|overview)/i,
  experience: /^(experience|work\s*(experience|history)|employment(\s+history)?|professional\s+experience|career\s+history)/i,
  education: /^(education|academic|qualifications|degrees?|schooling)/i,
  skills: /^(skills|technical\s+skills|core\s+competencies|competencies|technologies|tech\s+stack|tools)/i,
  certifications: /^(certifications?|licenses?|accreditations?|credentials)/i,
  projects: /^(projects|portfolio|personal\s+projects|key\s+projects)/i,
  awards: /^(awards?|honors?|achievements?|accomplishments?|recognition)/i,
  publications: /^(publications?|papers?|research)/i,
  volunteer: /^(volunteer(ing)?|community\s+service|extracurricular)/i,
  languages: /^(languages?|language\s+skills)/i,
  interests: /^(interests?|hobbies)/i,
  references: /^(references?)/i,
};

/**
 * Extract structured sections from raw resume text.
 * @param {string} rawText
 * @returns {object} Map of section name → { heading, content, bullets, startLine, endLine }
 */
export function extractSections(rawText) {
  const lines = rawText.split('\n');
  const sections = {};
  let currentSection = 'header';
  let currentContent = [];
  let currentHeading = '';
  let sectionStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      currentContent.push(line);
      continue;
    }

    // Check if this line is a section header
    const detectedSection = detectSectionHeader(trimmed);

    if (detectedSection) {
      // Save previous section
      if (currentContent.length > 0 || currentSection === 'header') {
        saveSection(sections, currentSection, currentHeading, currentContent, sectionStartLine, i - 1);
      }

      currentSection = detectedSection;
      currentHeading = trimmed;
      currentContent = [];
      sectionStartLine = i;
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    saveSection(sections, currentSection, currentHeading, currentContent, sectionStartLine, lines.length - 1);
  }

  // Extract contact info from header section
  if (sections.header) {
    sections.contact = {
      ...extractContactInfo(sections.header.content),
      startLine: sections.header.startLine,
      endLine: sections.header.endLine,
    };
  }

  return sections;
}

/**
 * Detect if a line is a section header.
 * Heuristics: matches known patterns, is short, may be ALL CAPS or title-cased.
 */
function detectSectionHeader(line) {
  // Clean common markers
  const cleaned = line
    .replace(/^[─━═\-_*#|:]+\s*/, '')  // Strip decorative prefixes
    .replace(/\s*[─━═\-_*#|:]+$/, '')  // Strip decorative suffixes
    .replace(/^\d+\.\s*/, '')           // Strip numbered prefixes
    .trim();

  if (!cleaned || cleaned.length > 60) return null;

  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(cleaned)) {
      return section;
    }
  }

  // Heuristic: short ALL-CAPS line that isn't a bullet
  if (cleaned.length < 40 && cleaned === cleaned.toUpperCase() && !/^[•●■◆▪→\-*]/.test(cleaned)) {
    // Try to match it as a section
    const lower = cleaned.toLowerCase();
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(lower)) {
        return section;
      }
    }
  }

  return null;
}

/**
 * Save a section to the sections map, extracting bullets.
 */
function saveSection(sections, name, heading, contentLines, startLine, endLine) {
  const content = contentLines.join('\n').trim();
  const bullets = extractBullets(contentLines);

  sections[name] = {
    heading: heading || name,
    content,
    bullets,
    startLine,
    endLine,
  };
}

/**
 * Extract bullet points from content lines.
 */
function extractBullets(lines) {
  const bulletRegex = /^\s*[•●■◆▪→\-*]\s+(.+)/;
  const bullets = [];

  for (const line of lines) {
    const match = line.match(bulletRegex);
    if (match) {
      bullets.push(match[1].trim());
    }
  }

  return bullets;
}

/**
 * Extract contact info from header text.
 */
function extractContactInfo(text) {
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
  const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/g;
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/gi;
  const githubRegex = /github\.com\/[\w-]+/gi;
  const urlRegex = /https?:\/\/[^\s,]+/gi;

  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  const linkedin = text.match(linkedinRegex) || [];
  const github = text.match(githubRegex) || [];
  const urls = text.match(urlRegex) || [];

  // Extract name (usually first non-empty line)
  const firstLine = text.split('\n').find(l => l.trim() && !l.match(/[@()\d+\-.]/) && l.trim().length < 60);

  return {
    name: firstLine?.trim() || null,
    emails,
    phones: phones.map(p => p.trim()),
    linkedin,
    github,
    urls: urls.filter(u => !u.includes('linkedin') && !u.includes('github')),
  };
}
