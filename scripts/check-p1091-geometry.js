#!/usr/bin/env node
'use strict';

// Regression controls transcribed from NSCR-ITD-N03-ZWD-DWG-ST-023165-C:
// PLAN B.C. bridge direction is increasing chainage (the large, low pair).
// The viaduct/small pair is down chainage. Do not transfer the SIDE ELEVATION
// page's left/right axes directly to the PLAN.
// T-point identities follow the user's clarified increasing-chainage-up map:
// T7/T1/T6 = low island; T8/T3/T5 = high island.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dataScript = html.match(/<script id="data-script">([\s\S]*?)<\/script>/)?.[1];
assert.ok(dataScript, 'The application data script must exist');
const context = vm.createContext({
  window: {},
  document: { getElementById: () => ({ value: 'TYPE1' }) },
});
vm.runInContext(dataScript, context, { filename: 'index.html:data-script' });
// Load the app's embedded geometry and drawing overrides, stopping before any
// browser startup/state code. The renderer block contains pure Canvas helpers.
const geometryStart = html.indexOf('const PIERS_RAW = ');
const geometryEnd = html.indexOf('// STATE', geometryStart);
assert.ok(geometryStart >= 0 && geometryEnd > geometryStart, 'Embedded geometry block must exist');
vm.runInContext(html.slice(geometryStart, geometryEnd), context, { filename: 'index.html:geometry-data' });
const renderStart = html.indexOf('function drawIncreasingChainageArrow(');
const renderEnd = html.indexOf('function drawPileArray(', renderStart);
assert.ok(renderStart >= 0 && renderEnd > renderStart, 'Structural Canvas helpers must exist');
vm.runInContext(html.slice(renderStart, renderEnd), context, { filename: 'index.html:structural-renderer' });
const api = vm.runInContext(`({
  orient: _orientPierSpecificPoints,
  elevation: getWorkPointElev,
  headLevels: getPierHeadTElevations,
  headDesign: getPierHeadPointDesign,
  formatOffset: formatSurveyOffset,
  geometry: getStructuralCanvasGeometry,
  project: projectStructuralPoint,
  draw3D: drawWorkArray3D,
  piers: PIERS_RAW,
  arrays: ARRAYS_RAW,
  arrayKey: WORK_ARRAY_KEY,
  setRules(rules) { liveBearingElevationRules = rules; }
})`, context);

