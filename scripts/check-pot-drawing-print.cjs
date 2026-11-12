const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:390,height:844});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
const data=await w.webContents.executeJavaScript(`(()=>{const ready=[],missing=[];for(const p of Object.values(PIERS_RAW)){const r=getWorkDrawingReferences(p,'Pot Bearing');if(r.refs.length){PilecapDrawingPrint.potRecordsFor(p.id,r.refs);ready.push(p.id);}else missing.push(p.id);}return {ready,missing,catalog:POT_DRAWING_PAGES}})()`);
assert.equal(data.ready.length,8);assert.equal(Object.keys(data.catalog.drawings).length,12);assert.deepEqual(data.catalog.missing,[]);
for(const r of Object.values(data.catalog.drawings))for(const p of r.pages){const b=fs.readFileSync(path.resolve(__dirname,'..',p));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');}
fs.mkdirSync(path.resolve(__dirname,'../output/pdf'),{recursive:true});
for(const id of data.ready){
await w.webContents.executeJavaScript(`document.getElementById('element').value='Pot Bearing';onPierSelect(${JSON.stringify(id)});window.print=()=>{};window.alert=m=>{throw Error(m)};printDoc();`);
await new Promise(r=>setTimeout(r,100));assert.equal(await w.webContents.executeJavaScript("document.querySelectorAll('.drawing-print-page').length"),2);
await w.webContents.executeJavaScript('openDwgPanel()');assert.equal(await w.webContents.executeJavaScript("document.querySelectorAll('#dwg-panel-current a').length"),2);await w.webContents.executeJavaScript('closeDwgPanel()');
const pdf=path.resolve(__dirname,'../output/pdf/'+id+'-Pot-Bearing-drawing-package.pdf');fs.writeFileSync(pdf,await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
assert.match(cp.execFileSync('pdfinfo',[pdf],{encoding:'utf8'}),/^Pages:\s+3$/m);console.log('PASS',id,'3 pages, 2 source links');await new Promise(r=>setTimeout(r,2200));
}
const guard=await w.webContents.executeJavaScript(`(()=>{let n=0;for(const [p,r]of [['P-1092',[]],['P-1092',[{dwg:'NSCR-ITD-N03-ZWD-DWG-ST-066056',rev:'UNKNOWN'}]],['P-888',[{dwg:'NSCR-ITD-N03-ZWD-DWG-ST-066056',rev:'B'}]]])try{PilecapDrawingPrint.potRecordsFor(p,r)}catch(e){n++}return n})()`);assert.equal(guard,3);
const dedup=await w.webContents.executeJavaScript(`PilecapDrawingPrint.potRecordsFor('P-1092',[{dwg:'NSCR-ITD-N03-ZWD-DWG-ST-066056',rev:'B'},{dwg:'NSCR-ITD-N03-ZWD-DWG-ST-066056',rev:'B'}]).length`);assert.equal(dedup,1);
console.log('PASS all Pot references, exact revision / wrong Pier guards, deduplication');app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
