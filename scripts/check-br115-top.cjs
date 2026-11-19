const{app,BrowserWindow}=require('electron'),assert=require('assert/strict'),path=require('path'),fs=require('fs');
app.whenReady().then(async()=>{try{
const w=new BrowserWindow({show:false,width:1500,height:1100});w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));await w.loadFile(process.env.BR115_TEST_ENTRY||path.resolve(__dirname,'../index.html'));
const r=await w.webContents.executeJavaScript(`(async()=>{
 document.getElementById('structure-type').value='br115';onStructureTypeChange();document.querySelector('[data-action="clear"]').click();
 for(const name of ['PS70N','PS71N']){const e=[...document.querySelectorAll('[data-joint]')].find(e=>e.dataset.joint===name);e.checked=true;e.dispatchEvent(new Event('change'));}
 const bottom=currentArray.map(p=>({...p}));document.getElementById('in-z-0').value='113.111';calcDev(0);
 document.getElementById('element').value='BR115 Top of Top Slab';onWorkChange();updatePrintVals();
 const top=currentArray.map(p=>({...p})),row=document.querySelector('#survey-body tr');
 const out={bottom,top,rowZ:+row.dataset.ez,description:document.getElementById('wi-element').textContent,blank:document.getElementById('in-z-0').value,details:document.getElementById('br115-details').textContent};
 document.getElementById('in-z-0').value=(top[0].z+.005).toFixed(3);calcDev(0);out.dz=document.getElementById('dev-dz-0').textContent;
 const old=URL.createObjectURL;let blob;URL.createObjectURL=b=>{blob=b;return old(b)};exportDesign('csv');out.csv=await blob.text();URL.createObjectURL=old;out.xlsx=JSON.stringify(_xlsxBuildRows());
 const refs=getWorkDrawingReferences(currentPier,document.getElementById('element').value);out.refs=refs.refs.length;const attachment=await PilecapDrawingPrint.prepare('BR115','BR115 Top of Top Slab',refs.refs);out.pages=attachment.children.length;
 let title;window.print=()=>title=document.title;await printDoc();await new Promise(r=>setTimeout(r,100));out.title=title;out.attached=document.querySelectorAll('.drawing-print-page').length;
 document.getElementById('element').value='BR115 Bottom of Bottom Slab';onWorkChange();updatePrintVals();out.bottomRestored=document.getElementById('in-z-0').value;out.bottomID=currentArray[0].label;
 document.getElementById('element').value='BR115 Top of Top Slab';onWorkChange();updatePrintVals();out.topRestored=document.getElementById('in-z-0').value;
 return out;})()`);
assert.equal(r.top.length,6);assert.equal(r.blank,'');assert.equal(r.description,'BR115 Top of Top Slab');assert.equal(r.dz,'0.005');assert.equal(r.title,'BR115_Top_of_Top_Slab_PS70N_PS71N');assert.equal(r.bottomRestored,'113.111');assert.equal(r.topRestored,'118.737');assert.ok(r.bottomID.startsWith('B'));assert.ok(r.csv.includes('T013-L'));assert.ok(r.xlsx.includes('TOR - 0.650'));assert.equal(r.attached,r.refs);assert.equal(r.pages,r.refs);
for(let i=0;i<6;i++){const p=r.top[i],b=r.bottom[i];assert.ok(p.label.startsWith('T'));assert.ok(Math.abs(p.os-[-5.15,0,5.15][i%3])<1e-10);assert.ok(Math.abs(p.z-([118.732,119.452][Math.floor(i/3)]))<1e-9);assert.ok(Math.abs(r.rowZ-118.732)<1e-9);const c=r.top[Math.floor(i/3)*3+1];assert.ok(Math.abs(Math.hypot(p.n-c.n,p.e-c.e)-Math.abs(p.os))<1e-7);assert.ok(Math.abs(p.z-(b.z+(i<3?5.625:5.625)))<1e-9);}
fs.writeFileSync('/tmp/br115-top-test.pdf',await w.webContents.printToPDF({landscape:true,printBackground:true,preferCSSPageSize:true}));
await new Promise(r=>setTimeout(r,150));fs.writeFileSync('/tmp/br115-top-app.png',(await w.webContents.capturePage()).toPNG());console.log('PASS Top/Bottom isolation, TOR levels, +/-5.15 coordinates, exports, '+r.attached+' drawing pages',r.title);app.exit(0);
}catch(e){console.error(e);app.exit(1);}});