let checks = 0;
function near(actual, expected, message, tolerance = 1e-9) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}`);
  checks++;
}
function same(actual, expected, message) {
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(expected)), message);
  checks++;
}

const pier = { id: 'P-1091', topPier: 114.793 };
// Keep expected controls independent of the application's layout constant.
const expected = {
  UL: { ch: 0.925, os: -2.400, sizeCH: 0.980, sizeOS: 0.980, level: 114.917 },
  UR: { ch: 0.925, os: 2.400, sizeCH: 1.050, sizeOS: 1.050, level: 114.917 },
  DL: { ch: -0.925, os: -1.700, sizeCH: 0.450, sizeOS: 0.550, level: 115.543 },
  DR: { ch: -0.925, os: 1.700, sizeCH: 0.450, sizeOS: 0.550, level: 115.543 },
};
const expectedElements = {
  UL: [0.880, 0.880], UR: [0.950, 0.950], DL: [0.450, 0.550], DR: [0.450, 0.550],
};

function summary(points) {
  assert.equal(points.length, 4, 'Each bearing must have four corners');
  const ch = points.map(point => point.ch), os = points.map(point => point.os);
  return {
    ch: (Math.min(...ch) + Math.max(...ch)) / 2,
    os: (Math.min(...os) + Math.max(...os)) / 2,
    sizeCH: Math.max(...ch) - Math.min(...ch),
    sizeOS: Math.max(...os) - Math.min(...os),
  };
}

for (const work of ['Bearing Plinths', 'Elastomeric']) {
  const isElement = work === 'Elastomeric';
  const prefix = isElement ? 'E' : '';
  // Deliberately wrong imported centres/sizes prove that the result is not
  // merely a swap of whichever source geometry happened to be loaded.
  const stale = Object.keys(expected).flatMap((group, groupIndex) =>
    [[1, -1], [1, 1], [-1, 1], [-1, -1]].map(([ch, os], index) => ({
      label: `${prefix}${group}${index + 1}`,
      ch: 5 + ch * (groupIndex + 1),
      os: 9 + os * (groupIndex + 2),
    })));
  const before = JSON.stringify(stale);
  const points = api.orient(pier, work, stale, true);
  assert.equal(JSON.stringify(stale), before, `${work}: must not mutate source geometry`);
  same(api.orient(pier, work, points), points, `${work}: repeated orientation is idempotent`);
  same(api.orient(pier, work, []), points, `${work}: controls do not depend on a legacy template`);
  assert.equal(new Set(points.map(point => point.label)).size, 16, `${work}: unique labels`);

  for (const [group, control] of Object.entries(expected)) {
    const corners = points.filter(point => point.label.startsWith(prefix + group));
    const actual = summary(corners);
    near(actual.ch, control.ch, `${work} ${group}: center CH`);
    near(actual.os, control.os, `${work} ${group}: center OS`);
    near(actual.sizeCH, isElement ? expectedElements[group][0] : control.sizeCH, `${work} ${group}: CH dimension`);
    near(actual.sizeOS, isElement ? expectedElements[group][1] : control.sizeOS, `${work} ${group}: OS dimension`);
    for (const point of corners) {
      near(api.elevation(pier, work, point.label), control.level + (isElement ? 0.067 : 0), `${work} ${point.label}: elevation`);
      assert.equal(Math.sign(point.ch), Math.sign(control.ch), `${work} ${point.label}: physical chainage side`);
    }
  }

  // Group by physical location, rather than label prefixes, to catch the old
  // mixed-height row even if future code changes label conventions.
  for (const sign of [1, -1]) {
    const sameSide = points.filter(point => Math.sign(point.ch) === sign);
    assert.equal(sameSide.length, 8, `${work}: two bearings on each physical side`);
    const levels = sameSide.map(point => api.elevation(pier, work, point.label));
    near(Math.max(...levels) - Math.min(...levels), 0, `${work}: equal elevations on physical CH ${sign}`);
  }
}

// A stale Sheet rule must not reintroduce unequal P-1091 side levels.
api.setRules([
  { pier: 'P-1091', work: 'Bearing Plinths', pointGroup: 'UL1-4', height: 9 },
  { pier: 'P-1091', work: 'Elastomeric', pointGroup: '*', height: 8 },
]);
near(api.elevation(pier, 'Bearing Plinths', 'UL1'), 114.917, 'Drawing-controlled plinth level survives stale rule');
near(api.elevation(pier, 'Elastomeric', 'EUL1'), 114.984, 'Elastomeric remains 67 mm above plinth');
api.setRules([]);

const headSource = ['T1','T2','T3','T4','T5','T6','T7','T8','S1','S2']
  .map((label, index) => ({ label, ch: index, os: index / 10 }));
const head = api.orient(pier, 'Pier Head', headSource);
same(api.orient(pier, 'Pier Head', head), head, 'Pier Head orientation is idempotent');
same(head.map(point => point.ch), [1.750,0,-1.750,0,-1.750,1.750,1.750,-1.750,0.925,-0.925], 'Pier Head physical chainage controls');
same(head.map(point => point.os), headSource.map(point => point.os), 'Pier Head orientation preserves offsets');
for (const otherId of ['P-1094', 'P-989', 'P-990']) {
  assert.equal(api.orient({ id: otherId }, 'Bearing Plinths', headSource), headSource, `${otherId}: no geometry override`);
}
near(api.elevation({ id:'P-1094', topPier:116.233 }, 'Bearing Plinths', 'UL1'), 116.983, 'P-1094 retains high increasing-chainage side');
near(api.elevation({ id:'P-1094', topPier:116.233 }, 'Bearing Plinths', 'DL1'), 116.357, 'P-1094 retains low down-chainage side');

same(api.formatOffset(0.9250000000000002), '0.925', 'Offset display removes binary decimal noise');
same(api.formatOffset(2.0125), '2.0125', 'Offset display preserves source half-millimetre precision');
same(api.formatOffset(0.0005), '0.0005', 'Offset display does not discard a half millimetre');
same(api.formatOffset(2), '2', 'Whole offset has no unnecessary decimal places');
same(api.formatOffset(-0), '0', 'Offset display normalizes negative zero');
same(api.formatOffset(null), '—', 'Missing offset stays missing');

const realPier = api.piers['P-1091'];
assert.equal(realPier.id, 'P-1091', 'Real source pier must retain its identifier');
const structural = api.geometry(realPier);
const headLevels = api.headLevels(realPier);
// Independent N/E controls from the CSV the user approved on 2026-10-15.
// Its old Z column is intentionally superseded by the latest level instruction.
const acceptedSurvey = {
  T1:[1677387.736,455096.426,-1.750], T2:[1677389.917,455099.393,0],
  T3:[1677391.202,455095.942,1.750], T4:[1677389.021,455092.975,0],
  T5:[1677391.285,455096.536,1.750], T6:[1677387.819,455097.020,-1.750],
  T7:[1677387.653,455095.832,-1.750], T8:[1677391.119,455095.348,1.750],
  S1:[1677390.385,455096.056,0.925], S2:[1677388.553,455096.312,-0.925],
};
for (const [label,[n,e,ch]] of Object.entries(acceptedSurvey)) {
  const point=structural.points.find(point=>point.label===label);
  const design=api.headDesign(realPier,point);
  near(Number(design.n.toFixed(3)),n,`${label}: form/export Northing matches approved CSV`);
  near(Number(design.e.toFixed(3)),e,`${label}: form/export Easting matches approved CSV`);
  near(design.ch,ch,`${label}: table CH uses survey offset`);
  same(api.headDesign(realPier,{...point,ch:point.ch+10}),design,`${label}: diagram movement cannot alter survey N/E/Z`);
}
for (const label of ['T7','T1','T6']) {
  near(structural.points.find(point=>point.label===label).ch, 1.750, `${label}: low group is increasing-chainage`);
  near(headLevels[label], 115.110, `${label}: low island level = Top of Pier + 0.317m`);
}
for (const label of ['T8','T3','T5']) {
  near(structural.points.find(point=>point.label===label).ch, -1.750, `${label}: high group is down-chainage`);
  near(headLevels[label], 115.710, `${label}: high island level = Top of Pier + 0.600m + 0.317m`);
}
near(headLevels.T8-headLevels.T7, 0.600, 'Opposite island groups differ by the drawn 0.600m step');
for (const label of ['T2','T4']) near(headLevels[label], 115.393, `${label}: joint point retains higher surface level`);
near(structural.maxOS - structural.minOS, 6.480, 'Real P-1091 head transverse dimension');
near(structural.maxCH - structural.minCH, 3.500, 'Real P-1091 head chainage dimension');
near(structural.depth, 2.900, 'Head depth from top cap, actual column height and top pier');
assert.equal(structural.knownDepth, true, 'P-1091 head depth is sourced, not schematic');
const columnCH = structural.column.map(point => point.ch);
const columnOS = structural.column.map(point => point.os);
near(Math.max(...columnCH) - Math.min(...columnCH), 2.000, 'P-1091 column actual CH dimension');
near(Math.max(...columnOS) - Math.min(...columnOS), 3.000, 'P-1091 column actual OS dimension');

const view = { x:450, y:300, scale:60, datum:114.793 };
const projectedOrigin = api.project({ ch:0, os:0 }, view.datum, view);
const projectedUp = api.project({ ch:1, os:0 }, view.datum, view);
near(projectedUp.x, projectedOrigin.x, '+CH has no horizontal screen component');
assert.ok(projectedUp.y < projectedOrigin.y, '+CH must point upward on Canvas');
for (const side of [1, -1]) {
  const elevation = side > 0 ? 114.917 : 115.543;
  const left = api.project({ ch:side * 0.925, os:-2.4 }, elevation, view);
  const right = api.project({ ch:side * 0.925, os:2.4 }, elevation, view);
  near(left.y, right.y, `Equal CH/elevation pair stays horizontally aligned on side ${side}`);
  assert.ok(left.x < right.x, '+OS must point right on Canvas');
}

// A finite-coordinate mock detects runtime/missing-helper failures and broken
// geometry for every supported real pier. It does not replace screenshot QA.
let canvasCalls = 0;
const numericMethods = new Set(['moveTo','lineTo','arc','fillRect','strokeRect','clearRect','translate','rotate','scale']);
const mockCanvas = new Proxy({}, {
  get(target, key) {
    if (key in target) return target[key];
    if (key === 'measureText') return text => ({ width:String(text).length * 10 });
    return (...args) => {
      canvasCalls++;
      if (numericMethods.has(key)) {
        for (const value of args) assert.ok(Number.isFinite(value), `${key} must receive finite Canvas coordinates`);
      }
      if (key === 'fillText') {
        assert.ok(Number.isFinite(args[1]) && Number.isFinite(args[2]), 'Text position must be finite');
      }
    };
  },
});
let geometryCount = 0, renderCount = 0;
for (const [id, sourcePier] of Object.entries(api.piers)) {
  const candidate = { ...sourcePier, id:sourcePier.id || id };
  const geometry = api.geometry(candidate);
  if (!geometry) continue;
  geometryCount++;
  assert.ok(Number.isFinite(geometry.maxCH - geometry.minCH) && geometry.maxCH > geometry.minCH, `${id}: nondegenerate CH span`);
  assert.ok(Number.isFinite(geometry.maxOS - geometry.minOS) && geometry.maxOS > geometry.minOS, `${id}: nondegenerate OS span`);
  assert.ok(Number.isFinite(geometry.depth) && geometry.depth > 0, `${id}: positive finite head depth`);
  for (const work of ['Pier Head', 'Bearing Plinths']) {
    const source = api.arrays[api.arrayKey[work](candidate)] || [];
    const points = api.orient(candidate, work, source);
    if (!points.length) continue;
    assert.equal(api.draw3D(mockCanvas, 900, 600, candidate, work, points), true, `${id} ${work}: renderer completes`);
    renderCount++;
  }
}
assert.ok(geometryCount > 250 && renderCount > 500 && canvasCalls > 10000, 'Exercise the full real-pier set');
console.log(`PASS: ${checks} source controls; ${geometryCount} pier geometries and ${renderCount} Canvas renders with finite coordinates.`);
