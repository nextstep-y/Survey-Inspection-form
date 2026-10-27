// Read-only design audit: never updates survey source data or Sheet values.
const fs=require('fs'),vm=require('vm'),cp=require('child_process');
const html=fs.readFileSync('index.html','utf8'),c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
vm.runInContext(fs.readFileSync('assets/pilecap_ch_os_overrides.js','utf8'),c);
vm.runInContext(html.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const start=html.indexOf('const PIERS_RAW = ');vm.runInContext(html.slice(start,html.indexOf('// STATE',start)),c);
const a=vm.runInContext('({piers:PIERS_RAW,arrays:ARRAYS_RAW,key:WORK_ARRAY_KEY,orient:_orientPierSpecificPoints,elev:getWorkPointElev,control:getDrawingPlinthControl,audit:BEARING_PLINTH_DRAWING_AUDIT})',c);
const inv=JSON.parse(fs.readFileSync('output/all-plinth-audit/inventory.json','utf8'));
const textCache=new Map();
function topEvidence(sources){
 const values=[],files=[];
 for(const s of sources){
  let text=textCache.get(s.file);if(text===undefined){const cache='tmp/pdfs/pier-column-text/'+s.file.replace(/\.pdf$/i,'.txt');try{text=fs.existsSync(cache)?fs.readFileSync(cache,'utf8'):cp.execFileSync('pdftotext',['-layout',s.path,'-'],{encoding:'utf8',maxBuffer:8e6,timeout:5000});}catch(e){text='';files.push(s.file+' [READ UNAVAILABLE]');}textCache.set(s.file,text);}
  const lines=text.split('\n');let found=[];
  for(let i=0;i<lines.length;i++)if(/RL\s*['’]?\s*A\s*['’]?\s*TOP\s+OF\s+PIER/i.test(lines[i]))found.push(...(lines.slice(i,i+5).join('\n').match(/\b\d{2,3}\.\d{3}\b/g)||[]).map(Number));
  found=[...new Set(found)];if(found.length){values.push(...found);files.push(s.file);}
 }
 return {values:[...new Set(values)],files};
}
// Independent rendered drawing controls. Offsets are relative to RL A, not
// inferred from a bounding-box size or from the application's type selector.
function expected(p,label){
 const id=p.id.trim().replace(/[LR]$/,''),family=a.audit.piers[p.id],u=/^U/.test(label);
 if(family==='P1')return {rise:.140,source:'023000-B elevation A/B'};
 if(family==='P2')return {rise:.150,source:'023031-A elevation A/B'};
 if(id==='P-976')return {rise:.112,source:'023211-B elevation A'};
 if(['P-1101','P-1102','P-1103'].includes(id))return {rise:.140,source:{'P-1101':'023220-A','P-1102':'023223-A','P-1103':'023226-A'}[id]+' elevation A'};
 if(['P-977','P-1108'].includes(id)){
  const middle=/^(UL(?:9|10|11|12)|UR[1-4])$/.test(label);
  if(id==='P-1108'&&u&&!middle)return {rise:null,source:'039453-B section 10',issue:'Type2 section has no explicit vertical concrete-plinth dimension; do not infer it from volume or another Pier.'};
  return {rise:!u?.112:middle?.140:.150,source:id==='P-977'?'023214-F / 023215-F / 039356-E / 039357-D':'023229-B / 023230-B / 039451-B / 039452-B'};
 }
 if(id==='P-1120'){const middle=/^(DL(?:9|10|11|12)|DR[1-4])$/.test(label);return {rise:u?.112:middle?.140:null,source:'023232-E / 023233-E / 039356',...(!u&&!middle?{issue:'Confirm the referenced Type2 reinforcement detail revision/applicability before assigning its vertical offset.'}:{})};}
 if(id==='P-1121')return {rise:u?.097:.112,source:u?'039491-D CIS40 section':'039489-C CIS50 section'};
 if(id==='P-1100')return {rise:.140,source:'023181-C elevation A'};
 if(id==='P-1142')return {rise:!u?.140:null,source:'023091-G / 038582-C section 3 and bearing arrangement; N03 D-side only'};
 if(/^P6-/.test(family||'')){const f=a.control(p),g=f.groups.find(g=>new RegExp('^'+g.prefix+'[1-4]$').test(label));return {rise:g?.sizeCH>.7?.049:.740,source:'023240-D side schedule + 023241-E elevation A'};}
 const map={
  'P-967':()=>.097,'P-967A':()=>.097,'P-968':()=>.097,
  'P-974':()=>u?.097:.140,'P-975':()=>u?.112:.097,
  'P-1106':()=>u?.097:.140,'P-1107':()=>u?.112:.097,
  'P-1122':()=>u?.140:.097,'P-991':()=>u?.140:.097,'P-969':()=>u?.140:.097
 };
 if(map[id])return {rise:map[id](),source:(a.control(p)?.plan||'')+'-'+a.control(p)?.rev+' elevation A'};
 if(id==='P-990')return {rise:u?.097:.112,source:'023077-B plan and elevation A; increasing arrow points UP, CIS40 U / CIS50 D'};
 if(id==='P-966')return {rise:null,source:'023098-B / 038725-B',issue:'Special CIS40/CIS70/Type1 base heights; individual detail needed, generic family height is unsafe.'};
 return {rise:null,source:a.control(p)?.plan||'',issue:'No new rendered level verification in this audit; prior individual controls or unresolved source retained.'};
}
const schedule={'P-992':89.905,'P-993':90.372,'P-1021':100.645,'P-1022':100.751,'P-1130':115.780,'P-1131':115.560};
const records=[];
for(const r of inv){
 const p=Object.values(a.piers).find(p=>p.id===r.id),base=p.id.trim().replace(/[LR]$/,'');
 let sources=r.sources.length?r.sources:(inv.find(x=>x.id.trim()===base)?.sources||[]);
 if(base==='P-1120')sources=[{file:'NSCR-ITD-N03-ZWD-DWG-ST-022382-B.pdf',path:'/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/ITD CP N03 TEAM DRIVE/SUBSTRUCTURE/P-1120/D/PDF/NSCR-ITD-N03-ZWD-DWG-ST-022382-B.pdf'}];
 const ev=topEvidence(sources);
 if(schedule[base]!==undefined){ev.scheduleValue=schedule[base];ev.scheduleSource='023240-D dated 04-Jun-2026';}
 const top=Number.isFinite(p.topPier)?p.topPier:null,topStatus=top===null?'MISSING_APP_TOP':ev.scheduleValue!==undefined?(Math.abs(ev.scheduleValue-top)<.0005?'SCHEDULE_MATCH':'SCHEDULE_CONFLICT'):ev.values.length===1?(Math.abs(ev.values[0]-top)<.0005?'COLUMN_TEXT_MATCH':'COLUMN_TEXT_CONFLICT'):'UNRESOLVED';
 const ps=a.orient(p,'Bearing Plinths',a.arrays[a.key['Bearing Plinths'](p)]||[],false),groups=[];
 for(const q of ps){const m=q.label.match(/^(.+?)(\d+)$/);if(!m||(+m[2]-1)%4)continue;
  const e=expected(p,q.label),z=a.elev(p,'Bearing Plinths',q.label),rise=Number.isFinite(z)?+(z-top).toFixed(6):null;
  const drawingTop=ev.scheduleValue??(ev.values.length===1?ev.values[0]:null);
  groups.push({pointGroup:m[1]+m[2]+'-'+(+m[2]+3),appRise:rise,expectedRise:e.rise,appZ:z,expectedZ:e.rise!==null&&drawingTop!==null?+(drawingTop+e.rise).toFixed(6):null,status:e.rise===null?'UNRESOLVED':Math.abs(rise-e.rise)<1e-6?'OFFSET_MATCH':'OFFSET_CONFLICT',source:e.source,issue:e.issue});
 }
 records.push({id:p.id,topPier:top,topStatus,topEvidence:ev,groups});
}
fs.mkdirSync('output/bearing-level-audit',{recursive:true});fs.writeFileSync('output/bearing-level-audit/embedded.json',JSON.stringify(records,null,2));
const counts={records:records.length,topStatus:{},offsetStatus:{}};for(const r of records){counts.topStatus[r.topStatus]=(counts.topStatus[r.topStatus]||0)+1;for(const g of r.groups)counts.offsetStatus[g.status]=(counts.offsetStatus[g.status]||0)+1;}
const rows=records.flatMap(r=>r.groups.length?r.groups.map(g=>`| ${r.id} | ${r.topPier===null?'-':r.topPier.toFixed(3)} | ${r.topStatus} | ${g.pointGroup} | ${g.appRise===null?'-':g.appRise.toFixed(3)} | ${g.expectedRise===null?'-':g.expectedRise.toFixed(3)} | ${g.status} | ${g.source}; ${g.issue||''} |`):[`| ${r.id} | ${r.topPier===null?'-':r.topPier.toFixed(3)} | ${r.topStatus} | - | - | - | UNRESOLVED | No usable Bearing Plinth points |`]);
fs.writeFileSync('docs/bearing-plinth-level-audit.md',`# Bearing Plinth level audit - 2026-10-27\n\nRead-only checker of the current locally corrected application. No Sheets or GitHub publication changed by this checker.\n\nScope: all ${records.length} application Pier records from P-826 through P-1142, including L/R and legacy aliases. Offset comparisons are independent rendered-drawing transcriptions against the embedded TYPE1 startup path. A different selector or live Sheet can change unconfirmed values.\n\nA matching offset does NOT certify the absolute level. COLUMN_TEXT_MATCH is extraction evidence only, not page-by-page visual certification. Ambiguous/missing RL A text stays unresolved. P6 uses the newer rendered schedule 023240-D. Existing BR/Pot controls are not automatically declared reverified.\n\nSummary:\n\n\`\`\`json\n${JSON.stringify(counts,null,2)}\n\`\`\`\n\nCorrection to the historical audit: P-990's increasing-chainage arrow points UP in 023077-B. Its footprints need no reversal; CIS40 U is +0.097 and CIS50 D is +0.112 m. P-1142 N03 D-side is +0.140 from RL A per 038582-C, not +0.140 from headstock. P-966 individual heights and P-1108/P-1120 Type2 remain unresolved. See special-bearing-levels-20261027.md for implementation and requested evidence.\n\n| Pier | App Top Pier m | Top evidence | Group | App offset m | Drawing offset m | Offset status | Source / limit |\n|---|---:|---|---|---:|---:|---|---|\n${rows.join('\n')}\n`);
console.log(JSON.stringify(counts));
