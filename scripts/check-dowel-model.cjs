const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const html=fs.readFileSync('index.html','utf8'),c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
assert.ok(html.includes('body.structural-print.dowel-print #survey-body tr:nth-child(n+19)'), 'Print CSS must retain all 18 rows');
assert.ok(html.includes('BR_DOWEL_LAYOUTS[currentPier?.id]?18:16'), 'Pagination and CSS must agree on Dowel row limit');
for(const f of ['pilecap_ch_os_overrides','structural-blender-geometry','dowel-blender-manifest'])vm.runInContext(fs.readFileSync('assets/'+f+'.js','utf8'),c);
vm.runInContext(html.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const s=html.indexOf('const PIERS_RAW = ');vm.runInContext(html.slice(s,html.indexOf('// STATE',s)),c);
const api=vm.runInContext('({piers:PIERS_RAW,model:getPierHeadModel,build:getDowelBlenderGeometry,pending:BR_DOWEL_PENDING})',c);
// Independent controls transcribed from each rendered plan and the bearing
// keyplans 2050 / 3055 / 4055, NOT read back out of the production layouts.
const expected={
 'P-888': [.925,[['S3',-2.4,378],['S1',2.4,414]]],
 'P-889': [0,[['S5',-2,873],['S4',2,902]]],
 'P-890': [0,[['S6',-2,795],['S2',2,852]]],
 'P-891': [-.925,[['S3',-2.4,378],['S1',2.4,414]]],
 'P-1048':[.925,[['S3',-2.4,400],['S1',2.4,449]]],
 'P-1091':[.925,[['S3',-2.4,453],['S1',2.4,488]]],
 'P-1092':[0,[['S5',-2,1004],['S4',2,1047]]],
 'P-1093':[0,[['S6',-2,933],['S2',2,1004]]],
 'P-1094':[-.925,[['S3',-2.4,453],['S1',2.4,488]]],
};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
for(const [id,[ch,bearings]]of Object.entries(expected)){
 const p=api.piers[id],model=api.model(p),before=JSON.stringify(model),d=model.points.filter(p=>p.kind==='dowel');
 assert.equal(d.length,8);assert.equal(new Set(model.points.map(p=>p.label)).size,model.points.length);
 for(const [name,os,mm]of bearings){const g=d.filter(p=>p.bearing===name);assert.equal(g.length,4);
  near(g.reduce((s,p)=>s+p.ch,0)/4,ch);near(g.reduce((s,p)=>s+p.os,0)/4,os);
  near(Math.max(...g.map(p=>p.ch))-Math.min(...g.map(p=>p.ch)),mm/1000);
  near(Math.max(...g.map(p=>p.os))-Math.min(...g.map(p=>p.os)),mm/1000);
 }
 const a=(p.deg+p.min/60+p.sec/3600)*Math.PI/180;
 for(const q of d){near(q.n,p.n+q.ch*Math.sin(a)+q.os*Math.cos(a));near(q.e,p.e-q.ch*Math.cos(a)+q.os*Math.sin(a));assert.equal(q.z,null,'No invented Dowel setting elevation');}
 const m=c.window.DOWEL_BLENDER_MANIFEST,r=m.records[id+'|Pier Head'],g=api.build(p);
 assert.equal(JSON.stringify(g),JSON.stringify(m.templates[r.template].geometry));
 assert.equal(JSON.stringify(model),before,'Rendering must not mutate survey data');
 const changed=model.points.map((q,i)=>i?{...q}:{...q,ch:q.ch+.01});
 if(model.points.some(q=>q.kind!=='dowel'))assert.notEqual(JSON.stringify(api.build(p,changed)),JSON.stringify(g));
}
for(const id of ['P-1049','P-1050','P-1051']){assert.ok(api.pending[id]);assert.equal(api.model(api.piers[id]).points.filter(p=>p.kind==='dowel').length,0);}
for(const [id,t]of Object.entries(c.window.DOWEL_BLENDER_MANIFEST.templates)){
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(t.geometry)).digest('hex').slice(0,16),id);
 const png=fs.readFileSync(t.image);assert.equal(png.readUInt32BE(16),1800);assert.equal(png.readUInt32BE(20),1000);
 assert.ok(fs.statSync('assets/models/dowel-blender/'+id+'.blend').size>0);
 assert.equal(new Set(t.anchors.map(a=>a.label)).size,t.geometry.points.length);
}
console.log('PASS 9 verified piers / 72 calculated Dowel axes; per-pier spacing, chainage side, N/E, blank Z, Blender guards; 3 excluded records.');
