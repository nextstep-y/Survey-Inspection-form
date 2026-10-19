const {app,BrowserWindow}=require('electron'),fs=require('fs'),assert=require('assert/strict');
const expected={
 'P-888':{t:[.297,.2,.497,.2,.497,.297,.297,.497],groups:[['UL',.925,-2.4,.88,.88,.119],['UR',.925,2.4,.95,.95,.119],['DL',-.925,-1.7,.45,.55,.35],['DR',-.925,1.7,.45,.55,.35]]},
 'P-889':{t:[.405,0,.405,0,.405,.405,.405,.405],groups:[['BL',0,-2,1.55,1.55,.122],['BR',0,2,1.62,1.62,.122]]},
 'P-890':{t:[.405,0,.405,0,.405,.405,.405,.405],groups:[['BL',0,-2,1.43,1.43,.122],['BR',0,2,1.51,1.51,.122]]},
 'P-891':{t:[.497,.2,.297,.2,.297,.497,.497,.297],groups:[['UL',.925,-1.7,.45,.55,.35],['UR',.925,1.7,.45,.55,.35],['DL',-.925,-2.4,.88,.88,.119],['DR',-.925,2.4,.95,.95,.119]]}
};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1050,webPreferences:{sandbox:true,partition:'br114-'+Date.now()}});try{
 await w.loadURL(process.env.QA_URL||'file:///Users/weerayutpooncharoen/Desktop/Inspection/index.html');
 for(const [id,control] of Object.entries(expected))for(const work of ['Pier Head','Bearing Plinths']){
  await w.webContents.executeJavaScript(`document.getElementById('element').value='${work}';onPierSelect('${id}');setCanvasViewMode('2d');void 0;`);
  const data=await w.webContents.executeJavaScript(`({top:currentPier.topPier,points:currentArray,rows:[...document.querySelectorAll('#survey-body tr')].map(r=>({z:r.dataset.ez,n:r.dataset.dn,e:r.dataset.de})),pier:{n:currentPier.n,e:currentPier.e,deg:currentPier.deg,min:currentPier.min,sec:currentPier.sec}})`);
  if(id==='P-890')near(data.top,62.540);
  if(work==='Pier Head')control.t.forEach((rise,i)=>{const j=data.points.findIndex(p=>p.label==='T'+(i+1));near(data.points[j].z,data.top+rise);near(Number(data.rows[j].z),data.top+rise)});
  else for(const [name,ch,os,sizeCH,sizeOS,rise] of control.groups){const ps=data.points.filter(p=>p.label.replace(/\d+$/,'')===name);assert.equal(ps.length,4);near(ps.reduce((s,p)=>s+p.ch,0)/4,ch);near(ps.reduce((s,p)=>s+p.os,0)/4,os);near(Math.max(...ps.map(p=>p.ch))-Math.min(...ps.map(p=>p.ch)),sizeCH+.06);near(Math.max(...ps.map(p=>p.os))-Math.min(...ps.map(p=>p.os)),sizeOS+.06);ps.forEach(p=>near(Number(data.rows[data.points.indexOf(p)].z),data.top+rise));}
  const a=(data.pier.deg+data.pier.min/60+data.pier.sec/3600)*Math.PI/180;
  data.points.forEach((p,i)=>{near(Number(data.rows[i].n),Number((data.pier.n+p.ch*Math.sin(a)+p.os*Math.cos(a)).toFixed(4)));near(Number(data.rows[i].e),Number((data.pier.e-p.ch*Math.cos(a)+p.os*Math.sin(a)).toFixed(4)))});
  const csv=await w.webContents.executeJavaScript(`(async()=>{let blob;const old=URL.createObjectURL,click=HTMLAnchorElement.prototype.click;URL.createObjectURL=b=>{blob=b;return 'blob:qa'};HTMLAnchorElement.prototype.click=function(){};try{exportDesign('csv');return await blob.text()}finally{URL.createObjectURL=old;HTMLAnchorElement.prototype.click=click}})()`);
  const lines=csv.split('\n');assert.equal(lines.length,data.points.length);lines.forEach((line,i)=>{const cols=line.split(','),p=data.points[i];assert.equal(cols[0],p.label);assert.equal(cols[1],(data.pier.e-p.ch*Math.cos(a)+p.os*Math.sin(a)).toFixed(3));assert.equal(cols[2],(data.pier.n+p.ch*Math.sin(a)+p.os*Math.cos(a)).toFixed(3));assert.equal(cols[3],data.rows[i].z?Number(data.rows[i].z).toFixed(3):'')});
  await w.webContents.executeJavaScript(`setCanvasViewMode('3d');void 0;`);
  for(let i=0;i<150;i++){if(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource==='Blender'`))break;await new Promise(r=>setTimeout(r,200));}
  assert.equal(await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').dataset.modelSource`),'Blender');
  if(!process.env.QA_URL){const tag=id+'-'+work.replaceAll(' ','-');fs.writeFileSync('/tmp/'+tag+'.png',Buffer.from((await w.webContents.executeJavaScript(`document.getElementById('pile-canvas').toDataURL()`)).split(',')[1],'base64'));await w.webContents.executeJavaScript(`window.desktopPrint={exportPdf:()=>new Promise(()=>{})};printDoc();void 0;`);await new Promise(r=>setTimeout(r,150));fs.writeFileSync('/tmp/'+tag+'.pdf',await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));}
  console.log('PASS',id,work,'levels, dimensions +30mm/edge, center, N/E, Blender');
 }
 app.exit(0);
 }catch(e){console.error(e);app.exit(1)}});
