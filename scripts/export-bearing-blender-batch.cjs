// Export independent per-pier snapshots; deduplicate only identical relative geometry.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),h=fs.readFileSync(path.join(root,'index.html'),'utf8');
let bearingType='TYPE1';
const c=vm.createContext({window:{},document:{getElementById:()=>({value:bearingType})}});
vm.runInContext(fs.readFileSync(path.join(root,'assets/pilecap_ch_os_overrides.js'),'utf8'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const start=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(start,h.indexOf('// STATE',start)),c);
vm.runInContext(fs.readFileSync(path.join(root,'assets/structural-blender-geometry.js'),'utf8'),c);
const api=vm.runInContext(`({piers:PIERS_RAW,arrays:ARRAYS_RAW,key:WORK_ARRAY_KEY,orient:_orientPierSpecificPoints,
 elev:getWorkPointElev,head:getPierHeadModel,body:window.StructuralBlender.bodyFor,islands:window.StructuralBlender.islandsFor,imported:_excelChOsPoints,br114:BR114_DRAWING_CONTROLS,drawing:getDrawingPlinthControl,step:getConfirmedBearingHeadStep})`,c);
const variants=JSON.parse(fs.readFileSync(path.join(root,'assets/structural-blender-variants.json'),'utf8'));
const templates={},records={},skipped=[];
for(const pier of Object.values(api.piers)){
 if(pier.id==='P-1091')continue; // Keep approved detailed Blender model.
 for(const type of ['TYPE1','TYPE2']){
  bearingType=type;
  const imported=api.imported(pier,'Bearing Plinths','canvas');
  const raw=imported||api.arrays[api.key['Bearing Plinths'](pier)]||[];
  const points=api.orient(pier,'Bearing Plinths',raw,Boolean(imported)).map(p=>({label:p.label,ch:p.ch,os:p.os,z:api.elev(pier,'Bearing Plinths',p.label)}));
  const head=api.head(pier);
  if(points.length<4 || points.some(p=>!Number.isFinite(p.z)||!Number.isFinite(p.ch)||!Number.isFinite(p.os))||!Number.isFinite(head.topPier)){
   skipped.push({pier:pier.id,type,reason:'missing bearing points/levels'});continue;
  }
  const ts=head.points.filter(p=>/^T\d+$/.test(p.label));
  if(ts.length<4){skipped.push({pier:pier.id,type,reason:'missing head envelope'});continue;}
  const relative=points.map(p=>({...p,z:Number((p.z-head.topPier).toFixed(6))}));
  const groups={};for(const p of relative){const m=p.label.match(/^(.+?)(\d+)$/);if(!m)continue;const k=m[1]+':'+Math.floor((+m[2]-1)/4);(groups[k]??=[]).push(p);}
  if(Object.values(groups).some(g=>g.length!==4)||Object.values(groups).flat().length!==points.length){skipped.push({pier:pier.id,type,reason:'incomplete four-corner groups'});continue;}
  const geometry={points:relative,groups:Object.values(groups),
   head:api.drawing(pier)?.headBounds||{minCH:Math.min(...ts.map(p=>p.ch)),maxCH:Math.max(...ts.map(p=>p.ch)),minOS:Math.min(...ts.map(p=>p.os)),maxOS:Math.max(...ts.map(p=>p.os))},
   step:api.br114[pier.id]?.step??(pier.id==='P-1094'?.6:0),highSign:api.br114[pier.id]?.highSign??1,...(api.step(pier)||{}),body:api.body(pier,'Bearing Plinths'),islands:api.islands(pier),renderRevision:'central-islands-1'};
  const id=crypto.createHash('sha256').update(JSON.stringify(geometry)).digest('hex').slice(0,16);
  templates[id]=geometry;
  records[pier.id+'|'+type]={template:id,topPier:head.topPier,points};
  for(const variant of variants.filter(v=>v.pier===pier.id&&v.work==='Pier Head')){
   const input=variant.points.map(p=>({label:p.label,ch:p.ch,os:p.os,z:head.topPier+p.rise}));
   const alternative={...geometry,islands:api.islands(pier,input)};
   const variantId=crypto.createHash('sha256').update(JSON.stringify(alternative)).digest('hex').slice(0,16);
   templates[variantId]=alternative;(records[pier.id+'|'+type].variants??=[]).push(variantId);
  }
 }
}
const out=path.join(root,'output/bearing-blender-batch');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'source.json'),JSON.stringify({templates,records,skipped},null,2));
console.log(JSON.stringify({records:Object.keys(records).length,piers:new Set(Object.keys(records).map(k=>k.split('|')[0])).size,templates:Object.keys(templates).length,skipped:skipped.length}));
