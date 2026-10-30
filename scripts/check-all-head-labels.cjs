// Software correspondence audit, not a new PDF certification of every Pier.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const read=p=>process.env.STAGED_RELEASE?require('child_process').execFileSync('git',['show',':'+p],{encoding:'utf8'}):fs.readFileSync(p,'utf8');
const h=read('index.html'),c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
for(const f of ['pilecap_ch_os_overrides','structural-blender-geometry','structural-blender-manifest','dowel-blender-manifest'])vm.runInContext(read('assets/'+f+'.js'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const s=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(s,h.indexOf('// STATE',s)),c);
const a=vm.runInContext('({piers:PIERS_RAW,head:getPierHeadModel,build:window.StructuralBlender.build,dowel:getDowelBlenderGeometry,layouts:BR_DOWEL_LAYOUTS})',c);
const rows=[];
for(const p of Object.values(a.piers)){
 const n=Number(p.id.match(/^P-(\d+)/)?.[1]);if(!(n>=826&&n<=1142))continue;
 const m=a.head(p),labels=m.points.map(q=>q.label);assert.equal(new Set(labels).size,labels.length,p.id+' duplicate identity');
 const prepared=!!a.layouts[p.id],family=prepared?'dowel':'structural';
 const manifest=c.window[family.toUpperCase()+'_BLENDER_MANIFEST'];
 const g=prepared?a.dowel(p,m.points):a.build(p,'Pier Head',m.points);
 if(!g){rows.push({pier:p.id,status:'NO_GEOMETRY',points:labels.length});continue;}
 const r=manifest.records[p.id+'|Pier Head'];
 const key=r&&[r.template,...r.variants||[]].find(k=>JSON.stringify(manifest.templates[k]?.geometry)===JSON.stringify(g));
 if(!key){rows.push({pier:p.id,status:'LIVE_FALLBACK',points:labels.length});continue;}
 const t=manifest.templates[key];assert.equal(t.anchors.length,g.points.length,p.id+' missing labels');
 assert.equal(new Set(t.anchors.map(q=>q.label)).size,g.points.length,p.id+' duplicate leaders');
 for(const q of t.anchors){assert.ok(g.points.some(p=>p.label===q.label),p.id+' incorrect leader identity');assert.ok(q.x>0&&q.x<1&&q.y>0&&q.y<1,p.id+' label out of frame');}
 rows.push({pier:p.id,status:'BLENDER_MATCH',family,template:key,points:labels.length});
}
const p=a.head(a.piers['P-1091']),t1=p.points.find(p=>p.label==='T1'),t3=p.points.find(p=>p.label==='T3');
assert.equal(t1.ch,1.75);assert.equal(t3.ch,-1.75);assert.equal(t1.z,115.11);assert.equal(t3.z,115.71);
assert.equal(t1.modelCH,-1.75);assert.equal(t3.modelCH,1.75);
fs.mkdirSync('output/head-label-audit',{recursive:true});
fs.writeFileSync('output/head-label-audit/report.json',JSON.stringify({scope:'P-826 to P-1142 including suffix records; software label-to-point correspondence only',rows},null,2));
const counts=Object.fromEntries([...new Set(rows.map(r=>r.status))].map(s=>[s,rows.filter(r=>r.status===s).length]));
console.log('PASS',rows.length,'Pier records',JSON.stringify(counts));
