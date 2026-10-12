// Clark Station Grade Level: first audited bay X01-X02 / Y01-Y02.
// B100/W25 boundaries are transformed from Revit INSERT geometry in the DXF.
// F1A/FG markers identify PDF locations only; they are not approved boundaries.
window.CLARK_GRADE_X01_X02_POINTS = [
  ...[
    ['B100-Y01-H-X01-X02', 'B100', 'DXF handle 70A9', [[454936.1839,1678156.9195],[454937.3443,1678148.7899],[454937.4647,1678148.8244],[454937.8296,1678148.9288],[454937.6336,1678150.3015],[454936.6886,1678156.9219]]],
    ['B100-Y01-V-X01', 'B100', 'DXF handle 7134', [[454937.6336,1678150.3015],[454937.7043,1678149.8066],[454939.5956,1678150.0765],[454939.5922,1678150.5811]]],
    ['W25-Y02-X01-X02', 'W25', 'DXF handle 91B3', [[454919.9140,1678154.6360],[454921.5421,1678146.7267],[454921.7896,1678146.7620],[454920.1615,1678154.6714]]],
    ['W25-Y02-RETURN-X01', 'W25A', 'DXF handle 91F7', [[454920.7654,1678146.6158],[454920.9781,1678145.1259],[454921.0133,1678144.8795],[454921.2608,1678144.9148],[454922.6863,1678145.1183],[454922.9338,1678145.1536],[454922.6859,1678146.8900],[454921.5421,1678146.7267]]],
    ['W25-Y01-X01-X02', 'W25', 'DXF handle 9231', [[454939.2557,1678157.3970],[454940.5632,1678149.4419],[454940.8107,1678149.4772],[454939.5032,1678157.4323]]],
    ['W25-Y01-RETURN-X01', 'W25', 'DXF handle 927C', [[454939.7470,1678149.3254],[454939.9948,1678147.5890],[454940.2423,1678147.6243],[454941.9154,1678147.8631],[454941.8781,1678148.1241],[454941.8537,1678148.2955],[454941.8512,1678148.3128],[454941.6675,1678149.5995],[454940.8107,1678149.4772]]],
  ].flatMap(([element, type, source, points]) => points.map(([e,n], index) => ({
    element, group: type.startsWith('B100') ? 'Beam' : 'W25 / Wall', type,
    grid: 'X01-X02 / Y01-Y02', pt: `${element}-P${String(index + 1).padStart(2,'0')}`,
    label: `P${String(index + 1).padStart(2,'0')}`, e, n, z: null, edge: 'DXF_BOUNDARY',
    sourceStatus: 'DXF_GEOMETRY_PDF_TYPE_MATCHED_PARTIAL', source,
    dwg: 'NSCR-GCR-N03-CRKSTN-DRC-ST-000033 / Clark Staion Grade Level.dxf', rev: 'PDF Rev.A / DXF review',
    reviewIssue: 'Plan boundary matched; design elevation not yet confirmed',
  }))),
  ...[
    ['F1A-X01-Y02','F1A','X01 / Y02',454919.5433,1678145.4616],
    ['F1A-X02-Y02','F1A','X02 / Y02',454918.1301,1678155.3612],
    ['F1A-X01-Y01','F1A','X01 / Y01',454939.9710,1678148.3775],
    ['F1A-X02-Y01','F1A','X02 / Y01',454938.5578,1678158.2772],
  ].map(([element,type,grid,e,n]) => ({
    element, group:'Foundation (Reference)', type, grid, pt:`${element}-GRID`, label:'GRID', e, n, z:null,
    edge:'GRID_REFERENCE_ONLY', sourceStatus:'PDF_LABEL_DXF_GRID_MARKER_PARTIAL',
    source:'PDF 004095 Rev.A + DXF grid intersection', dwg:'NSCR-ITD-N03-CRKSTN-DWG-ST-004095', rev:'A',
    reviewIssue:'F1A location matched; footing boundary is not present as an identifiable DXF block',
  })),
  ...[
    ['FG2-Y02','FG2','X01-X02 / Y02',[[454919.5433,1678145.4616],[454918.1301,1678155.3612]]],
    ['FG2-Y01','FG2','X01-X02 / Y01',[[454939.9710,1678148.3775],[454938.5578,1678158.2772]]],
    ['FG11-X01','FG11','X01 / Y01-Y02',[[454919.5433,1678145.4616],[454939.9710,1678148.3775]]],
    ['FG13-X02','FG13','X02 / Y01-Y02',[[454918.1301,1678155.3612],[454938.5578,1678158.2772]]],
  ].flatMap(([element,type,grid,points]) => points.map(([e,n],index) => ({
    element, group:'Foundation Girder', type, grid, pt:`${element}-AXIS-${index + 1}`,
    label:`AXIS-${index + 1}`, e, n, z:type === 'FG11' ? 106.30 : null, edge:'GRID_AXIS_REFERENCE_ONLY',
    allowSelection:type === 'FG11', scheduleAmm:type === 'FG11' ? 2200 : null,
    scheduleBmm:type === 'FG11' ? 1400 : null, scheduleDmm:type === 'FG11' ? 3000 : null,
    scheduleSource:type === 'FG11' ? 'NSCR-ITD-N03-CRKSTN-DWG-ST-004098 Rev.A' : null,
    sourceStatus:'PDF_LABEL_DXF_GRID_MARKER_PARTIAL', source:'PDF 004095 Rev.A + DXF grid axes',
    dwg:'NSCR-ITD-N03-CRKSTN-DWG-ST-004095', rev:'A',
    reviewIssue:'Girder type/location matched; real faces must be confirmed before setting-out coordinates',
  }))),
];

if (Array.isArray(window.CLARK_WORK_GROUPS) && !window.CLARK_WORK_GROUPS.includes('Foundation Girder')) {
  window.CLARK_WORK_GROUPS.push('Foundation Girder');
}
