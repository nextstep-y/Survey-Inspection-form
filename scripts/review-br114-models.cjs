// Narrow generated model inputs/merge to the four attached-drawing Piers.
const fs=require('fs'),cp=require('child_process'),vm=require('vm');
const ids=process.env.BR_PIER_IDS?process.env.BR_PIER_IDS.split(','):['P-888','P-889','P-890','P-891'],mode=process.argv[2];
for(const family of (process.argv[3]?[process.argv[3]]:['bearing','dowel'])){
 const file='assets/'+family+'-blender-manifest.js',folder='output/'+family+'-blender-batch/';
 if(mode==='select'){
  fs.copyFileSync(file,folder+'before-br114.js');
  const source=JSON.parse(fs.readFileSync(folder+'source.json','utf8'));
  source.records=Object.fromEntries(Object.entries(source.records).filter(([key])=>ids.includes(key.split('|')[0])&&(!process.env.BLENDER_WORK||key.split('|')[1]===process.env.BLENDER_WORK)));
  const keys=new Set(Object.values(source.records).flatMap(r=>[r.template,...r.variants||[]]));
  source.templates=Object.fromEntries(Object.entries(source.templates).filter(([k])=>keys.has(k)));
  fs.writeFileSync(folder+'source.json',JSON.stringify(source,null,2));
 }else if(mode==='merge'){
  const parse=t=>JSON.parse(t.slice(t.indexOf('=')+1).replace(/;\s*$/,''));
  const oldText=fs.readFileSync(folder+'before-br114.js','utf8'),old=parse(oldText),fresh=parse(fs.readFileSync(file,'utf8'));
  Object.assign(old.records,fresh.records);Object.assign(old.templates,fresh.templates);
  if(Array.isArray(old.skipped))old.skipped=old.skipped.filter(r=>!ids.includes(r.pier));
  fs.writeFileSync(file,oldText.slice(0,oldText.indexOf('=')+1)+JSON.stringify(old)+';\n');
 }else throw Error('Use select or merge');
}
