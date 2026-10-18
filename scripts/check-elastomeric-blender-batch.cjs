const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const h=fs.readFileSync('index.html','utf8');let type='TYPE1';
const c=vm.createContext({window:{},document:{getElementById:()=>({value:type})}});
for(const f of ['pilecap_ch_os_overrides','structural-blender-geometry','elastomeric-blender-geometry','elastomeric-blender-manifest'])vm.runInContext(fs.readFileSync('assets/'+f+'.js','utf8'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const s=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(s,h.indexOf('// STATE',s)),c);
const a=vm.runInContext('({piers:PIERS_RAW,build:window.ElastomericBlender.build,elev:getWorkPointElev})',c),m=c.window.ELASTOMERIC_BLENDER_MANIFEST;
for(const [id,t] of Object.entries(m.templates)){
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(t.geometry)).digest('hex').slice(0,16),id);
 const png=fs.readFileSync(t.image);assert.equal(png.readUInt32BE(16),1800);assert.equal(png.readUInt32BE(20),1000);
 assert.ok(fs.statSync('assets/models/elastomeric-blender/'+id+'.blend').size>0);
 assert.equal(new Set(t.anchors.map(a=>a.label)).size,t.geometry.points.length);
 for(const p of t.geometry.pads)assert.equal(p.rise,.067,'Every offline pad must be 67 mm above its source plinth level');
 for(const side of [-1,1]){const ps=t.anchors.filter(a=>a.side===side).sort((a,b)=>a.y-b.y);for(let i=1;i<ps.length;i++)assert.ok(ps[i].y-ps[i-1].y>.018);}
 if(t.geometry.supportMissing)assert.equal(t.geometry.groups.length,0,'No invented supporting footprint');
}
for(const p of Object.values(a.piers))for(type of ['TYPE1','TYPE2']){
 const g=a.build(p),r=m.records[p.id+'|'+type];
 if(!g){assert.ok(m.skipped.some(s=>s.pier===p.id&&s.type===type));continue;}
 assert.ok(r);assert.equal(JSON.stringify(g),JSON.stringify(m.templates[r.template].geometry));
 const changed=g.points.map((q,i)=>({...q,ch:q.ch+(i===0?.01:0)}));
 assert.notEqual(JSON.stringify(a.build(p,changed)),JSON.stringify(g),'Changed source must reject static image');
 for(const q of g.points)assert.ok(Math.abs(a.elev(p,'Elastomeric',q.label)-a.elev(p,'Bearing Plinths',q.label.replace(/^E/,''))-.067)<1e-6);
}
for(const id of ['P-989','P-990','P-1091','P-1092','P-1093','P-1094','P-1142'])assert.ok(m.records[id+'|TYPE1']);
vm.runInContext("liveBearingElevationRules=[{pier:'P-1092',work:'Elastomeric',pointGroup:'*',height:.067,reference:'Top of Pier',note:'67 mm above Top of Plinth'}]",c);
assert.ok(Math.abs(a.elev(a.piers['P-1092'],'Elastomeric','CL1')-a.elev(a.piers['P-1092'],'Bearing Plinths','CL1')-.067)<1e-6,'Legacy mislabeled Sheet reference must not put pad below plinth');
console.log('PASS '+Object.keys(m.records).length+' pier/type records; '+Object.keys(m.templates).length+' Blender templates; 67 mm levels; stale-image guards; P-1142.');
