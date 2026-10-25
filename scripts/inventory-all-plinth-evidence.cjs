// Read-only source inventory. No mapping or geometry is accepted by filename alone.
const fs=require('fs'),path=require('path'),cp=require('child_process'),vm=require('vm');
const folder='/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/SURVEY CP-N03 SHARE DRIVE/Pier Column';
const html=fs.readFileSync('index.html','utf8'),c=vm.createContext({window:{},document:{getElementById:()=>({value:'TYPE1'})}});
vm.runInContext(fs.readFileSync('assets/pilecap_ch_os_overrides.js','utf8'),c);vm.runInContext(html.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1],c);
const start=html.indexOf('const PIERS_RAW = ');vm.runInContext(html.slice(start,html.indexOf('// STATE',start)),c);
const api=vm.runInContext('({piers:PIERS_RAW,arrays:ARRAYS_RAW,key:WORK_ARRAY_KEY,orient:_orientPierSpecificPoints})',c);
const out='output/all-plinth-audit';fs.mkdirSync(out,{recursive:true});
const files=[];
function inspectFile(file,fullPath){
 const cache='tmp/pdfs/pier-column-text/'+file.replace(/\.pdf$/i,'.txt');
 const text=fs.existsSync(cache)?fs.readFileSync(cache,'utf8'):cp.execFileSync('pdftotext',['-layout',fullPath,'-'],{encoding:'utf8',maxBuffer:8e6});
 const ids={};for(const m of text.matchAll(/\bP\s*-\s*(\d{3,4})(NB|SB|L|R)?\b/g)){const id='P-'+m[1]+(m[2]||'');ids[id]=(ids[id]||0)+1;}
 // Multicolumn PDF text places the head note and reference far apart. Collect
 // all 023xxx head-series references, never the next unrelated pipe callout.
 const refs=[...new Set([...text.matchAll(/ST-(023\d{3})\b/g)].map(m=>m[1]))];
 files.push({file,path:fullPath,ids,refs});
}
for(const file of fs.readdirSync(folder).filter(f=>/\.pdf$/i.test(f)))inspectFile(file,path.join(folder,file));
// Search missing individual column sheets by drawing-number candidate only;
// visible text identity and head-reference checks still decide the mapping.
if(process.env.AUDIT_SUPPLEMENT){
 const all=cp.execFileSync('rg',['--files','/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/ITD CP N03 TEAM DRIVE/SUBSTRUCTURE'],{encoding:'utf8',maxBuffer:30e6}).split('\n');
 const used=new Set(files.map(f=>f.file));
 for(const p of Object.values(api.piers)){
  const id=p.id.trim();if(files.some(f=>(f.ids[id]||0)>=2))continue;
  const n=p.dwg?.match(/ST-(\d{6})/);if(!n)continue;
  const number=String(Number(n[1])+1).padStart(6,'0');
  const options=all.filter(f=>new RegExp('ST-'+number+'-(?:[A-Z]|\\d{2})\\.pdf$').test(f));
  options.sort((a,b)=>path.basename(b).localeCompare(path.basename(a))||a.length-b.length);
  if(options[0]&&!used.has(path.basename(options[0]))){used.add(path.basename(options[0]));inspectFile(path.basename(options[0]),options[0]);}
 }
}
const records=[];
for(const p of Object.values(api.piers)){
 const key=p.id.trim(),num=Number(key.match(/^P-(\d+)/)?.[1]);if(!(num>=826&&num<=1142))continue;
 const sources=files.filter(f=>(f.ids[key]||0)>=2);
 const refs=[...new Set(sources.flatMap(f=>f.refs))];
 const ps=api.orient(p,'Bearing Plinths',api.arrays[api.key['Bearing Plinths'](p)]||[],false),groups={};
 for(const q of ps)(groups[q.label.replace(/\d+$/,'')]??=[]).push(q);
 records.push({id:p.id,type:p.pierType,refs,sources:sources.map(f=>({file:f.file,path:f.path,count:f.ids[key]})),groups:Object.fromEntries(Object.entries(groups).map(([g,ps])=>[g,{ch:ps.reduce((s,p)=>s+p.ch,0)/ps.length,os:ps.reduce((s,p)=>s+p.os,0)/ps.length,sizeCH:Math.max(...ps.map(p=>p.ch))-Math.min(...ps.map(p=>p.ch)),sizeOS:Math.max(...ps.map(p=>p.os))-Math.min(...ps.map(p=>p.os))}]))});
}
fs.writeFileSync(out+'/inventory.json',JSON.stringify(records,null,2));
const groups={};for(const r of records)(groups[r.type+' | '+r.refs.join(',')]??=[]).push(r.id);
for(const [k,v]of Object.entries(groups))console.log(k,v.length,v.slice(0,8).join(','));
console.log('Records',records.length,'source files',files.length,'missing',records.filter(r=>!r.sources.length).length);
