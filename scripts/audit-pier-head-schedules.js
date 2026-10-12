#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const textFolder = path.join(root, 'tmp', 'pdfs', 'pier-head-type-text');

function readJsonConst(name) {
  const marker = `const ${name} = `;
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${name}`);
  const jsonStart = start + marker.length;
  const end = html.indexOf(';', jsonStart);
  return JSON.parse(html.slice(jsonStart, end));
}

const piers = readJsonConst('PIERS_RAW');
const columnOverrides = readJsonConst('PIER_COLUMN_DRAWING_OVERRIDES');
for (const [pierId, correction] of Object.entries(columnOverrides)) {
  if (piers[pierId]) Object.assign(piers[pierId], correction);
}
const scheduleOverrides = readJsonConst('PIER_HEAD_SCHEDULE_LEVEL_OVERRIDES');
for (const [pierId, correction] of Object.entries(scheduleOverrides)) {
  if (piers[pierId]) Object.assign(piers[pierId], correction);
}

const scheduleFiles = fs.readdirSync(textFolder)
  .filter(name => name.endsWith('.txt'))
  .map(name => ({ name, text: fs.readFileSync(path.join(textFolder, name), 'utf8') }))
  .filter(file => /PIER HEAD[^\n]*SCHEDULE|PIER HEAD SCHEDULE/i.test(file.text))
  .sort((a, b) => {
    const aGeneral = /ST-02299[5-9]|ST-023030/.test(a.name) ? 0 : 1;
    const bGeneral = /ST-02299[5-9]|ST-023030/.test(b.name) ? 0 : 1;
    return aGeneral - bGeneral || a.name.localeCompare(b.name);
  });

const schedule = new Map();
for (const file of scheduleFiles) {
  const drawingNo = file.name.match(/ST-(\d{6})/)?.[1] || '';
  const filenameRevision = file.name.match(/-([A-Z])\.txt$/)?.[1];
  const titleBlockRevision = drawingNo
    ? file.text.match(new RegExp(`ST-${drawingNo}-([A-Z])\\b`, 'i'))?.[1]?.toUpperCase()
    : '';
  for (const line of file.text.split(/\r?\n/)) {
    const pierId = line.match(/\bP-\d{3,4}(?:NB|SB|L|R)?\b/)?.[0];
    if (!pierId) continue;
    const levels = line.match(/\d{2}\+\d+(?:\.\d+)?\s+(\d+\.\d+)\s+(\d+\.\d+)/);
    if (!levels) continue;
    schedule.set(pierId, {
      pierId,
      railLevel: Number(levels[1]),
      topPier: Number(levels[2]),
      drawingNo,
      revision: filenameRevision || titleBlockRevision || '0',
      filename: file.name.replace(/\.txt$/, '.pdf'),
    });
  }
}

const comparisons = [];
for (const item of schedule.values()) {
  const basePier = piers[item.pierId];
  const baseIsUsable = basePier && basePier.e !== null && basePier.n !== null
    && basePier.e !== '' && basePier.n !== ''
    && Number.isFinite(Number(basePier.e)) && Number.isFinite(Number(basePier.n));
  const splitIds = [`${item.pierId}L`, `${item.pierId}R`].filter(id => piers[id]);
  const targetIds = baseIsUsable ? [item.pierId] : splitIds;
  if (!targetIds.length) {
    comparisons.push({ ...item, appPier: '', appTopPier: null, difference: null, status: 'PIER NOT IN APP' });
    continue;
  }
  for (const targetId of targetIds) {
    const appTopPier = Number(piers[targetId].topPier);
    const difference = Number.isFinite(appTopPier)
      ? Number((appTopPier - item.topPier).toFixed(3))
      : null;
    comparisons.push({
      ...item,
      appPier: targetId,
      appTopPier: Number.isFinite(appTopPier) ? appTopPier : null,
      difference,
      status: difference === null ? 'APP LEVEL MISSING' : (Math.abs(difference) <= 0.0005 ? 'MATCH' : 'MISMATCH'),
    });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  scheduleFiles: scheduleFiles.length,
  schedulePiers: schedule.size,
  comparedRows: comparisons.length,
  matches: comparisons.filter(row => row.status === 'MATCH').length,
  mismatches: comparisons.filter(row => row.status === 'MISMATCH').length,
  missingInApp: comparisons.filter(row => row.status === 'PIER NOT IN APP').length,
  differences: comparisons.filter(row => row.status !== 'MATCH'),
};

process.stdout.write(JSON.stringify(output, null, 2));
