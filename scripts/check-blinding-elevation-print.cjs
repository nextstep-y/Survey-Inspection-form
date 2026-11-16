const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:390,height:844,webPreferences:{partition:'blinding-elevation-'+Date.now()}});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
fs.mkdirSync(path.resolve(__dirname,'../output/pdf'),{recursive:true});
for(const width of [390,1500]){
w.setContentSize(width,1000);
await w.webContents.executeJavaScript(`document.getElementById('element').value='Blinding Concrete';onPierSelect('P-826');window.print=()=>{};window.alert=m=>{throw Error(m)};printDoc();`);
await new Promise(r=>setTimeout(r,100));
assert.equal(await w.webContents.executeJavaScript("document.querySelectorAll('.blinding-elevation-attachment img').length"),1);
const pdf=path.resolve(__dirname,'../output/pdf/P-826-Blinding-Elevation-'+width+'.pdf');
fs.writeFileSync(pdf,await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
const info=cp.execFileSync('pdfinfo',['-f','1','-l','4',pdf],{encoding:'utf8'});console.log(width,info.split('\n').filter(l=>/^Pages:|^Page\s+\d+ size/.test(l)).join('\n'));
assert.match(info,/^Pages:\s+2$/m);
const size=info.match(/Page\s+2 size:\s+([\d.]+) x ([\d.]+)/);assert.ok(size);assert.ok(Math.abs(Number(size[1])-595.28)<1&&Math.abs(Number(size[2])-841.89)<1);
const images=cp.execFileSync('pdfimages',['-f','2','-l','2','-list',pdf],{encoding:'utf8'});assert.ok(!/^\s*2\s+\d+\s+/m.test(images),'Supplement must stay vector, not a page-sized bitmap');
await new Promise(r=>setTimeout(r,2200));
}
await w.webContents.executeJavaScript(`window.dispatchEvent(new Event('afterprint'));`);
assert.equal(await w.webContents.executeJavaScript("document.querySelectorAll('.blinding-elevation-attachment').length"),0);
assert.equal(await w.webContents.executeJavaScript("BlindingElevationPrint.prepare('Pile cap')"),null);
console.log('PASS first Word page only; portrait supplement; mobile/desktop; cleanup; other work excluded');app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
