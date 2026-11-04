const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),path=require('path'),fs=require('fs');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:390,height:844});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
for(const width of [375,390,768,1280]){
w.setContentSize(width,900);
for(const work of ['Pier Head','Bearing Plinths','Pot Bearing','Column','Pile cap','Elastomeric']){
await w.webContents.executeJavaScript(`document.getElementById('element').value=${JSON.stringify(work)};onPierSelect('P-1092');`);
await new Promise(r=>setTimeout(r,150));
const d=await w.webContents.executeJavaScript(`(()=>{const r=document.getElementById('pile-array-section').getBoundingClientRect();return {viewport:innerWidth,scroll:document.documentElement.scrollWidth,direction:getComputedStyle(document.getElementById('main-content-wrapper')).flexDirection,columns:getComputedStyle(document.querySelector('.work-select-card .select-grid')).gridTemplateColumns.split(' ').length,modelRight:r.right}})()`);
if(width<=900){assert.ok(d.scroll<=d.viewport+1,JSON.stringify({width,work,...d}));assert.equal(d.columns,width<=420?1:2);assert.equal(d.direction,'column');assert.ok(d.modelRight<=width+1);}
console.log('PASS',width,work,JSON.stringify(d));
}
if(width===390){fs.mkdirSync(path.resolve(__dirname,'../output/mobile'),{recursive:true});fs.writeFileSync(path.resolve(__dirname,'../output/mobile/390.png'),(await w.webContents.capturePage()).toPNG());}
}
app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
