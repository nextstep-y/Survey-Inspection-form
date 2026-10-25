const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let type='TYPE1';const c=vm.createContext({window:{},document:{getElementById:()=>({value:type})}});
vm.runInContext(fs.readFileSync(path.join(root,'assets/pilecap_ch_os_overrides.js'),'utf8'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const start=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(start,h.indexOf('// STATE',start)),c);
for(const f of ['structural-blender-geometry','elastomeric-blender-geometry'])vm.runInContext(fs.readFileSync(path.join(root,'assets/'+f+'.js'),'utf8'),c);
const api=vm.runInContext('({piers:PIERS_RAW,build:window.ElastomericBlender.build,top:getTopOfColumnElevation})',c);
const templates={},records={},skipped=[];
const variants=JSON.parse(fs.readFileSync(path.join(root,'assets/structural-blender-variants.json'),'utf8'));
for(const p of Object.values(api.piers))for(type of ['TYPE1','TYPE2']){
 const g=api.build(p);if(!g){skipped.push({pier:p.id,type,reason:'Missing or ambiguous pad / supporting plinth geometry or levels'});continue;}
 const save=g=>{const id=crypto.createHash('sha256').update(JSON.stringify(g)).digest('hex').slice(0,16);templates[id]=g;return id;};
 const r=records[p.id+'|'+type]={template:save(g),topPier:api.top(p)};
 for(const v of variants.filter(v=>v.pier===p.id&&v.work==='Pier Head')){
  const input=v.points.map(q=>({label:q.label,ch:q.ch,os:q.os,z:api.top(p)+q.rise}));
  const alternative=api.build(p,undefined,input);if(alternative)(r.variants??=[]).push(save(alternative));
 }
}
const out=path.join(root,'output/elastomeric-blender-batch');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'source.json'),JSON.stringify({templates,records,skipped},null,2));
const rows=Object.values(api.piers).map(p=>{
 const r=records[p.id+'|TYPE1'],g=r&&templates[r.template];
 return '| '+p.id+' | '+(!g?'Not prepared - insufficient source geometry':g.supportMissing?'PARTIAL - supporting plinth footprint missing or inconsistent; omitted':g.islands.missing?'PARTIAL - Island geometry incomplete':'Prepared - contextual head profile remains PARTIAL')+' |';
});
if(!process.env.EXPORT_SKIP_COVERAGE)fs.writeFileSync(path.join(root,'docs/elastomeric-blender-coverage.md'),[
 '# Elastomeric Blender coverage - 2026-10-18','',
 '366 pier records, 732 pier/type combinations, 84 distinct templates. Coverage means available review models, not drawing certification. Includes P-1091 and P-1142. The 18 unprepared records retain calculated Canvas fallback where possible; no fabricated survey coordinates are added.','',
 'Pad plan corners and levels come from the existing canonical app data. Concrete plinth footprints retain the earlier 30 mm expansion on every edge; elastomeric pad footprints are not enlarged. Offline pad top is exactly 0.067 m above the corresponding plinth level. Live reference changes invalidate a static image and fall back to the calculated view. A legacy Sheet reference of Top of Pier with thickness 0.067 m is interpreted as the confirmed increment above plinth; the Sheet itself is not edited. P-1091 retains its drawing-controlled elevation protection.','',
 'Grey head underside and shortened column are contextual review envelopes; blue Island surfaces are included only where the existing geometry validates. For nine records with missing or inconsistent supporting footprints, plinth solids are omitted and the view explicitly says Plinth footprint unresolved. Pad coordinates are not relocated to conceal the discrepancy. BR views depict the app Elastomeric work only, not a certified Pot Bearing assembly. White background, dark labels, leader rails, and an increasing-chainage arrow use the same print proportions as Bearing Plinths. Dense point tables retain continuation pages; rows are never dropped to force a single sheet.','',
 '| Pier | Status |','|---|---|',...rows,''].join('\n'));
console.log(JSON.stringify({piers:new Set(Object.keys(records).map(k=>k.split('|')[0])).size,records:Object.keys(records).length,templates:Object.keys(templates).length,skipped:skipped.length}));
