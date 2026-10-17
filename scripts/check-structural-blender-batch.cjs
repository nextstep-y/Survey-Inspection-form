const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),h=fs.readFileSync(path.join(root,'index.html'),'utf8');
const c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
for(const file of ['assets/pilecap_ch_os_overrides.js','assets/structural-blender-geometry.js','assets/structural-blender-manifest.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const s=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(s,h.indexOf('// STATE',s)),c);
const api=vm.runInContext('({piers:PIERS_RAW,build:window.StructuralBlender.build,points:window.StructuralBlender.pointsFor})',c),m=c.window.STRUCTURAL_BLENDER_MANIFEST;
for(const [id,t] of Object.entries(m.templates)){
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(t.geometry)).digest('hex').slice(0,16),id);
 const png=fs.readFileSync(path.join(root,t.image));assert.equal(png.readUInt32BE(16),1800);assert.equal(png.readUInt32BE(20),1000);
 assert.ok(fs.statSync(path.join(root,'assets/models/structural-blender',id+'.blend')).size>0);
 assert.equal(new Set(t.anchors.map(a=>a.label)).size,t.geometry.points.length);
 for(const side of [-1,1]){
  const anchors=t.anchors.filter(a=>a.side===side).sort((a,b)=>a.y-b.y);
  for(let i=0;i<anchors.length;i++){assert.ok(anchors[i].y>=.15&&anchors[i].y<=.85);if(i)assert.ok(anchors[i].y-anchors[i-1].y>.018);}
 }
 if(t.geometry.kind==='Pile cap')assert.ok(t.geometry.surfaces.every(s=>s.bottom===null),'No invented cap thickness');
}
let count=0;
for(const p of Object.values(api.piers))for(const kind of ['Pier Head','Column','Pile cap']){
 if(p.id==='P-1091')continue;
 const work=kind==='Column'?'Pier Column (1st-Lift)':kind,key=p.id+'|'+kind;
 const points=api.points(p,work),before=JSON.stringify(points),g=api.build(p,work,points);
 assert.equal(JSON.stringify(points),before,'Building a display must preserve survey input');
 if(!g){assert.ok(m.skipped.some(r=>r.pier===p.id&&r.work===kind));continue;}
 assert.ok(m.records[key],key);const t=m.templates[m.records[key].template];assert.equal(JSON.stringify(g),JSON.stringify(t.geometry),key);
 const changed=points.map((x,i)=>i?x:{...x,ch:x.ch+.01});
 assert.notEqual(JSON.stringify(api.build(p,work,changed)),JSON.stringify(t.geometry),'Changed geometry must invalidate image');
 if(kind==='Column')assert.equal(JSON.stringify(g),JSON.stringify(api.build(p,'Pier Column (2nd Lift)')));
 count++;
}
for(const kind of ['Pier Head','Column','Pile cap'])assert.ok(m.records['P-1142|'+kind]);
for(const variant of JSON.parse(fs.readFileSync(path.join(root,'assets/structural-blender-variants.json'),'utf8'))){
 const p=api.piers[variant.pier],base=api.points(p,variant.work),datum=base.find(x=>x.label==='T2').z;
 const points=variant.points.map(x=>({label:x.label,ch:x.ch,os:x.os,z:datum+x.rise}));
 const signature=JSON.stringify(api.build(p,variant.work,points));
 const record=m.records[variant.pier+'|'+variant.work];
 assert.ok(record.variants.some(id=>JSON.stringify(m.templates[id].geometry)===signature),'Live Sheet variant available');
}
const partial=m.templates[m.records['P-976R|Pier Head'].template].geometry;
assert.equal(partial.points.find(p=>p.label==='T17').z,null,'Missing levels must stay unknown');
assert.match(partial.status,/missing EL/);
console.log('PASS: '+count+' pier/work snapshots; '+Object.keys(m.templates).length+' Blender models; live-change guards; P-1142 all three works.');
