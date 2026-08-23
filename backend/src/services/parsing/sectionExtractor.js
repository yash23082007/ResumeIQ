/**
 * Section Extractor — Segments resume text into canonical sections
 *
 * Detects headings via strict boundary patterns and separates content into:
 * contact, summary, experience, education, skills, certifications, projects, etc.
 */

// Strict resume section header patterns with boundaries and delimiter support
const SECTION_PATTERNS = {
  contact: /^(contact\s*(info(rmation)?)?|personal\s*(info(rmation)?|details)?)\b(:|\s*$)/i,
  summary: /^(summary|profile|professional\s+profile|objective|about(\s+me)?|professional\s+summary|career\s+summary|executive\s+summary|overview)\b(:|\s*$)/i,
  experience: /^(work\s*experience|experience|employment(\s+history)?|work\s+history|professional\s+experience|career\s+history)\b(:|\s*$|\s*[-–—])/i,
  education: /^(education|academic(\s+background|\s+history)?|qualifications|degrees?|schooling)\b(:|\s*$)/i,
  skills: /^(skills|technical\s+skills|core\s+competencies|competencies|technologies|tech\s+stack|tools(\s*(&|\+)\s*technologies)?)\b(:|\s*$)/i,
  certifications: /^(certifications?|licenses?|accreditations?|credentials)\b(:|\s*$)/i,
  projects: /^(projects|personal\s+projects|key\s+projects|portfolio|selected\s+projects)\b(:|\s*$)/i,
  awards: /^(awards?|honors?|achievements?|accomplishments?|recognition)\b(:|\s*$)/i,
  publications: /^(publications?|papers?|research)\b(:|\s*$)/i,
  volunteer: /^(volunteer(ing)?|community\s+service|extracurricular)\b(:|\s*$)/i,
  languages: /^(languages?|language\s+skills)\b(:|\s*$)/i,
  interests: /^(interests?|hobbies)\b(:|\s*$)/i,
  references: /^(references?)\b(:|\s*$)/i,
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

    // Check if this line is a section header (or inline section e.g. "Skills: React, Node")
    const headerDetection = detectSectionHeader(trimmed);

    if (headerDetection) {
      const { section, inlineContent } = headerDetection;

      // Save previous section
      if (currentContent.length > 0 || currentSection === 'header') {
        saveSection(sections, currentSection, currentHeading, currentContent, sectionStartLine, i - 1);
      }

      currentSection = section;
      currentHeading = trimmed;
      currentContent = inlineContent ? [inlineContent] : [];
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
 * Handles both standalone headings ("EXPERIENCE") and inline headings ("Skills: React, Node.js").
 */
function detectSectionHeader(line) {
  // Clean common decorative markers
  const cleaned = line
    .replace(/^[─━═\-_*#|:]+\s*/, '')
    .replace(/\s*[─━═\-_*#|:]+$/, '')
    .replace(/^\d+\.\s*/, '')
    .trim();

  if (!cleaned || cleaned.length > 100) return null;

  // Check if line contains a colon with inline content (e.g. "Skills: JavaScript, TypeScript")
  const colonIdx = cleaned.indexOf(':');
  const headingCandidate = colonIdx !== -1 && colonIdx < 30 ? cleaned.slice(0, colonIdx).trim() : cleaned;
  const inlineContent = colonIdx !== -1 && colonIdx < 30 ? cleaned.slice(colonIdx + 1).trim() : null;

  // Never match long descriptive sentences (like "Experienced software engineer...")
  if (cleaned.split(/\s+/).length > 6 && !colonIdx) return null;

  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(headingCandidate) || pattern.test(cleaned)) {
      return { section, inlineContent };
    }
  }

  // Heuristic: short ALL-CAPS line (<35 chars, ≤3 words) that isn't a bullet
  if (cleaned.length < 35 && cleaned.split(/\s+/).length <= 4 && cleaned === cleaned.toUpperCase() && !/^[•●■◆▪→\-*]/.test(cleaned)) {
    const lower = cleaned.toLowerCase();
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(lower)) {
        return { section, inlineContent: null };
      }
    }
  }

  return null;
}

/**
 * Save a section to the sections map, extracting bullets and appending if section already exists.
 */
function saveSection(sections, name, heading, contentLines, startLine, endLine) {
  const content = contentLines.join('\n').trim();
  const bullets = extractBullets(contentLines);

  if (sections[name] && name !== 'header') {
    // Append to existing section to preserve multiple entries (e.g. multiple experience roles)
    sections[name].content += `\n\n${content}`;
    sections[name].bullets = [...(sections[name].bullets || []), ...bullets];
    sections[name].endLine = endLine;
  } else {
    sections[name] = {
      heading: heading || name,
      content,
      bullets,
      startLine,
      endLine,
    };
  }
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

  // Extract name (first non-empty line without special characters)
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
