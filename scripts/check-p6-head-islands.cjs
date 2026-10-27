const {app,BrowserWindow}=require('electron'),fs=require('fs'),assert=require('assert/strict');
// Independent source transcription: 023240-D, 023241-E, 039531-E.
const cases=[['P-992',89.905,-1],['P-993',90.372,1],['P-1021',100.645,-1],['P-1022',100.751,1],['P-1130',115.780,-1],['P-1131',115.560,1]];
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1100,webPreferences:{sandbox:true,partition:'p6-head-'+Date.now()}});try{
 w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));await w.loadURL('file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');let checks=0;
 for(const [id,top,sign]of cases){
  const expected=[['T1',1.75,0],['T2',sign*.35,3.3],['T3',-1.75,0],['T4',sign*.35,-3.3],['T5',-1.75,.6],['T6',1.75,.6],['T7',1.75,-.6],['T8',-1.75,-.6]];
  for(const stale of [false,true]){
   if(stale)await w.webContents.executeJavaScript(`applyReferenceRecords({'${id}':{topPier:999,t:{T1:999,T2:999,T3:999,T4:999,T5:999,T6:999,T7:999,T8:999}}});void 0;`);
   const data=await w.webContents.executeJavaScript(`(()=>{document.getElementById('element').value='Pier Head';onPierSelect('${id}');setCanvasViewMode('2d');return {points:currentArray,rows:[...document.querySelectorAll('#survey-body tr')].map(r=>({label:r.cells[0].textContent.trim(),n:r.cells[3].textContent.trim(),e:r.cells[4].textContent.trim(),z:r.cells[5].textContent.trim()})),pier:{n:currentPier.n,e:currentPier.e,angle:currentPier.deg+currentPier.min/60+currentPier.sec/3600},g:window.StructuralBlender.build(currentPier,'Pier Head'),islands:window.StructuralBlender.islandsFor(currentPier)}})()`);
   const a=data.pier.angle*Math.PI/180;
   for(const [label,ch,os]of expected){
    const p=data.points.find(p=>p.label===label),r=data.rows.find(r=>r.label===label),boundary=['T2','T4'].includes(label),z=top+(boundary?.6:(ch*sign>0?.9:.3));
    assert.equal(p.ch,ch);assert.equal(p.os,os);assert.equal(r.z,z.toFixed(3),id+' '+label);assert.equal(r.n,(data.pier.n+ch*Math.sin(a)+os*Math.cos(a)).toFixed(3));assert.equal(r.e,(data.pier.e-ch*Math.cos(a)+os*Math.sin(a)).toFixed(3));checks++;
   }
   assert.equal(data.g.islandMissing,false);assert.equal(data.islands.missing,false);assert.equal(data.islands.surfaces.length,2);
   assert.deepEqual(data.islands.surfaces.map(s=>+s.top.toFixed(3)).sort(),[.3,.9]);
   const span=data.islands.surfaces.map(s=>+(Math.max(...s.ring.map(p=>p.ch))-Math.min(...s.ring.map(p=>p.ch))).toFixed(3)).sort();assert.deepEqual(span,[1.4,2.1]);
   for(const s of data.islands.surfaces){assert.ok(Math.abs(s.top-s.bottom-.3)<1e-7);assert.equal(Math.max(...s.ring.map(p=>p.os))-Math.min(...s.ring.map(p=>p.os)),1.2);}
   const csv=await w.webContents.executeJavaScript(`(async()=>{let b;const old=URL.createObjectURL,click=HTMLAnchorElement.prototype.click;URL.createObjectURL=x=>{b=x;return 'blob:qa'};HTMLAnchorElement.prototype.click=function(){};try{exportDesign('csv');return await b.text()}finally{URL.createObjectURL=old;HTMLAnchorElement.prototype.click=click}})()`);
   csv.split('\n').filter(s=>/^T\d+,/.test(s)).forEach(s=>{const [label,e,n,z]=s.split(','),r=data.rows.find(r=>r.label===label);assert.equal(z,r.z);assert.equal(n,r.n);assert.equal(e,r.e)});
  }
  fs.writeFileSync('/tmp/'+id+'-p6-head-2d.png',Buffer.from((await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').toDataURL()`)).split(',')[1],'base64'));
  await w.webContents.executeJavaScript(`setCanvasViewMode('3d');void 0;`);for(let k=0;k<80;k++){if(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource==='Blender'`))break;await new Promise(r=>setTimeout(r,100));}
  assert.equal(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource`),'Blender',id);
  fs.writeFileSync('/tmp/'+id+'-p6-head-3d.png',Buffer.from((await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').toDataURL()`)).split(',')[1],'base64'));console.log('PASS',id,'T1-T8, joint, Island, N/E/Z table/CSV, stale Sheet, Blender');
 }
 console.log(JSON.stringify({piers:6,tPointCases:checks,status:'PASS'}));app.exit(0);
 }catch(e){console.error(e);app.exit(1)}});
