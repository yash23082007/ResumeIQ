/**
 * Unified Resume Parser — PDF, DOCX, TXT
 *
 * Extracts raw text and structured data (sections, layout metadata)
 * with magic-byte validation and proper timer cleanup.
 */

import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { extractSections } from './sectionExtractor.js';

const PARSER_TIMEOUT_MS = 10000; // 10s maximum parsing execution

/**
 * Check file magic bytes to prevent extension spoofing
 */
function validateFileSignature(buffer, ext) {
  if (ext === '.pdf') {
    // PDF must start with %PDF- (0x25 0x50 0x44 0x46)
    const header = buffer.slice(0, 5).toString('ascii');
    if (!header.startsWith('%PDF-')) {
      throw new Error('Invalid PDF file signature. The file appears to be corrupted or renamed.');
    }
  } else if (ext === '.docx') {
    // DOCX is a ZIP package starting with PK (0x50 0x4B 0x03 0x04)
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      throw new Error('Invalid DOCX file signature. Please upload a standard Word (.docx) document.');
    }
  } else if (ext === '.doc') {
    throw new Error('Legacy binary .doc files are not supported. Please save your file as .docx or .pdf.');
  }
}

/**
 * Parse a resume file into raw text + structured JSON.
 * @param {string} filePath - Absolute path to the uploaded file
 * @param {string} originalName - Original filename for extension detection
 * @returns {Promise<{ rawText: string, structured: object }>}
 */
export async function parseResume(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  
  if (!['.pdf', '.docx', '.txt'].includes(ext)) {
    throw new Error(`Unsupported file format: ${ext}. Please upload a PDF, DOCX, or TXT document.`);
  }

  const buffer = fs.readFileSync(filePath);
  if (buffer.length === 0) {
    throw new Error('Uploaded file is empty (0 bytes).');
  }

  validateFileSignature(buffer, ext);

  let timerId = null;

  try {
    const parsePromise = (async () => {
      let rawText = '';
      let layoutMeta = {};

      switch (ext) {
        case '.pdf':
          ({ rawText, layoutMeta } = await parsePdfBuffer(buffer));
          break;
        case '.docx':
          ({ rawText, layoutMeta } = await parseDocxBuffer(buffer));
          break;
        case '.txt':
          rawText = buffer.toString('utf-8');
          layoutMeta = { format: 'txt', hasColumns: false, hasImages: false, hasMultiColumnTables: false };
          break;
      }

      const trimmed = rawText.trim();
      const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
      if (wordCount < 10) {
        throw new Error('Could not extract readable text from document. The file may be image-only, password protected, or empty.');
      }

      // Extract structured sections from raw text
      const sections = extractSections(trimmed);

      return {
        rawText: trimmed,
        structured: {
          sections,
          layout: layoutMeta,
          wordCount,
          lineCount: trimmed.split('\n').length,
        },
      };
    })();

    const timeoutPromise = new Promise((_, reject) => {
      timerId = setTimeout(() => reject(new Error('Document parsing timed out (exceeded 10 seconds).')), PARSER_TIMEOUT_MS);
    });

    return await Promise.race([parsePromise, timeoutPromise]);
  } finally {
    if (timerId) {
      clearTimeout(timerId);
    }
  }
}

/**
 * Parse PDF from buffer
 */
async function parsePdfBuffer(buffer) {
  const data = await pdfParse(buffer);

  const lines = data.text.split('\n');
  const shortLineRatio = lines.filter(l => l.trim().length > 0 && l.trim().length < 30).length / Math.max(lines.length, 1);

  const layoutMeta = {
    format: 'pdf',
    pageCount: data.numpages,
    hasColumns: shortLineRatio > 0.5,
    hasImages: data.text.length < 100 && data.numpages > 0,
    contactInHeaderFooter: detectHeaderFooterContact(lines),
    hasNonStandardFonts: false,
    hasMultiColumnTables: detectTablePatterns(data.text),
  };

  return { rawText: data.text, layoutMeta };
}

/**
 * Parse DOCX from buffer
 */
async function parseDocxBuffer(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  const htmlResult = await mammoth.convertToHtml({ buffer });

  const hasTable = htmlResult.value.includes('<table');
  const hasColumns = htmlResult.value.includes('column') || htmlResult.value.includes('col-');

  const layoutMeta = {
    format: 'docx',
    hasColumns,
    hasImages: htmlResult.value.includes('<img'),
    hasMultiColumnTables: hasTable,
    contactInHeaderFooter: false,
    hasNonStandardFonts: false,
  };

  return { rawText: result.value, layoutMeta };
}

/**
 * Detect if contact info (email, phone) is in header or footer lines
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
