const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync('index.html','utf8'),c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
vm.runInContext(fs.readFileSync('assets/pilecap_ch_os_overrides.js','utf8'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const start=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(start,h.indexOf('// STATE',start)),c);
vm.runInContext(fs.readFileSync('assets/structural-blender-geometry.js','utf8'),c);
const records=vm.runInContext(`Object.fromEntries(['P-888','P-889','P-890','P-891','P-1091','P-1092','P-1093','P-1094'].map(id=>[id,{top:PIERS_RAW[id].topPier,points:getPotBearingPoints(PIERS_RAW[id]),context:getPotBearingContext(PIERS_RAW[id])}]))`,c);
for(const variant of JSON.parse(fs.readFileSync('assets/structural-blender-variants.json','utf8'))){
 if(!records[variant.pier])continue;
 const points=variant.points.map(p=>({...p,z:records[variant.pier].top+p.rise}));c.variant=points;
 records[variant.pier+'-live']={...records[variant.pier],context:vm.runInContext(`getPotBearingContext(PIERS_RAW['${variant.pier}'],variant)`,c)};
}
fs.mkdirSync('output/pot-blender',{recursive:true});fs.writeFileSync('output/pot-blender/source.json',JSON.stringify(records,null,2));
