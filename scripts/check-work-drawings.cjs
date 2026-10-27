const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1050,webPreferences:{sandbox:true,partition:'work-drawings-'+Date.now()}});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));
await w.loadURL('file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
const result=await w.webContents.executeJavaScript(`(()=>{
 const checks=[];const check=(condition,msg)=>{if(!condition)throw Error(msg);checks.push(msg)};
 const p=PIERS_RAW['P-1092'];
 const refs=work=>getWorkDrawingReferences(p,work);
 check(refs('Pier Head').refs.some(r=>r.dwg.endsWith('023167')&&r.rev==='B'),'head plan');
 check(refs('Bearing Plinths').refs[0].dwg.endsWith('038136')&&refs('Bearing Plinths').refs[0].rev==='C','Plinth detail takes priority');
 check(refs('Pot Bearing').refs.length===2&&refs('Pot Bearing').refs.every(r=>r.rev==='B'),'two Pot details with own revisions');
 check(refs('Pot Bearing').refs.some(r=>r.dwg.endsWith('066056')),'S5 detail');
 check(getWorkDrawingReferences(PIERS_RAW['P-992'],'Pier Head').refs.map(r=>r.rev).join(',')==='E,D,E','mixed revisions retained');
 check(getWorkDrawingReferences(PIERS_RAW['P-1049'],'Pier Head').status==='NOT VERIFIED','unconfirmed head not guessed');
 check(getWorkDrawingReferences(PIERS_RAW['P-826'],'Pot Bearing').status==='NOT VERIFIED','unsupported Pot no generic fallback');
 dwgOverrides[p.id]={dwg:'WRONG-COLUMN',rev:'99'};localDwgOverrides[p.id]={dwg:'WRONG-LOCAL',rev:'99'};
 document.getElementById('element').value='Pier Head';check(!_getMergedPier(p).drawingText.includes('WRONG'),'generic Sheet/local cannot replace work refs');
 applyDrawingRegisterRows([
 {type:'Bearing Plinth',piers:'P-826',drawingNo:'NSCR-ITD-N03-ZWD-DWG-ST-039999',revision:'C',status:'VISUALLY REVIEWED'},
 {type:'Bearing Plinth',piers:'P-826',drawingNo:'039998',revision:'D',status:'VISUALLY REVIEWED'},
 {type:'Bearing Plinth',piers:'P-826',drawingNo:'000001',revision:'Z',status:'PENDING'},
 {type:'Pot Bearing',piers:'P-826',drawingNo:'not a number',revision:'A',status:'VISUALLY REVIEWED'}]);
 const imported=getWorkDrawingReferences(PIERS_RAW['P-826'],'Bearing Plinths');
 check(imported.refs.filter(r=>r.source==='Reviewed Drawing Register').length===2,'multiple typed detail rows retained');
 check(!imported.text.includes('000001')&&!imported.text.includes('NSCR-ITD-N03-ZWD-DWG-ST-NSCR'),'pending/duplicate prefix rejected');
 let records=0;for(const pier of Object.values(PIERS_RAW))for(const work of ['Pier Head','Bearing Plinths','Pot Bearing']){
 const r=getWorkDrawingReferences(pier,work);check(r&&r.text.length>0,pier.id+' '+work);
 for(const item of r.refs)if(!/^NSCR-[A-Z0-9-]+-\\d{6}$/.test(item.dwg))throw Error('Invalid drawing '+item.dwg);
 records++;}
 liveDrawingRegister={};return {checks:checks.length,records};})()`);
for(const [id,work] of [['P-1092','Pier Head'],['P-1092','Bearing Plinths'],['P-1092','Pot Bearing'],['P-992','Pier Head'],['P-1049','Pier Head']]){
const r=await w.webContents.executeJavaScript(`(()=>{document.getElementById('element').value='${work}';onPierSelect('${id}');return {a:document.getElementById('dwg-display').textContent,b:document.getElementById('wi-drawing').textContent,expected:getWorkDrawingReferences(currentPier,'${work}').text}})()`);
assert.equal(r.a,r.expected);assert.equal(r.b,r.expected);
if(id==='P-992'){fs.writeFileSync('/tmp/p6-work-drawings.pdf',await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));}
console.log('PASS',id,work,r.a);
}
await new Promise(r=>setTimeout(r,500));
await w.loadURL('file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
await w.webContents.executeJavaScript(`document.getElementById('element').value='Bearing Plinths';onPierSelect('P-1092');openDwgPanel();void 0;`);
assert.ok(await w.webContents.executeJavaScript(`document.getElementById('dwg-panel-current').textContent.includes('Plinth reinforcement / height')`));
fs.writeFileSync('/tmp/work-drawings-panel.png',await w.webContents.capturePage().then(x=>x.toPNG()));
console.log(JSON.stringify({...result,status:'PASS'}));app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
