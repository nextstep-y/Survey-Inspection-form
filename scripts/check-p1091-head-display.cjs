const {app,BrowserWindow}=require('electron');
const fs=require('fs');
const assert=require('assert/strict');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1100});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));
await w.loadFile(require('path').resolve(__dirname,'../index.html'));
const result=await w.webContents.executeJavaScript(`(()=>{
document.getElementById('element').value='Pier Head';onPierSelect('P-1091');
const p=currentPier,m=getPierHeadModel(p),t1=m.points.find(q=>q.label==='T1'),t3=m.points.find(q=>q.label==='T3');
const sign=getCanvasCamera(p,'Pier Head').chSign;
if(!((t1.modelCH??t1.ch)*sign>(t3.modelCH??t3.ch)*sign&&t1.z<t3.z))throw Error('T1 must be low and increasing-chainage-up');
if(Math.abs(t1.z-115.110)>1e-8||Math.abs(t3.z-115.710)>1e-8)throw Error('Approved levels changed');
if(Math.abs(t1.n-1677391.202)>.00051||Math.abs(t1.e-455095.942)>.00051)throw Error('Confirmed T1 coordinate incorrect');
if(Math.abs(t3.n-1677387.736)>.00051||Math.abs(t3.e-455096.426)>.00051)throw Error('Confirmed T3 coordinate incorrect');
const audit=[];for(const pier of Object.values(PIERS_RAW)){
const model=getPierHeadModel(pier),labels=model.points.map(q=>q.label);
if(new Set(labels).size!==labels.length)throw Error(pier.id+' duplicate point identity');
const a=model.points.find(q=>q.label==='T1'),b=model.points.find(q=>q.label==='T3');
if(a&&b)audit.push({pier:pier.id,t1Side:a.ch*getCanvasCamera(pier,'Pier Head').chSign>=b.ch*getCanvasCamera(pier,'Pier Head').chSign?'UP':'DOWN',t1Z:a.z,t3Z:b.z});
}
canvasViewMode='3d';drawPileArray(currentPier);
return {t1,t3,audit,label:pierHeadDisplayLabel(p,'T1')};})()`);
assert.equal(result.label,'T1 UP');
const csv=await w.webContents.executeJavaScript(`(async()=>{
let captured;const original=URL.createObjectURL;URL.createObjectURL=b=>{captured=b;return 'blob:test';};
const click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){};
try{exportDesign('csv');return await captured.text();}finally{URL.createObjectURL=original;HTMLAnchorElement.prototype.click=click;}
})()`);
assert.ok(csv.includes('T1,455095.942,1677391.202,115.110'));
assert.ok(csv.includes('T3,455096.426,1677387.736,115.710'));
fs.writeFileSync('/tmp/P-1091_Pier_Head_Design_corrected.csv',csv);
fs.writeFileSync('/tmp/pier-head-label-audit.json',JSON.stringify(result,null,2));
console.log('PASS P-1091 low/up T1, high/down T3; coordinates retained; identity audit',result.audit.length,'piers');
await new Promise(r=>setTimeout(r,1500));
assert.ok(await w.webContents.executeJavaScript(`document.getElementById('occ-col').getBoundingClientRect().right<=document.getElementById('pile-array-section').getBoundingClientRect().left+1`),'Work selector must not overlap model labels');
fs.writeFileSync('/tmp/p1091-head-display.png',await w.webContents.capturePage().then(i=>i.toPNG()));
app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
