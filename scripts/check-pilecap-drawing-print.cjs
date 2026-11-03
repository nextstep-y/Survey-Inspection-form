const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1100,webPreferences:{partition:'pilecap-print-'+Date.now()}});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
const result=await w.webContents.executeJavaScript(`(()=>{
const all=window.PILECAP_DRAWING_REGISTER,checks=[];
if(all.issues.length)throw Error('Unresolved register conflicts');
for(const [id,records]of Object.entries(all.records))for(const work of ['Pile cap','Bored Pile']){
const p=PIERS_RAW[id]||{id},r=getWorkDrawingReferences(p,work);
if(r.refs.length!==records.length||!records.every(x=>r.text.includes(x.dwg+' / Rev.'+x.rev)))throw Error(id+' reference mismatch');checks.push(id+' '+work);
}
if(PilecapDrawingPrint.recordsFor('P-976L').length!==2)throw Error('Combined-head L source missing');
if(PilecapDrawingPrint.recordsFor('P-978NB')[0].dwg.endsWith('021079')!==true)throw Error('NB exact source required');
if(PilecapDrawingPrint.recordsFor('P-1132')[0].rev!=='C')throw Error('User confirmed revision missing');
if(!getWorkDrawingReferences(PIERS_RAW['P-1091'],'Pier Head').text.includes('023165'))throw Error('Unrelated head reference changed');
return {cases:checks.length,records:all.records};})()`);
for(const rows of Object.values(result.records))for(const row of rows)for(const file of row.pages){const b=fs.readFileSync(path.resolve(__dirname,'..',file));assert.equal(b[0],255);assert.equal(b[1],216);}
for(const [id,work]of [['P-826','Pile cap'],['P-989','Pile cap'],['P-1094','Bored Pile']]){
await w.webContents.executeJavaScript(`(()=>{document.getElementById('element').value='${work}';onPierSelect('${id}');window.print=()=>{};window.alert=m=>{throw Error(m)};return printDoc();})()`);
await new Promise(r=>setTimeout(r,100));
const count=await w.webContents.executeJavaScript(`document.querySelectorAll('.drawing-print-page').length`);assert.ok(count>0);
fs.writeFileSync('/tmp/'+id+'-'+work.replace(/ /g,'-')+'-with-drawing.pdf',await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
console.log('PASS print',id,work,count,'source pages');
await new Promise(r=>setTimeout(r,2200));
}
const missing=await w.webContents.executeJavaScript(`PilecapDrawingPrint.prepare('P-892','Pile cap').then(()=>false,e=>e.message.includes('No confirmed drawing'))`);assert.ok(missing);
console.log('PASS',result.cases,'references; every image materialized; missing-source guard');app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
