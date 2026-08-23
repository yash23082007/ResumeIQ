/**
 * Unified Resume Parser — PDF, DOCX, TXT
 *
 * Extracts raw text and structured data (sections, layout metadata)
 * from uploaded resume files.
 */

import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { extractSections } from './sectionExtractor.js';

/**
 * Parse a resume file into raw text + structured JSON.
 * @param {string} filePath - Absolute path to the uploaded file
 * @param {string} originalName - Original filename for extension detection
 * @returns {{ rawText: string, structured: object }}
 */
export async function parseResume(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  let rawText = '';
  let layoutMeta = {};

  switch (ext) {
    case '.pdf':
      ({ rawText, layoutMeta } = await parsePdf(filePath));
      break;
    case '.docx':
    case '.doc':
      ({ rawText, layoutMeta } = await parseDocx(filePath));
      break;
    case '.txt':
      rawText = fs.readFileSync(filePath, 'utf-8');
      layoutMeta = { format: 'txt', hasColumns: false, hasImages: false };
      break;
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }

  // Extract structured sections from raw text
  const sections = extractSections(rawText);

  return {
    rawText,
    structured: {
      sections,
      layout: layoutMeta,
      wordCount: rawText.split(/\s+/).filter(Boolean).length,
      lineCount: rawText.split('\n').length,
    },
  };
}

/**
 * Parse PDF using pdf-parse — extracts text and basic layout hints
 */
async function parsePdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  // Analyze layout from text patterns
  const lines = data.text.split('\n');
  const shortLineRatio = lines.filter(l => l.trim().length > 0 && l.trim().length < 30).length / Math.max(lines.length, 1);

  const layoutMeta = {
    format: 'pdf',
    pageCount: data.numpages,
    hasColumns: shortLineRatio > 0.5, // Heuristic: many short lines suggests columns
    hasImages: data.text.length < 100 && data.numpages > 0, // Very little text = probably images
    contactInHeaderFooter: detectHeaderFooterContact(lines),
    hasNonStandardFonts: false, // pdf-parse doesn't expose font info; conservative default
    hasMultiColumnTables: detectTablePatterns(data.text),
  };

  return { rawText: data.text, layoutMeta };
}

/**
 * Parse DOCX using mammoth — extracts text and structural info
 */
async function parseDocx(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  const htmlResult = await mammoth.convertToHtml({ buffer });

  // Check for tables and columns in the HTML output
  const hasTable = htmlResult.value.includes('<table');
  const hasColumns = htmlResult.value.includes('column') || htmlResult.value.includes('col-');

  const layoutMeta = {
    format: 'docx',
    hasColumns,
    hasImages: htmlResult.value.includes('<img'),
    hasMultiColumnTables: hasTable,
    contactInHeaderFooter: false, // DOCX header/footer detection is limited
    hasNonStandardFonts: false,
  };

  return { rawText: result.value, layoutMeta };
}

/**
 * Detect if contact info (email, phone) is in the first or last 2 lines (header/footer proxy)
 */
function detectHeaderFooterContact(lines) {
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/;
  const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/;

  const headerLines = lines.slice(0, 3).join(' ');
  const footerLines = lines.slice(-3).join(' ');

  return (emailRegex.test(footerLines) || phoneRegex.test(footerLines)) &&
    !(emailRegex.test(headerLines) || phoneRegex.test(headerLines));
}

/**
 * Detect table-like patterns (tab-separated columns, pipes)
 */
function detectTablePatterns(text) {
  const lines = text.split('\n');
  const tabLines = lines.filter(l => (l.match(/\t/g) || []).length >= 2);
  return tabLines.length > 3;
}
