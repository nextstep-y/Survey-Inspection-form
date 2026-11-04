const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:390,height:844});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
const data=await w.webContents.executeJavaScript(`(()=>{const ready=[],missing=[];for(const p of Object.values(PIERS_RAW)){const a=getWorkDrawingReferences(p,'Pier Column (1st-Lift)'),b=getWorkDrawingReferences(p,'Pier Column (2nd Lift)');if(a?.refs.length){if(JSON.stringify(a.refs)!==JSON.stringify(b.refs))throw Error('Lift mismatch '+p.id);PilecapDrawingPrint.columnRecordsFor(p.id,a.refs);ready.push(p.id);}else missing.push(p.id);}return {ready,missing,catalog:COLUMN_DRAWING_PAGES};})()`);
for(const d of Object.values(data.catalog.drawings))for(const page of d.pages){const b=fs.readFileSync(path.resolve(__dirname,'..',page));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');}
fs.mkdirSync(path.resolve(__dirname,'../output/pdf'),{recursive:true});
for(const [id,work]of [['P-826','Pier Column (1st-Lift)'],['P-1093','Pier Column (2nd Lift)'],['P-976L','Pier Column (1st-Lift)'],['P-1113SB','Pier Column (2nd Lift)'],['P-1142','Pier Column (2nd Lift)'],['P-1012','Pier Column (1st-Lift)']]){
await w.webContents.executeJavaScript(`document.getElementById('element').value=${JSON.stringify(work)};onPierSelect(${JSON.stringify(id)});window.print=()=>{};window.alert=m=>{throw Error(m)};printDoc();`);
await new Promise(r=>setTimeout(r,100));
assert.equal(await w.webContents.executeJavaScript("document.querySelectorAll('.drawing-print-page').length"),2);
await w.webContents.executeJavaScript(`openDwgPanel()`);
assert.equal(await w.webContents.executeJavaScript("document.querySelectorAll('#dwg-panel-current a').length"),2);
await w.webContents.executeJavaScript(`closeDwgPanel()`);
const pdf=path.resolve(__dirname,'../output/pdf/'+id+'-Column-drawing-package.pdf');
fs.writeFileSync(pdf,await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
console.log('PASS Column PDF',id,work);await new Promise(r=>setTimeout(r,2200));
}
const guards=await w.webContents.executeJavaScript(`(()=>{let n=0;for(const [pier,refs]of [['P-1093',[]],['P-1093',[{dwg:'NSCR-ITD-N03-ZWD-DWG-ST-022038',rev:'UNKNOWN'}]],['P-826',[{dwg:'NSCR-ITD-N03-ZWD-DWG-ST-022038',rev:'A'}]]])try{PilecapDrawingPrint.columnRecordsFor(pier,refs)}catch(e){n++}return n})()`);assert.equal(guards,3);
console.log('PASS coverage',JSON.stringify({ready:data.ready.length,missing:data.missing,drawings:Object.keys(data.catalog.drawings).length}));app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
