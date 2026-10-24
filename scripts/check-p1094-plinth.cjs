const {app,BrowserWindow}=require('electron'),fs=require('fs'),assert=require('assert/strict');
const controls={UL:[.925,-1.7,.510,.610,.750],UR:[.925,1.7,.510,.610,.750],DL:[-.925,-2.4,1.040,1.040,.124],DR:[-.925,2.4,1.110,1.110,.124]};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1050,webPreferences:{sandbox:true,partition:'p1094-'+Date.now()}});try{
 await w.loadURL(process.env.QA_URL||'file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
 for(const type of ['TYPE1','TYPE2']){
  await w.webContents.executeJavaScript(`if(!document.getElementById('bearing-type')){const e=document.createElement('input');e.id='bearing-type';document.body.append(e)}document.getElementById('bearing-type').value='${type}';document.getElementById('element').value='Bearing Plinths';onPierSelect('P-1094');setCanvasViewMode('2d');void 0;`);
  const d=await w.webContents.executeJavaScript(`({points:currentArray,top:getTopOfColumnElevation(currentPier),pi:{n:currentPier.n,e:currentPier.e,deg:currentPier.deg,min:currentPier.min,sec:currentPier.sec},rows:[...document.querySelectorAll('#survey-body tr')].map(r=>({n:+r.dataset.dn,e:+r.dataset.de,z:+r.dataset.ez})),twice:expandBearingPlinthEdges(currentArray)})`);
  assert.equal(d.points.length,16);assert.deepEqual(d.twice,d.points,'No double expansion');
  for(const [name,[ch,os,sizeCH,sizeOS,rise]]of Object.entries(controls)){
   const ps=d.points.filter(p=>p.label.replace(/\d+$/,'')===name);assert.equal(ps.length,4);
   near(ps.reduce((s,p)=>s+p.ch,0)/4,ch);near(ps.reduce((s,p)=>s+p.os,0)/4,os);
   near(Math.max(...ps.map(p=>p.ch))-Math.min(...ps.map(p=>p.ch)),sizeCH);near(Math.max(...ps.map(p=>p.os))-Math.min(...ps.map(p=>p.os)),sizeOS);
   ps.forEach(p=>near(d.rows[d.points.indexOf(p)].z,d.top+rise));
  }
  const a=(d.pi.deg+d.pi.min/60+d.pi.sec/3600)*Math.PI/180;
  const csv=await w.webContents.executeJavaScript(`(async()=>{let blob;const old=URL.createObjectURL,click=HTMLAnchorElement.prototype.click;URL.createObjectURL=b=>{blob=b;return 'blob:qa'};HTMLAnchorElement.prototype.click=function(){};try{exportDesign('csv');return await blob.text()}finally{URL.createObjectURL=old;HTMLAnchorElement.prototype.click=click}})()`);
  csv.split('\n').forEach((line,i)=>{const q=line.split(','),p=d.points[i];assert.equal(q[0],p.label);assert.equal(q[1],(d.pi.e-p.ch*Math.cos(a)+p.os*Math.sin(a)).toFixed(3));assert.equal(q[2],(d.pi.n+p.ch*Math.sin(a)+p.os*Math.cos(a)).toFixed(3));assert.equal(q[3],d.rows[i].z.toFixed(3));});
  fs.writeFileSync('/tmp/p1094-plinth-2d.png',Buffer.from((await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').toDataURL()`)).split(',')[1],'base64'));
  await w.webContents.executeJavaScript(`setCanvasViewMode('3d');void 0;`);for(let i=0;i<100;i++){if(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource==='Blender'`))break;await new Promise(r=>setTimeout(r,100));}
  assert.equal(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource`),'Blender');
  fs.writeFileSync('/tmp/p1094-plinth-3d.png',Buffer.from((await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').toDataURL()`)).split(',')[1],'base64'));
  console.log('PASS',type,'dimensions, centers, unchanged levels, once-only expansion, CSV, Blender');
 }
 app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
