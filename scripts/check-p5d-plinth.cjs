const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs');
const ids=['P-976','P-977','P-1101','P-1102','P-1103','P-1108','P-1120','P-1121'];
const counts=[32,40,16,16,16,40,40,28];
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1100,webPreferences:{sandbox:true,partition:'p5d-'+Date.now()}});try{
 w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));
 await w.loadURL('file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
 let rows=0;
 for(const [j,base]of ids.entries()){
  let reference;
  for(const suffix of ['','L','R']){
   const id=base==='P-1108'&&!suffix?base+' ':base+suffix;
   const data=await w.webContents.executeJavaScript(`(()=>{document.getElementById('element').value='Bearing Plinths';onPierSelect(${JSON.stringify(id)});setCanvasViewMode('2d');const a=currentArray,p=currentPier,r=[...document.querySelectorAll('#survey-body tr')];return {id:p.id,points:a,origin:{n:p.n,e:p.e,wcb:p.deg+p.min/60+p.sec/3600},ref:p5dHeadReference(p),rows:r.map(x=>({n:+x.dataset.dn,e:+x.dataset.de,z:+x.dataset.ez})),warning:document.getElementById('bearing-footprint-audit').textContent}})()`);
   assert.equal(data.rows.length,counts[j]);assert.match(data.warning,/FOOTPRINT AUDIT/);assert.equal(new Set(data.points.map(p=>p.label)).size,counts[j]);
   const angle=data.origin.wcb*Math.PI/180;
   data.points.forEach((p,i)=>{const r=data.rows[i];assert.ok(Math.abs(r.n-(data.origin.n+p.ch*Math.sin(angle)+p.os*Math.cos(angle)))<.00051,JSON.stringify({id,p,r,origin:data.origin}));assert.ok(Math.abs(r.e-(data.origin.e-p.ch*Math.cos(angle)+p.os*Math.sin(angle)))<.00051);});
   const csv=await w.webContents.executeJavaScript(`(async()=>{let blob;const old=URL.createObjectURL,click=HTMLAnchorElement.prototype.click;URL.createObjectURL=b=>{blob=b;return 'blob:qa'};HTMLAnchorElement.prototype.click=function(){};try{exportDesign('csv');return await blob.text()}finally{URL.createObjectURL=old;HTMLAnchorElement.prototype.click=click}})()`);
   const displayed=await w.webContents.executeJavaScript(`[...document.querySelectorAll('#survey-body tr')].map(r=>({n:r.cells[3].textContent.trim(),e:r.cells[4].textContent.trim()}))`);
   csv.split('\n').forEach((line,i)=>{const a=line.split(',');assert.equal(a[1],displayed[i].e);assert.equal(a[2],displayed[i].n);});
   const world=displayed;
   if(reference)assert.deepEqual(world,reference,base+' L/R must share the same physical combined-head points');else reference=world;
   if(base==='P-1121'){assert.equal(data.ref.e,454880.370);assert.equal(data.ref.n,1678492.912);}
   await w.webContents.executeJavaScript('setCanvasViewMode("3d");void 0;');
   for(let k=0;k<80;k++){if(await w.webContents.executeJavaScript('document.getElementById("pile-canvas").dataset.modelSource==="Blender"'))break;await new Promise(r=>setTimeout(r,100));}
   assert.equal(await w.webContents.executeJavaScript('document.getElementById("pile-canvas").dataset.modelSource'),'Blender',id);
   if(!suffix)fs.writeFileSync('/tmp/'+base+'-p5d-plinth.png',Buffer.from((await w.webContents.executeJavaScript('document.getElementById("pile-canvas").toDataURL()')).split(',')[1],'base64'));
   rows+=data.rows.length;console.log('PASS',id,data.rows.length,'points, table/CSV, common head origin, Blender');
  }
 }
 console.log(JSON.stringify({records:24,rows,status:'PASS'}));app.exit(0);
 }catch(e){console.error(e);app.exit(1)}});
