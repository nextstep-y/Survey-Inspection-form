const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1050,webPreferences:{sandbox:true,partition:'cap-labels-'+Date.now()}});try{
 await w.loadURL(process.env.QA_URL||'file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
 await w.webContents.executeJavaScript(`window.qaLabels=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t,...args){qaLabels.push(String(t));return original.call(this,t,...args)};void 0;`);
 for(const id of ['P-826','P-888','P-1091','P-1142']){
  await w.webContents.executeJavaScript(`document.getElementById('element').value='Pile cap';onPierSelect('${id}');void 0;`);
  const before=await w.webContents.executeJavaScript(`JSON.stringify(currentArray)`);
  for(const mode of ['2d','3d']){
   await w.webContents.executeJavaScript(`qaLabels=[];setCanvasViewMode('${mode}');void 0;`);
   if(mode==='3d'){
    for(let i=0;i<150;i++){if(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource==='Blender'`))break;await new Promise(r=>setTimeout(r,200));}
    assert.equal(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource`),'Blender');
   }
   const labels=await w.webContents.executeJavaScript('qaLabels');assert.ok(!labels.some(t=>/^P\d+[A-Za-z]?$/.test(t)),id+' '+mode+' pile label');
   assert.equal(await w.webContents.executeJavaScript('JSON.stringify(currentArray)'),before,'No table/coordinate mutation');
   fs.writeFileSync('/tmp/'+id+'-cap-'+mode+'.png',Buffer.from((await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').toDataURL()`)).split(',')[1],'base64'));
  }
  await w.webContents.executeJavaScript(`document.getElementById('element').value='Bored Pile';onPierSelect('${id}');setCanvasViewMode('2d');qaLabels=[];drawPileArray(currentPier);void 0;`);
  assert.ok((await w.webContents.executeJavaScript('qaLabels')).some(t=>/^P\d+[A-Za-z]?$/.test(t)),'Bored Pile work keeps labels');
  console.log('PASS',id,'2D/3D hidden pile labels; unchanged table; Bored Pile labels retained');
 }
 app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
