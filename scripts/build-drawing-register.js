#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const driveRoot = '/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/SURVEY CP-N03 SHARE DRIVE';
const sources = [
  {
    type: 'Pier Column',
    folder: path.join(driveRoot, 'Pier Column'),
    textFolder: path.join(root, 'tmp', 'pdfs', 'pier-column-text'),
    folderUrl: '',
  },
  {
    type: 'Pier Head',
    folder: path.join(driveRoot, 'PIER HEAD CONCRETE DETAILS'),
    textFolder: path.join(root, 'tmp', 'pdfs'),
    folderUrl: 'https://drive.google.com/drive/folders/18eHxPrMB3LNbEgwqOo1dRRkWbwd86DcP',
  },
  {
    type: 'Pier Head Schedule',
    folder: path.join(driveRoot, 'Pier head type'),
    textFolder: path.join(root, 'tmp', 'pdfs', 'pier-head-type-text'),
    folderUrl: 'https://drive.google.com/drive/folders/1nA83W8NGDXXQnRjzoec6HCE4k2DyqJlU',
  },
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
const pierIds = Object.keys(piers)
  .filter(id => /^P-\d{3,4}(?:NB|SB|L|R)?$/.test(id))
  .sort((a, b) => b.length - a.length);

function parseFilename(filename, text = '') {
  const drawingNo = filename.match(/ST-(\d{6})/)?.[1] || '';
  const filenameRevision = filename.match(/(?:-|\sRev)([A-Z])\.pdf$/i)?.[1]?.toUpperCase();
  const titleBlockRevision = drawingNo
    ? text.match(new RegExp(`ST-${drawingNo}-([A-Z])\\b`, 'i'))?.[1]?.toUpperCase()
    : '';
  const revision = filenameRevision || titleBlockRevision || '0';
  return { drawingNo, revision };
}

function mappedPiers(text, sourceType) {
  if (sourceType === 'Pier Head Schedule' && /PIER HEAD[^\n]*SCHEDULE|PIER HEAD SCHEDULE/i.test(text)) {
    return [...new Set(
      [...text.matchAll(/\bP-\d{3,4}(?:NB|SB|L|R)?\b/g)]
        .map(match => match[0].toUpperCase())
        .filter(id => piers[id])
    )];
  }
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
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return lines.find(line => /PIER HEAD (?:CONCRETE DETAILS|TYPE|BR\d+)/i.test(line)) || '';
}

const rows = [];
for (const source of sources) {
  const files = fs.readdirSync(source.folder).filter(name => name.toLowerCase().endsWith('.pdf')).sort();
  for (const filename of files) {
    const pdfPath = path.join(source.folder, filename);
    const textPath = path.join(source.textFolder, filename.replace(/\.pdf$/i, '.txt'));
    const text = fs.existsSync(textPath) ? fs.readFileSync(textPath, 'utf8') : '';
    const stat = fs.statSync(pdfPath);
    const { drawingNo, revision } = parseFilename(filename, text);
    const mapped = mappedPiers(text, source.type);
    const reviewed = ['023170', '022045', '022998', '023030', '023076', '023216', '023240'].includes(drawingNo);
    rows.push([
      source.type,
      mapped.join(', '),
      drawingNo,
      revision,
      filename,
      source.type === 'Pier Column'
        ? 'Pier Column'
        : (source.type === 'Pier Head Schedule' ? 'Pier head type' : 'PIER HEAD CONCRETE DETAILS'),
      source.folderUrl,
      stat.mtime.toISOString(),
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
  pierHeadScheduleDrawings: rows.filter(row => row[0] === 'Pier Head Schedule').length,
  mapped: rows.filter(row => row[1]).length,
  pendingVisualReview: rows.filter(row => row[8].includes('PENDING')).length,
};

process.stdout.write(JSON.stringify({ headers, rows, summary }));
