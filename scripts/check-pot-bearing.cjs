const {app,BrowserWindow}=require('electron'),fs=require('fs'),assert=require('assert/strict');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1050,webPreferences:{sandbox:true,partition:'pot-'+Date.now()}});try{
 await w.loadURL('file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
 const errors=[];w.webContents.on('console-message',(_e,level,message)=>{if(level>=3)errors.push(message)});
 for(const [id,ch,os,rise,types,dims,heights] of [
  ['P-1091',.925,2.4,.124,['S3','S1'],[[.595,.815],[.630,1.025]],[.143,.147]],
  ['P-1092',0,2,.120,['S5','S4'],[[1.865,1.250],[1.480,1.480]],[.269,.245]],
  ['P-1093',0,2,.120,['S6','S2'],[[1.165,1.275],[1.250,1.675]],[.250,.269]],
  ['P-1094',-.925,2.4,.124,['S3','S1'],[[.595,.815],[.630,1.025]],[.143,.147]]
 ]){
  await w.webContents.executeJavaScript(`document.getElementById('element').value='Pot Bearing';onPierSelect('${id}');void 0;`);
  const data=await w.webContents.executeJavaScript(`({points:currentArray,rows:[...document.querySelectorAll('#survey-body tr')].map(r=>({n:Number(r.dataset.dn),e:Number(r.dataset.de)})),top:getTopOfColumnElevation(currentPier),pier:{n:currentPier.n,e:currentPier.e,deg:currentPier.deg,min:currentPier.min,sec:currentPier.sec}})`);
  assert.equal(data.rows.length,8);const a=(data.pier.deg+data.pier.min/60+data.pier.sec/3600)*Math.PI/180;
  for(let j=0;j<2;j++){
   const p=data.points.slice(j*4,j*4+4),center=(j?1:-1)*os;
   assert.equal(p[0].bearing,types[j]);assert.ok(Math.abs(p.reduce((s,x)=>s+x.ch,0)/4-ch)<1e-10);
   assert.ok(Math.abs(p.reduce((s,x)=>s+x.os,0)/4-center)<1e-10);
   assert.ok(Math.abs(p[0].ch-p[2].ch-dims[j][1])<1e-10);assert.ok(Math.abs(p[3].os-p[1].os-dims[j][0])<1e-10);
   const plinth=rise+(id==='P-1092'&&j===1?.004:0)+(id==='P-1093'&&j===0?-.001:0);
   assert.ok(Math.abs(p[0].z-data.top-plinth-.050-heights[j])<1e-10);
   assert.equal(p[0].bottomGrout,.050);assert.equal(p[0].plinthRise,plinth);
   assert.ok(p.reduce((s,x,k)=>{const y=p[(k+1)%4];return s+x.os*y.ch-y.os*x.ch},0)>0);
  }
  data.points.forEach((p,i)=>{assert.ok(Math.abs(data.rows[i].n-(data.pier.n+p.ch*Math.sin(a)+p.os*Math.cos(a)))<.00006);assert.ok(Math.abs(data.rows[i].e-(data.pier.e-p.ch*Math.cos(a)+p.os*Math.sin(a)))<.00006)});
  await w.webContents.executeJavaScript(`setCanvasViewMode('3d');void 0;`);
  for(let tries=0;tries<50;tries++){if(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource==='Blender'`))break;await new Promise(r=>setTimeout(r,100));}
  assert.equal(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource`),'Blender');
  assert.deepEqual(await w.webContents.executeJavaScript(`currentArray`),data.points);
  fs.writeFileSync('/tmp/pot-'+id+'.png',Buffer.from((await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').toDataURL()`)).split(',')[1],'base64'));
  await w.webContents.executeJavaScript(`window.desktopPrint={exportPdf:()=>new Promise(()=>{})};printDoc();void 0;`);await new Promise(r=>setTimeout(r,200));
  fs.writeFileSync('/tmp/pot-'+id+'.pdf',await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
  console.log(id,'PASS',types.join('/'));
  await w.loadURL('file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
 }
 for(const type of ['TYPE1','TYPE2'])for(const work of ['Bearing Plinths','Elastomeric']){
  await w.webContents.executeJavaScript(`if(!document.getElementById('bearing-type')){const input=document.createElement('input');input.id='bearing-type';input.type='hidden';document.body.append(input)}document.getElementById('bearing-type').value='${type}';document.getElementById('element').value='${work}';onPierSelect('P-1092');void 0;`);
  const rows=await w.webContents.executeJavaScript(`({top:currentPier.topPier,points:currentArray.map(p=>({label:p.label,z:getWorkPointElev(currentPier,'${work}',p.label)})),z:[...document.querySelectorAll('#survey-body tr')].map(r=>Number(r.dataset.ez))})`);
  assert.equal(rows.points.length,8);rows.points.forEach((p,i)=>{const expected=rows.top+(/BR|CR/.test(p.label)?.124:.120)+(work==='Elastomeric'?.067:0);assert.ok(Math.abs(p.z-expected)<1e-9);assert.ok(Math.abs(rows.z[i]-expected)<1e-9)});
  const csv=await w.webContents.executeJavaScript(`(async()=>{let blob;const old=URL.createObjectURL,click=HTMLAnchorElement.prototype.click;URL.createObjectURL=b=>{blob=b;return 'blob:qa'};HTMLAnchorElement.prototype.click=function(){};try{exportDesign('csv');return await blob.text()}finally{URL.createObjectURL=old;HTMLAnchorElement.prototype.click=click}})()`);
  csv.split('\n').forEach((line,i)=>assert.equal(Number(line.split(',')[3]),rows.z[i]));
  const protectedRule=await w.webContents.executeJavaScript(`(()=>{const old=liveBearingElevationRules;liveBearingElevationRules=[{pier:'P-1092',work:'Bearing Plinths',pointGroup:'*',height:.140}];try{return getWorkPointElev(currentPier,'Bearing Plinths','BR1')}finally{liveBearingElevationRules=old}})()`);assert.ok(Math.abs(protectedRule-rows.top-.124)<1e-9);
  console.log('P-1092',type,work,'form/CSV/source precedence PASS');
  await w.webContents.executeJavaScript(`setCanvasViewMode('3d');void 0;`);
  for(let tries=0;tries<50;tries++){if(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource==='Blender'`))break;await new Promise(r=>setTimeout(r,100));}
  assert.equal(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource`),'Blender');
  if(type==='TYPE1'){
   await w.webContents.executeJavaScript(`window.desktopPrint={exportPdf:()=>new Promise(()=>{})};printDoc();void 0;`);await new Promise(r=>setTimeout(r,200));
   fs.writeFileSync('/tmp/p1092-corrected-'+work.replaceAll(' ','-')+'.pdf',await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
  }
 }
 await w.webContents.executeJavaScript(`document.getElementById('element').value='Pot Bearing';onPierSelect('P-1093');void 0;`);
 const r=await w.webContents.executeJavaScript(`({points:currentArray,rows:document.querySelectorAll('#survey-body tr').length,png:document.getElementById('pile-canvas').toDataURL(),top:getTopOfColumnElevation(currentPier)})`);
 assert.equal(r.rows,8);assert.equal(r.points.length,8);
 const levels=await w.webContents.executeJavaScript(`({plinth:[getWorkPointElev(currentPier,'Bearing Plinths','BL1'),getWorkPointElev(currentPier,'Bearing Plinths','BR1')],pot:[...new Set(currentArray.map(p=>p.z))]})`);
 assert.ok(Math.abs(levels.plinth[0]-113.465)<1e-9);assert.ok(Math.abs(levels.plinth[1]-113.466)<1e-9);
 assert.ok(Math.abs(levels.pot[0]-113.765)<1e-9);assert.ok(Math.abs(levels.pot[1]-113.785)<1e-9);
 const potCsv=await w.webContents.executeJavaScript(`(async()=>{let blob;const old=URL.createObjectURL,click=HTMLAnchorElement.prototype.click;URL.createObjectURL=b=>{blob=b;return 'blob:qa'};HTMLAnchorElement.prototype.click=function(){};try{exportDesign('csv');return await blob.text()}finally{URL.createObjectURL=old;HTMLAnchorElement.prototype.click=click}})()`);
 potCsv.split('\n').forEach((line,i)=>assert.equal(Number(line.split(',')[3]),i<4?113.765:113.785));
 for(const [prefix,width,length,os,height] of [['PBL',1.165,1.275,-2,.250],['PBR',1.250,1.675,2,.269]]){
  const p=r.points.filter(x=>x.label.startsWith(prefix));assert.equal(p.length,4);
  assert.deepEqual(p.map(x=>x.label),[1,2,3,4].map(i=>prefix+i));
  assert.ok(Math.abs(p[0].ch-length/2)<1e-10);assert.ok(Math.abs(p[1].os-(os-width/2))<1e-10);
  assert.ok(Math.abs(p[0].z-(r.top+(prefix==='PBL'?.119:.120)+.050+height))<1e-10);
  const area=p.reduce((a,x,i)=>{const y=p[(i+1)%4];return a+x.os*y.ch-y.os*x.ch},0);assert.ok(area>0,'CCW');
 }
 fs.writeFileSync('/tmp/pot-bearing-preview.png',Buffer.from(r.png.split(',')[1],'base64'));
 await w.webContents.executeJavaScript(`window.desktopPrint={exportPdf:()=>new Promise(()=>{})};printDoc();void 0;`);
 await new Promise(r=>setTimeout(r,200));fs.writeFileSync('/tmp/pot-bearing-print.pdf',await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
 await w.webContents.executeJavaScript(`document.getElementById('element').value='Pot Bearing';onPierSelect('P-1049');void 0;`);
 assert.equal(await w.webContents.executeJavaScript('currentArray.length'),0);
 assert.equal(errors.filter(x=>!x.includes('fetch')&&!x.includes('net::')).length,0,errors.join('\n'));
 console.log('PASS: 8 side midpoints, CCW, source dimensions, elevations, UI and unsupported-pier guard');app.exit(0);
 }catch(e){console.error(e);app.exit(1)}});
