const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1100,webPreferences:{partition:'head-print-'+Date.now()}});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
const result=await w.webContents.executeJavaScript(`(()=>{
const c=window.HEAD_DRAWING_PAGES,totals={ready:0,missingPDF:0,noReference:0};
for(const p of Object.values(PIERS_RAW))for(const work of ['Pier Head','Bearing Plinths']){
 const refs=getWorkDrawingReferences(p,work).refs;
 if(!refs.length){totals.noReference++;continue;}
 const missing=refs.some(r=>!c.drawings[r.dwg+'|'+r.rev]);
 if(missing){totals.missingPDF++;continue;}
 const pages=PilecapDrawingPrint.headRecordsFor(p.id,refs);
 if(pages.length!==refs.length||pages.some((r,i)=>r.dwg!==refs[i].dwg||r.rev!==refs[i].rev))throw Error(p.id+' incorrect work-specific attachment');
 totals.ready++;
}
return {totals,drawings:c.drawings,missing:c.missing};})()`);
for(const r of Object.values(result.drawings))for(const p of r.pages){const b=fs.readFileSync(path.resolve(__dirname,'..',p));assert.equal(b[0],255);assert.equal(b[1],216);}
assert.equal(result.missing.length,0,'All confirmed reference revisions require matching PDF assets');
for(const [id,work]of [['P-826','Pier Head'],['P-1092','Pier Head'],['P-1092','Bearing Plinths'],['P-1094','Bearing Plinths'],['P-992','Pier Head'],['P-1142','Bearing Plinths']]){
 const expected=await w.webContents.executeJavaScript(`(()=>{document.getElementById('element').value='${work}';onPierSelect('${id}');window.print=()=>{};window.alert=m=>{throw Error(m)};return getWorkDrawingReferences(currentPier,'${work}').refs.reduce((n,r)=>n+HEAD_DRAWING_PAGES.drawings[r.dwg+'|'+r.rev].pages.length,0);})()`);
 await w.webContents.executeJavaScript('printDoc()');await new Promise(r=>setTimeout(r,100));
 assert.equal(await w.webContents.executeJavaScript("document.querySelectorAll('.drawing-print-page').length"),expected);
 fs.writeFileSync('/tmp/'+id+'-'+work.replace(/ /g,'-')+'-drawing-package.pdf',await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
 console.log('PASS PDF',id,work,expected,'drawing pages');await new Promise(r=>setTimeout(r,2200));
}
const guarded=await w.webContents.executeJavaScript(`(()=>{try{PilecapDrawingPrint.headRecordsFor('P-992',[{dwg:'NSCR-ITD-N03-ZWD-DWG-ST-023241',rev:'UNKNOWN'}]);return false}catch(e){return e.message.includes('Exact PDF revision required')}})()`);assert.ok(guarded);
const links=await w.webContents.executeJavaScript(`(()=>{document.getElementById('element').value='Bearing Plinths';onPierSelect('P-1092');document.getElementById('dwg-pier-input').value='P-1092';openDwgPanel();return document.querySelectorAll('#dwg-panel-current a').length;})()`);assert.equal(links,3);
console.log('PASS coverage',JSON.stringify(result.totals),'missing revisions',JSON.stringify(result.missing));app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
