const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),h=fs.readFileSync(path.join(root,'index.html'),'utf8');
const c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
vm.runInContext(fs.readFileSync(path.join(root,'assets/pilecap_ch_os_overrides.js'),'utf8'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const start=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(start,h.indexOf('// STATE',start)),c);
vm.runInContext(fs.readFileSync(path.join(root,'assets/structural-blender-geometry.js'),'utf8'),c);
const api=vm.runInContext('({piers:PIERS_RAW,build:window.StructuralBlender.build,top:getTopOfColumnElevation})',c);
const templates={},records={},skipped=[];
for(const pier of Object.values(api.piers))for(const work of ['Pier Head','Pier Column (1st-Lift)','Pile cap']){
 if(pier.id==='P-1091')continue;
 const g=api.build(pier,work),kind=work.startsWith('Pier Column')?'Column':work;
 if(!g){skipped.push({pier:pier.id,work:kind,reason:'missing / incomplete geometry or levels'});continue;}
 const signature=JSON.stringify(g),id=crypto.createHash('sha256').update(signature).digest('hex').slice(0,16);
 templates[id]=g;records[pier.id+'|'+kind]={template:id};
}
for(const variant of JSON.parse(fs.readFileSync(path.join(root,'assets/structural-blender-variants.json'),'utf8'))){
 const pier=api.piers[variant.pier],record=records[variant.pier+'|'+variant.work];
 if(!pier||!record)throw Error('Variant has no baseline record: '+variant.pier);
 const points=variant.points.map(p=>({label:p.label,ch:p.ch,os:p.os,z:api.top(pier)+p.rise}));
 const geometry=api.build(pier,variant.work,points);if(!geometry)throw Error('Invalid variant');
 const id=crypto.createHash('sha256').update(JSON.stringify(geometry)).digest('hex').slice(0,16);
 templates[id]=geometry;(record.variants??=[]).push(id);
}
const output=path.join(root,'output/structural-blender-batch');fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'source.json'),JSON.stringify({templates,records,skipped},null,2));
// Publish an inspectable coverage inventory, including the existing bearing batch.
vm.runInContext(fs.readFileSync(path.join(root,'assets/bearing-blender-manifest.js'),'utf8'),c);
const bearing=c.window.BEARING_BLENDER_MANIFEST;
const counts={'Pier Head':0,Column:0,'Pile cap':0,'Bearing Plinths':0};
const rows=Object.values(api.piers).map(p=>{
 const cells=Object.keys(counts).map(kind=>{
  const record=kind==='Bearing Plinths'?bearing.records[p.id+'|TYPE1']:records[p.id+'|'+kind];
  if(p.id==='P-1091'){counts[kind]++;return 'Blender - detailed prototype';}
  if(!record)return 'Missing source geometry';
  counts[kind]++;
  const missing=kind!=='Bearing Plinths'&&templates[record.template].points.filter(p=>p.z===null).map(p=>p.label);
  const islandMissing=kind==='Bearing Plinths'?bearing.templates[record.template].islands?.missing:templates[record.template].islandMissing;
  if(islandMissing&&!missing?.length)return 'Blender PARTIAL - Island data incomplete';
  return missing?.length?'Blender PARTIAL - missing EL: '+missing.join(', '):'Blender PARTIAL';
 });return '| '+p.id+' | '+cells.join(' | ')+' |';
});
const report=['# Blender coverage - 2026-10-17','',
 'This inventory covers the 384 embedded pier records, including split-pier entries. It is model availability, not drawing certification. Runtime guards compare geometry before displaying a template. Live changes can correctly fall back to the calculated Canvas view.','',
 ...Object.entries(counts).map(([k,n])=>'- '+k+': '+n+' piers, including P-1091.'),'',
 'Column: upper shaft only, both lift forms. Pile Cap: solid review volume with explicitly schematic display depth, except source-verified P-1091. Pile circles are axes projected to the top, and are drawn only when diameter is present in the source data. Pier Head and Bearing Plinths include a solid lower head envelope and a shortened column connection where the profile exists. Head depth uses source levels when available; otherwise the display depth is schematic. The rim/taper profile is schematic outside P-1091. Grey points with ? have no elevation and are projected on the datum. Bearing Plinths retain the 30 mm outward expansion on each edge.','',
 '| Pier | Pier Head | Column | Pile Cap | Bearing Plinths |','|---|---|---|---|---|',...rows,''];
if(!process.env.EXPORT_SKIP_COVERAGE)fs.writeFileSync(path.join(root,'docs/structural-blender-coverage.md'),report.join('\n'));
console.log(JSON.stringify({templates:Object.keys(templates).length,records:Object.keys(records).length,coverage:Object.fromEntries(['Pier Head','Column','Pile cap'].map(k=>[k,Object.keys(records).filter(r=>r.endsWith('|'+k)).length])),skipped:skipped.length}));
