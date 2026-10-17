const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),c={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/bearing-blender-manifest.js'),'utf8'),c);
const m=c.window.BEARING_BLENDER_MANIFEST;
for(const [key,t] of Object.entries(m.templates)){
 const png=fs.readFileSync(path.join(root,t.image));assert.equal(png.readUInt32BE(16),1800);assert.equal(png.readUInt32BE(20),1000);
 assert.ok(fs.statSync(path.join(root,'assets/models/bearing-blender',key+'.blend')).size>0);
 assert.equal(new Set(t.anchors.map(a=>a.label)).size,t.anchors.length);
 for(const a of t.anchors)assert.ok(a.x>0&&a.x<1&&a.y>0&&a.y<1);
 assert.ok(t.body&&t.body.depth>0,'Lower head body required in every prepared bearing template');
 assert.ok(t.islands&&Array.isArray(t.islands.surfaces),'Island geometry must be explicit');
 for(const s of t.islands.surfaces){assert.ok(s.top>s.bottom&&s.ring.length===4);assert.ok(s.ring.every(p=>Number.isFinite(p.ch)&&Number.isFinite(p.os)));}
}
for(const r of Object.values(m.records)){
 const t=m.templates[r.template];assert.ok(t);assert.equal(r.points.length,t.anchors.length);
 for(const p of r.points){assert.ok(t.anchors.some(a=>a.label===p.label));assert.ok([p.ch,p.os,p.z].every(Number.isFinite));}
 for(const id of r.variants||[])assert.ok(m.templates[id],'Live island variant must exist');
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');c.document={getElementById:()=>({value:'TYPE1'})};
vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(root,'assets/pilecap_ch_os_overrides.js'),'utf8'),c);
vm.runInContext(html.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const start=html.indexOf('const PIERS_RAW = ');vm.runInContext(html.slice(start,html.indexOf('// STATE',start)),c);
vm.runInContext(fs.readFileSync(path.join(root,'assets/structural-blender-geometry.js'),'utf8'),c);
const api=vm.runInContext('({piers:PIERS_RAW,islands:window.StructuralBlender.islandsFor})',c);
for(const [key,r] of Object.entries(m.records))assert.equal(JSON.stringify(m.templates[r.template].islands),JSON.stringify(api.islands(api.piers[key.split('|')[0]])),'Island must match its own Pier Head');
assert.deepEqual(JSON.parse(JSON.stringify(m.templates[m.records['P-1094|TYPE1'].template].islands.surfaces.map(s=>s.top).sort())),[.317,.917]);
for(const id of ['P-1120L','P-1120R']){const islands=api.islands(api.piers[id]);assert.equal(islands.missing,true);assert.equal(islands.surfaces.length,0,'Malformed corners must not become a fabricated Island');}
console.log(JSON.stringify({templates:Object.keys(m.templates).length,records:Object.keys(m.records).length,
 piers:new Set(Object.keys(m.records).map(k=>k.split('|')[0])).size,
 skipped:[...new Set(m.skipped.map(r=>r.pier))]}));
