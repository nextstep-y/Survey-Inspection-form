// Reproducible footprint-only audit. Does not certify elevations or unresolved identities.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const h=fs.readFileSync('index.html','utf8'),c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
vm.runInContext(fs.readFileSync('assets/pilecap_ch_os_overrides.js','utf8'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const s=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(s,h.indexOf('// STATE',s)),c);
const a=vm.runInContext('({piers:PIERS_RAW,arrays:ARRAYS_RAW,key:WORK_ARRAY_KEY,orient:_orientPierSpecificPoints,expand:expandBearingPlinthEdges,audit:BEARING_PLINTH_DRAWING_AUDIT,control:getDrawingPlinthControl})',c);
const inventory=JSON.parse(fs.readFileSync('output/all-plinth-audit/inventory.json','utf8'));
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-7,`${x} != ${y}`);
let checked=0,points=0;const rows=[];
for(const r of inventory){
 const p=Object.values(a.piers).find(p=>p.id===r.id),family=a.audit.piers[r.id],f=a.control(p);
 if(f){
  const ps=a.orient(p,'Bearing Plinths',a.arrays[a.key['Bearing Plinths'](p)]||[],false);
  assert.equal(ps.length,f.groups.length*4,r.id);assert.equal(new Set(ps.map(q=>q.label)).size,ps.length,r.id+' duplicate labels');
  assert.deepEqual(a.expand(ps),ps,r.id+' expansion repeated');
  assert.deepEqual(a.orient(p,'Bearing Plinths',[{label:'UL1',ch:99,os:99}],true),ps,r.id+' imported bypass');
  for(const g of f.groups){
   const qs=ps.filter(q=>Array.from({length:4},(_,i)=>g.prefix+(g.start+i)).includes(q.label));assert.equal(qs.length,4);
   near(qs.reduce((s,q)=>s+q.ch,0)/4,g.ch);near(qs.reduce((s,q)=>s+q.os,0)/4,g.os);
   near(Math.hypot(qs[1].ch-qs[0].ch,qs[1].os-qs[0].os),g.sizeOS+.06);
   near(Math.hypot(qs[2].ch-qs[1].ch,qs[2].os-qs[1].os),g.sizeCH+.06);
   // Independent family dimensions from controlling plans, not a computed expected polygon.
   if(family==='P1'){near(g.sizeCH,.450);near(g.sizeOS,.550);near(Math.abs(g.ch),.925);near(Math.abs(g.os),1.7);}
   if(family==='P2'){near(g.sizeCH,.400);near(g.sizeOS,.500);near(Math.abs(g.ch),.925);near(Math.abs(g.os),1.2);}
  }
  checked++;points+=ps.length;
  rows.push(`| ${r.id} | Footprint checked | ${family} | ${f.plan} ${f.rev} | ${f.note||'Plan dimensions and centers only'} |`);
 }else{
  const prior=['P-888','P-889','P-890','P-891','P-1091','P-1094'].includes(r.id);
  const reason=prior?'Prior individual control retained; not re-certified in this batch':/1049|1050/.test(r.id)?'Awaiting approved Pier Head plan; user requested skip':r.id==='P-1051'?'Available plan title conflicts with Pier identity':/989/.test(r.id)?'Combined-head origin / L-R coordinate frames and rotated bearings require reconciliation':r.type?.includes('P5')?'Combined-head / split-column reference requires individual review':'Drawing identity or schedule applicability unresolved; legacy values not verified';
  rows.push(`| ${r.id} | ${prior?'Prior control retained':'PENDING - DO NOT USE LEGACY FOOTPRINT'} | ${r.type||'Unclassified'} | ${r.refs.join(', ')||'-'} | ${reason} |`);
 }
}
const report=`# Bearing Plinth footprint audit through P-1142\n\nDate: 2026-10-24. Local changes only; not published.\n\n${inventory.length} application records reviewed (includes suffixed / legacy records). ${checked} records have source-linked footprint controls and ${points} point checks passed. Six additional previously controlled records are retained. ${inventory.length-checked-6} records remain unresolved.\n\nScope: plan sizes, CH/OS centers, bearing-side assignment where confirmed, and one-time +30 mm on each edge. This is NOT certification of elevations, all survey works, or complete construction geometry. P6 elevation differences remain a separate review item. P-1100 Elastomeric support alignment requires review after its eccentric Plinth correction. Pending values are warned in the form; no guessed mapping has been substituted.\n\n3D models are partial contextual views; live geometry guards still apply.\n\n| Pier | Status | Family | Controlling plan / reference | Limitation |\n|---|---|---|---|---|\n${rows.join('\n')}\n`;
fs.writeFileSync('docs/bearing-plinth-audit-through-p1142.md',report.replace('Date: 2026-10-24. Local changes only; not published.','Updated: 2026-10-26. Baseline fcaa006 was published; the P5D combined-head update described here is local and not yet published.'));
console.log(JSON.stringify({records:inventory.length,checked,points,priorControls:6,pending:inventory.length-checked-6}));
