const {app,BrowserWindow}=require('electron'),assert=require('assert/strict');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1050,webPreferences:{sandbox:true,partition:'plinth-all-'+Date.now()}});try{
 w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));
 await w.loadURL('file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
 const ids=await w.webContents.executeJavaScript('Object.values(PIERS_RAW).filter(p=>getDrawingPlinthControl(p)).map(p=>p.id)');let total=0;
 for(const id of ids){
  const result=await w.webContents.executeJavaScript(`(()=>{document.getElementById('element').value='Bearing Plinths';onPierSelect(${JSON.stringify(id)});setCanvasViewMode('2d');const ps=currentArray,rs=[...document.querySelectorAll('#survey-body tr')];return {id:currentPier.id,n:ps.length,rows:rs.length,finite:rs.every(r=>Number.isFinite(+r.dataset.dn)&&Number.isFinite(+r.dataset.de)&&Number.isFinite(+r.dataset.ez)),warning:document.getElementById('bearing-footprint-audit').textContent}})()`);
  assert.equal(result.id,id);assert.equal(result.n,result.rows);assert.ok(result.finite);assert.match(result.warning,/FOOTPRINT AUDIT/);total+=result.rows;
 }
 for(const id of ['P-826','P-978NB','P-967','P-990','P-1100','P-1142','P-1092','P-1093']){
  await w.webContents.executeJavaScript(`document.getElementById('element').value='Bearing Plinths';onPierSelect('${id}');setCanvasViewMode('3d');void 0;`);
  for(let i=0;i<50;i++){if(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource==='Blender'`))break;await new Promise(r=>setTimeout(r,100));}
  assert.equal(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource`),'Blender',id+' 3D');
 }
 console.log(JSON.stringify({uiPiers:ids.length,tableRows:total,representative3d:8,status:'PASS'}));app.exit(0);
 }catch(e){console.error(e);app.exit(1)}});
