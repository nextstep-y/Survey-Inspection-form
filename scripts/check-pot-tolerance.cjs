const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1100});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));
await w.loadFile(require('path').resolve(__dirname,'../index.html'));
const result=await w.webContents.executeJavaScript(`(()=>{
const expected='Horizontal position: ±0.003 m (±3 mm) | TS216.1.7, Vol.3, TS200-301 (PDF 306)';
const checks=[];
for(const id of ['P-888','P-889','P-890','P-891','P-1091','P-1092','P-1093','P-1094']){
document.getElementById('element').value='Pot Bearing';onPierSelect(id);
for(const desc of ['Setting out','As-Built']){
document.getElementById('work-desc').value=desc;updateTolerance();
if(document.getElementById('tol-bar-text').textContent!==expected)throw Error(id+' '+desc+' incorrect tolerance');
checks.push(id+' '+desc);
}}
document.getElementById('element').value='Pier Head';document.getElementById('work-desc').value='Setting out';updateTolerance();
if(document.getElementById('tol-bar-text').textContent!=='Tolerance: ±0.005 m')throw Error('Other work criterion changed');
document.getElementById('element').value='Pot Bearing';onPierSelect('P-1093');updateTolerance();
const rows=_xlsxBuildRows();
return {checks,text:document.getElementById('tol-bar-text').textContent,xlsxHasText:JSON.stringify(rows).includes(expected)};
})()`);
assert.equal(result.xlsxHasText,true);console.log('PASS',result.checks.length,'Pot criteria cases + unchanged Pier Head + Excel text');
await new Promise(r=>setTimeout(r,1000));fs.writeFileSync('/tmp/pot-bearing-tolerance.png',await w.webContents.capturePage().then(i=>i.toPNG()));app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
