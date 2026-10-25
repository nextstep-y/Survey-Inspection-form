const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync('index.html','utf8'),c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
vm.runInContext(fs.readFileSync('assets/pilecap_ch_os_overrides.js','utf8'),c);
vm.runInContext(h.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const s=h.indexOf('const PIERS_RAW = ');vm.runInContext(h.slice(s,h.indexOf('// STATE',s)),c);
const a=vm.runInContext('({piers:PIERS_RAW,arrays:ARRAYS_RAW,key:WORK_ARRAY_KEY,orient:_orientPierSpecificPoints,elev:getWorkPointElev})',c);
const offset=Number(process.env.AUDIT_OFFSET||0);
for(const p of Object.values(a.piers).slice(offset,offset+Number(process.env.AUDIT_COUNT||10))){
 const key=a.key['Bearing Plinths'](p),raw=a.arrays[key]||[],points=a.orient(p,'Bearing Plinths',raw,false),groups={};
 for(const q of points){const m=q.label.match(/^(.+?)(\d+)$/);if(m)(groups[m[1]+':'+Math.floor((+m[2]-1)/4)]??=[]).push(q);}
 const summary=Object.fromEntries(Object.entries(groups).map(([k,ps])=>[k,{ch:ps.reduce((s,p)=>s+p.ch,0)/ps.length,os:ps.reduce((s,p)=>s+p.os,0)/ps.length,sizeCH:Math.max(...ps.map(p=>p.ch))-Math.min(...ps.map(p=>p.ch)),sizeOS:Math.max(...ps.map(p=>p.os))-Math.min(...ps.map(p=>p.os)),rise:a.elev(p,'Bearing Plinths',ps[0].label)-p.topPier}]));
 console.log(JSON.stringify({id:p.id,type:p.pierType,reinf:p.pierReinf,dwg:p.dwg,key,groups:summary}));
}
