const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1100,webPreferences:{sandbox:true,partition:'confirmed-levels-'+Date.now()}});try{
 w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));
 await w.loadURL('file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
 const ids=await w.webContents.executeJavaScript(`Object.values(PIERS_RAW).filter(p=>{const ps=_orientPierSpecificPoints(p,'Bearing Plinths',ARRAYS_RAW[WORK_ARRAY_KEY['Bearing Plinths'](p)]||[],false);return ps.length&&ps.every(q=>getConfirmedPlinthRise(p,q.label)!==null)}).map(p=>p.id)`);
 assert.equal(ids.length,71);
 await w.webContents.executeJavaScript(`applyReferenceRecords({'P-992':{topPier:90.905,t:{T2:90.905}},'P-1051':{topPier:103.300,t:{T2:103.300}}});applyBearingElevationRules(${JSON.stringify(ids.flatMap(pier=>[{pier,work:'Bearing Plinths',pointGroup:'*',height:.14,reference:'Top of Pier'},{pier,work:'Elastomeric',pointGroup:'*',height:.9,reference:'Top of Pier'}]))});void 0;`);
 const top=await w.webContents.executeJavaScript(`['P-992','P-1051'].map(id=>({id,raw:PIERS_RAW[id].topPier,top:getTopOfColumnElevation(PIERS_RAW[id])}))`);
 assert.equal(top[0].top,89.905);assert.equal(top[0].raw,89.905);assert.equal(top[1].top,103.238);assert.equal(top[1].raw,103.238);
 let points=0;
 for(const id of ids)for(const type of ['TYPE1','TYPE2']){
  const r=await w.webContents.executeJavaScript(`(()=>{if(!document.getElementById('bearing-type')){const x=document.createElement('input');x.id='bearing-type';document.body.append(x)}document.getElementById('bearing-type').value='${type}';document.getElementById('element').value='Bearing Plinths';onPierSelect(${JSON.stringify(id)});const p=currentPier;return {top:getTopOfColumnElevation(p),family:BEARING_PLINTH_DRAWING_AUDIT.piers[p.id],points:currentArray,rows:[...document.querySelectorAll('#survey-body tr')].map(r=>({z:r.cells[5].textContent.trim()})),el:currentArray.map(q=>getWorkPointElev(p,'Elastomeric','E'+q.label)),record:window.BEARING_BLENDER_MANIFEST.records[p.id+'|${type}']}})()`);
  r.points.forEach((p,i)=>{
   const base=id.trim().replace(/[LR]$/,''),isP6=['P-992','P-993','P-1021','P-1022','P-1130','P-1131'].includes(id);
   const up=/^U/.test(p.label);
   const rise=r.family==='P2'?.150:base==='P-976'?.112:base==='P-977'?(!up?.112:/^(UL(?:9|10|11|12)|UR[1-4])$/.test(p.label)?.140:.150):['P-1121','P-990'].includes(base)?(up?.097:.112):base==='P-1142'?.140:['P-967','P-967A','P-968'].includes(id)?.097:['P-969','P-991','P-1122'].includes(id)?(up?.140:.097):['P-974','P-1106'].includes(id)?(up?.097:.140):['P-975','P-1107'].includes(id)?(up?.112:.097):isP6?(up===['P-992','P-1021','P-1130'].includes(id)?.049:.740):NaN;
   const z=+(r.top+rise).toFixed(6);assert.equal(r.rows[i].z,z.toFixed(3),id+' '+p.label);assert.ok(Math.abs(r.el[i]-z-.067)<1e-7);assert.ok(Math.abs(r.record.points.find(q=>q.label===p.label).z-z)<1e-7);points++;
  });
  const csv=await w.webContents.executeJavaScript(`(async()=>{let b;const old=URL.createObjectURL,click=HTMLAnchorElement.prototype.click;URL.createObjectURL=x=>{b=x;return 'blob:qa'};HTMLAnchorElement.prototype.click=function(){};try{exportDesign('csv');return await b.text()}finally{URL.createObjectURL=old;HTMLAnchorElement.prototype.click=click}})()`);
  csv.split('\n').forEach((s,i)=>assert.equal(s.split(',')[3],r.rows[i].z));
 }
 let partialPointChecks=0;
 for(const id of ['P-1108 ','P-1108L','P-1108R','P-1120','P-1120L','P-1120R']){
  for(const work of ['Bearing Plinths','Elastomeric']){
   const r=await w.webContents.executeJavaScript(`(()=>{document.getElementById('element').value='${work}';onPierSelect(${JSON.stringify(id)});return {top:getTopOfColumnElevation(currentPier),points:currentArray.map(p=>({label:p.label,rise:getConfirmedPlinthRise(currentPier,p.label),z:getWorkPointElev(currentPier,'${work}',p.label)})),text:document.getElementById('bearing-footprint-audit')?.textContent||''}})()`);
   assert.ok(r.text.includes('LEVELS PARTIAL - Type2 heights NOT VERIFIED'),id+' warning missing');
   const is1108=id.trim().replace(/[LR]$/,'')==='P-1108';
   for(const p of r.points){const q=p.label.replace(/^E/,''),up=/^U/.test(q),middle=(is1108?/^(UL(?:9|10|11|12)|UR[1-4])$/:/^(DL(?:9|10|11|12)|DR[1-4])$/).test(q);const expected=is1108?(!up?.112:middle?.140:null):(up?.112:middle?.140:null);assert.equal(p.rise,expected,id+' '+p.label);if(expected!==null){assert.ok(Math.abs(p.z-r.top-expected-(work==='Elastomeric'?.067:0))<1e-7);partialPointChecks++;}}
  }
 }
 for(const id of ['P-978NB','P-976','P-1121','P-992','P-993','P-1021','P-1022','P-1130','P-1131','P-990','P-1142','P-977']){
  await w.webContents.executeJavaScript(`document.getElementById('bearing-type').value='TYPE1';document.getElementById('element').value='Bearing Plinths';onPierSelect('${id}');setCanvasViewMode('3d');void 0;`);
  for(let i=0;i<80;i++){if(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource==='Blender'`))break;await new Promise(r=>setTimeout(r,100));}
  assert.equal(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource`),'Blender',id);
  if(['P-992','P-993','P-990','P-1142','P-977'].includes(id))fs.writeFileSync('/tmp/'+id+'-confirmed-level.png',Buffer.from((await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').toDataURL()`)).split(',')[1],'base64'));
 }
 const locked={'P-992':89.905,'P-993':90.372,'P-1021':100.645,'P-1022':100.751,'P-1051':103.238,'P-1130':115.780,'P-1131':115.560};
 for(const [id,z]of Object.entries(locked)){const got=await w.webContents.executeJavaScript(`(()=>{applyReferenceRecords({'${id}':{topPier:${z+1},t:{}}});return [PIERS_RAW['${id}'].topPier,getTopOfColumnElevation(PIERS_RAW['${id}'])]})()`);assert.equal(got[0],z);assert.equal(got[1],z);}
 console.log(JSON.stringify({records:ids.length,typeCases:ids.length*2,pointLevelChecks:points,partialPointChecks,topOverrides:7,staleOnlineRules:'blocked',csv:'PASS',blenderSamples:12,status:'PASS'}));app.exit(0);
 }catch(e){console.error(e);app.exit(1)}});
