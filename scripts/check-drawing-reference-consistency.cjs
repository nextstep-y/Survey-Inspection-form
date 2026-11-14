const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:390,height:844,webPreferences:{partition:'drawing-consistency-'+Date.now()}});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
const audit=await w.webContents.executeJavaScript(`(()=>{const works=['Pile cap','Bored Pile','Pier Head','Bearing Plinths','Pot Bearing','Pier Column (1st-Lift)','Pier Column (2nd Lift)'],counts={},missing=[];for(const work of works){counts[work]=0;document.getElementById('element').value=work;for(const p of Object.values(PIERS_RAW)){const s=PilecapDrawingPrint.selectionFor(p.id,work);if(!s)continue;const r=getWorkDrawingReferences(p,work),merged=_getMergedPier(p);if(r.text!==s.text||merged.drawingText!==s.text)throw Error('Mismatch '+p.id+' '+work);if(s.records.length)counts[work]++;else missing.push({pier:p.id,work});}}applyDrawingRegisterRows([{type:'Pier Column',piers:'P-1093',drawingNo:'022038',revision:'Z',status:'VISUALLY REVIEWED'},{type:'Bearing Plinth',piers:'P-1093',drawingNo:'039999',revision:'Z',status:'VISUALLY REVIEWED'}]);dwgOverrides['P-1093']={dwg:'WRONG-SHEET',rev:'Z'};localDwgOverrides['P-1093']={dwg:'WRONG-LOCAL',rev:'Z'};for(const work of works){const r=getWorkDrawingReferences(PIERS_RAW['P-1093'],work);if(r.text.includes('WRONG')||r.text.includes('Rev.Z')||r.text.includes('039999'))throw Error('Override leaked '+work);}liveDrawingRegister={};return {counts,missing};})()`);
console.log('PASS all packaged Pier/work references',JSON.stringify(audit.counts));
for(const [id,work]of [['P-1132','Pile cap'],['P-1093','Pier Column (2nd Lift)'],['P-1092','Bearing Plinths'],['P-992','Pier Head'],['P-1093','Pot Bearing']]){
await w.webContents.executeJavaScript(`document.getElementById('element').value=${JSON.stringify(work)};onPierSelect(${JSON.stringify(id)});window.print=()=>{};window.alert=m=>{throw Error(m)};printDoc();`);
await new Promise(r=>setTimeout(r,100));
const read=await w.webContents.executeJavaScript(`(()=>{const attachment=document.querySelector('.drawing-print-attachments');return {form:document.getElementById('wi-drawing').textContent,hidden:document.getElementById('dwg-display').textContent,attached:attachment?.dataset.drawingReferences,pages:attachment?.children.length}})()`);
assert.equal(read.form,read.attached);assert.equal(read.hidden,read.attached);assert.ok(read.pages>0);
if(id==='P-1093'&&work==='Pot Bearing')fs.writeFileSync('/tmp/P-1093-drawing-consistency.pdf',await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
console.log('PASS screen/print/attachments',id,work,read.form);await new Promise(r=>setTimeout(r,2200));
}
const rejected=await w.webContents.executeJavaScript(`(async()=>{try{await PilecapDrawingPrint.prepare('P-1093','Pot Bearing',[{dwg:'WRONG',rev:'Z'}]);return false}catch(e){return e.message.includes('differ')}})()`);assert.ok(rejected);
fs.writeFileSync(path.resolve(__dirname,'../docs/drawing-reference-consistency-audit.json'),JSON.stringify({checked:'2026-11-14',...audit},null,2));
console.log('PASS stale-reference rejection');app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
