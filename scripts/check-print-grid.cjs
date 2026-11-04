const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),path=require('path'),fs=require('fs');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:390,height:844});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
await w.webContents.executeJavaScript(`document.getElementById('element').value='Pot Bearing';onPierSelect('P-1093');window.print=()=>{};printDoc();`);
// Emulate print CSS for a direct edge-by-edge assertion, not just a screenshot.
const css=fs.readFileSync(path.resolve(__dirname,'../assets/print-grid.css'),'utf8');
await w.webContents.executeJavaScript(`(()=>{const s=document.createElement('style');s.id='grid-test-style';s.textContent=${JSON.stringify(css.replace('@media print','@media all'))};document.head.append(s);})()`);
await new Promise(r=>setTimeout(r,300));
const borders=await w.webContents.executeJavaScript(`Array.from(document.querySelectorAll('#survey-table th,#survey-table td,#occ-table th,#occ-table td')).map(e=>{const s=getComputedStyle(e);return ['Top','Right','Bottom','Left'].map(x=>parseFloat(s['border'+x+'Width']))})`);
assert.ok(borders.length>100);assert.ok(borders.every(row=>row.every(v=>v>=0.6)),JSON.stringify(borders.filter(row=>row.some(v=>v<0.6)).slice(0,5)));
await w.webContents.executeJavaScript(`document.getElementById('grid-test-style').remove()`);
fs.mkdirSync(path.resolve(__dirname,'../output/pdf'),{recursive:true});
fs.writeFileSync(path.resolve(__dirname,'../output/pdf/P-1093-Pot-Bearing-print-grid.pdf'),await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
console.log('PASS explicit four-edge rules on',borders.length,'cells; mobile-width PDF generated');app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
