const{app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
app.whenReady().then(async()=>{try{
const w=new BrowserWindow({show:false,width:1500,height:1100});w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));await w.loadFile(process.env.BR115_TEST_ENTRY||path.resolve(__dirname,'../index.html'));
const out=await w.webContents.executeJavaScript(`(async()=>{
 document.getElementById('structure-type').value='br115';onStructureTypeChange();document.querySelector('[data-action="clear"]').click();
 for(const name of ['P2S','PS70S','PS70N','P2N']){const e=[...document.querySelectorAll('[data-joint]')].find(e=>e.dataset.joint===name);e.checked=true;e.dispatchEvent(new Event('change'));}
 setCanvasViewMode('3d');const canvas=document.getElementById('pile-canvas'),model=JSON.parse(canvas.dataset.br115Model),before=canvas.toDataURL();
 const raw=currentArray.map(p=>({id:p.label,n:p.n,e:p.e,z:p.z}));
 const capture=canvas.setPointerCapture;canvas.setPointerCapture=()=>{};canvas.onpointerdown({clientX:0,clientY:0,pointerId:1});canvas.onpointermove({clientX:80,clientY:30});canvas.onpointerup();canvas.setPointerCapture=capture;
 const rotated=canvas.toDataURL()!==before;
 setCanvasViewMode('2d');const plan=!canvas.dataset.br115Model&&canvas.onpointermove===null;
 setCanvasViewMode('3d');document.getElementById('br115-3d-reset').click();const reset=canvas.toDataURL()===before;
 document.getElementById('element').value='BR115 Top of Slab';onWorkChange();updatePrintVals();const top=JSON.parse(canvas.dataset.br115Model);
 const focus=document.getElementById('br115-point-focus');focus.value=top.points[1].id;focus.dispatchEvent(new Event('change'));const highlighted=JSON.parse(canvas.dataset.br115Model).focused;
 const box=JSON.parse(canvas.dataset.br115Model).labelBoxes.find(b=>b.id===highlighted),rect=canvas.getBoundingClientRect();canvas.onpointerdown({clientX:rect.left+(box.x+box.w/2)*rect.width/1100,clientY:rect.top+(box.y+box.h/2)*rect.height/360});const cleared=JSON.parse(canvas.dataset.br115Model).focused===null;
 openCanvasPreview();const enlarged=document.getElementById('canvas-preview').open;document.getElementById('canvas-preview').close();
 return{model,raw,top,rotated,plan,reset,enlarged,highlighted,cleared,controls:getComputedStyle(document.getElementById('canvas-view-controls')).display};
})()`);
assert.deepEqual(out.model.points,out.raw);assert.equal(out.model.points.length,12);assert.equal(out.highlighted,out.top.points[1].id);assert.equal(out.cleared,true);
for(const a of out.model.labelBoxes)for(const b of out.model.labelBoxes){if(a.id===b.id)continue;assert.ok(!(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y),'Labels overlap: '+a.id+' / '+b.id);}assert.equal(out.rotated,true);assert.equal(out.plan,true);assert.equal(out.reset,true);assert.equal(out.enlarged,true);assert.equal(out.controls,'flex');assert.equal(out.top.points.length,12);assert.ok(out.top.points.every(p=>p.id.startsWith('T')));
await new Promise(r=>setTimeout(r,150));fs.writeFileSync('/tmp/br115-3d-app.png',(await w.webContents.capturePage()).toPNG());
await w.webContents.executeJavaScript(`window.print=()=>{};const el=document.getElementById('br115-attach-drawings');el.checked=false;el.dispatchEvent(new Event('change'));printDoc();`);await new Promise(r=>setTimeout(r,250));fs.writeFileSync('/tmp/br115-3d-test.pdf',await w.webContents.printToPDF({landscape:true,preferCSSPageSize:true,printBackground:true}));console.log('PASS 3D points/rotate/reset/2D/Top/enlarge/print',out.model.labels.length,'Bottom IDs labelled',out.top.labels.length,'Top IDs labelled');app.exit(0);
}catch(e){console.error(e);app.exit(1);}});
