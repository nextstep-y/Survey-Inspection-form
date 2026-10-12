#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const driveRoot = '/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/SURVEY CP-N03 SHARE DRIVE';
const sources = [
  { type: 'Pier Column', folder: path.join(driveRoot, 'Pier Column'), textFolder: path.join(root, 'tmp', 'pdfs', 'pier-column-text'), folderUrl: '' },
  { type: 'Pier Head', folder: path.join(driveRoot, 'PIER HEAD CONCRETE DETAILS'), textFolder: path.join(root, 'tmp', 'pdfs'), folderUrl: 'https://drive.google.com/drive/folders/18eHxPrMB3LNbEgwqOo1dRRkWbwd86DcP' },
];

function readJsonConst(name) {
  const marker = `const ${name} = `;
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${name}`);
  const jsonStart = start + marker.length;
  const end = html.indexOf(';', jsonStart);
  return JSON.parse(html.slice(jsonStart, end));
}

const piers = readJsonConst('PIERS_RAW');
const pierIds = Object.keys(piers).filter(id => /^P-\d{3,4}(?:NB|SB|L|R)?$/.test(id)).sort((a, b) => b.length - a.length);

function parseFilename(filename) {
  return {
    drawingNo: filename.match(/ST-(\d{6})/)?.[1] || '',
    revision: filename.match(/(?:-|\sRev)([A-Z])\.pdf$/i)?.[1]?.toUpperCase() || '0',
  };
}

function mappedPiers(text) {
  const titleMatches = [...text.matchAll(/(?:FOR|HEAD)\s*\(?\s*(P-\d{3,4}(?:NB|SB|L|R)?)(?:\s*[,/&-]\s*(?:P-)?(\d{3,4}(?:NB|SB|L|R)?))?/gi)];
  const explicit = new Set();
  for (const match of titleMatches) {
    const first = match[1].toUpperCase();
    if (piers[first]) explicit.add(first);
    if (match[2]) {
      const second = `P-${match[2].toUpperCase()}`;
      if (piers[second]) explicit.add(second);
    }
  }
  if (explicit.size) return [...explicit];
  const counts = [];
  for (const id of pierIds) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const count = [...text.matchAll(new RegExp(`\\b${escaped}\\b`, 'g'))].length;
    if (count) counts.push({ id, count });
  }
  if (!counts.length) return [];
  if (counts.length === 1) return [counts[0].id];
  const max = Math.max(...counts.map(item => item.count));
  return counts.filter(item => item.count === max && item.count >= 2).map(item => item.id);
}

function titleFromText(text) {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    .find(line => /PIER HEAD (?:CONCRETE DETAILS|TYPE|BR\d+)/i.test(line)) || '';
}

const rows = [];
for (const source of sources) {
  const files = fs.readdirSync(source.folder).filter(name => name.toLowerCase().endsWith('.pdf')).sort();
  for (const filename of files) {
    const pdfPath = path.join(source.folder, filename);
    const textPath = path.join(source.textFolder, filename.replace(/\.pdf$/i, '.txt'));
    const text = fs.existsSync(textPath) ? fs.readFileSync(textPath, 'utf8') : '';
    const { drawingNo, revision } = parseFilename(filename);
    const reviewed = drawingNo === '023170' || drawingNo === '022045';
    rows.push([
      source.type,
      mappedPiers(text).join(', '),
      drawingNo,
      revision,
      filename,
      source.type === 'Pier Column' ? 'Pier Column' : 'PIER HEAD CONCRETE DETAILS',
      source.folderUrl,
      fs.statSync(pdfPath).mtime.toISOString(),
      reviewed ? 'VISUALLY REVIEWED' : (text ? 'TEXT EXTRACTED - VISUAL REVIEW PENDING' : 'TEXT EXTRACTION REQUIRED'),
      reviewed ? 'Reviewed against application on 2026-10-12' : titleFromText(text),
    ]);
  }
}

const headers = ['Drawing Type', 'Pier(s)', 'Drawing No.', 'Revision', 'Filename', 'Source Folder', 'Folder Link', 'File Modified', 'Review Status', 'Notes'];
const summary = {
  generatedAt: new Date().toISOString(),
  columnDrawings: rows.filter(row => row[0] === 'Pier Column').length,
  pierHeadDrawings: rows.filter(row => row[0] === 'Pier Head').length,
  mapped: rows.filter(row => row[1]).length,
  pendingVisualReview: rows.filter(row => row[8].includes('PENDING')).length,
};

process.stdout.write(JSON.stringify({ headers, rows, summary }));
