const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const h=fs.readFileSync('index.html','utf8'),c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
vm.runInContext(fs.readFileSync('assets/pilecap_ch_os_overrides.js','utf8'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const start=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(start,h.indexOf('// STATE',start)),c);
vm.runInContext(fs.readFileSync('assets/structural-blender-geometry.js','utf8'),c);
const a=vm.runInContext('({piers:PIERS_RAW,layouts:BR_DOWEL_LAYOUTS,pending:BR_DOWEL_PENDING,model:getPierHeadModel,build:window.StructuralBlender.build,dowel:getDowelBlenderGeometry})',c);
const templates={},records={};
for(const id of Object.keys(a.layouts)){
 const p=a.piers[id],model=a.model(p),g=a.build(p,'Pier Head');
 const add=(input)=>{
  const geometry=a.dowel(p,input);
  const key=crypto.createHash('sha256').update(JSON.stringify(geometry)).digest('hex').slice(0,16);templates[key]=geometry;return key;
 };
 records[id+'|Pier Head']={template:add(model.points)};
 const vs=JSON.parse(fs.readFileSync('assets/structural-blender-variants.json','utf8'));
 for(const v of vs.filter(v=>v.pier===id&&v.work==='Pier Head')){
  const pts=v.points.map(q=>({...q,z:model.topPier+q.rise}));
  (records[id+'|Pier Head'].variants??=[]).push(add(pts));
 }
}
fs.mkdirSync('output/dowel-blender-batch',{recursive:true});
fs.writeFileSync('output/dowel-blender-batch/source.json',JSON.stringify({templates,records,skipped:a.pending},null,2));
console.log(Object.keys(records).length+' piers; '+Object.keys(templates).length+' templates; '+Object.values(templates).reduce((n,g)=>n+g.points.filter(p=>p.kind==='dowel').length,0)+' axes including variants');
