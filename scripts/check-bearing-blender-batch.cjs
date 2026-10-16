const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),c={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/bearing-blender-manifest.js'),'utf8'),c);
const m=c.window.BEARING_BLENDER_MANIFEST;
for(const [key,t] of Object.entries(m.templates)){
 const png=fs.readFileSync(path.join(root,t.image));assert.equal(png.readUInt32BE(16),1800);assert.equal(png.readUInt32BE(20),1000);
 assert.ok(fs.statSync(path.join(root,'assets/models/bearing-blender',key+'.blend')).size>0);
 assert.equal(new Set(t.anchors.map(a=>a.label)).size,t.anchors.length);
 for(const a of t.anchors)assert.ok(a.x>0&&a.x<1&&a.y>0&&a.y<1);
}
for(const r of Object.values(m.records)){
 const t=m.templates[r.template];assert.ok(t);assert.equal(r.points.length,t.anchors.length);
 for(const p of r.points){assert.ok(t.anchors.some(a=>a.label===p.label));assert.ok([p.ch,p.os,p.z].every(Number.isFinite));}
}
console.log(JSON.stringify({templates:Object.keys(m.templates).length,records:Object.keys(m.records).length,
 piers:new Set(Object.keys(m.records).map(k=>k.split('|')[0])).size,
 skipped:[...new Set(m.skipped.map(r=>r.pier))]}));
