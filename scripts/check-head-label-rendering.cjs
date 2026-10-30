const {app,BrowserWindow}=require('electron'),fs=require('fs');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:1500,height:1100});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(_d,cb)=>cb({cancel:true}));
await w.loadFile(require('path').resolve(__dirname,'../index.html'));
await w.webContents.executeJavaScript(`(()=>{document.getElementById('element').value='Pier Head';canvasViewMode='3d';for(const p of Object.values(PIERS_RAW)){if(/^P-/.test(p.id))onPierSelect(p.id);}})()`);
await new Promise(r=>setTimeout(r,2500));
const report=await w.webContents.executeJavaScript(`(()=>{
const canvas=document.getElementById('pile-canvas'),ctx=canvas.getContext('2d'),original=ctx.fillText,rows=[];let labels=[];
ctx.fillText=function(text,x,y,...rest){
if(/^(T\\d+|S\\d+(?:-D\\d+)?) (?:UP |DOWN )?(?:[0-9?]|REF)/.test(String(text))){
 const width=this.measureText(text).width,fs=parseFloat(this.font.match(/([\\d.]+)px/)?.[1]||12);
 const left=this.textAlign==='right'?x-width:this.textAlign==='center'?x-width/2:x;
 labels.push({text,left,right:left+width,y,fs});}
return original.call(this,text,x,y,...rest);};
try{for(const p of Object.values(PIERS_RAW)){
const n=Number(p.id.match(/^P-(\\d+)/)?.[1]);if(!(n>=826&&n<=1142))continue;
labels=[];onPierSelect(p.id);drawPileArray(currentPier);
const clipped=labels.filter(q=>q.left<0||q.right>canvas.width);
rows.push({pier:p.id,labels:labels.length,clipped});
}}finally{ctx.fillText=original;}
return rows;})()`);
fs.writeFileSync('output/head-label-audit/rendering.json',JSON.stringify(report,null,2));
const bad=report.filter(r=>r.clipped.length);if(bad.length)throw Error('Clipped labels: '+JSON.stringify(bad));
console.log('PASS',report.length,'3D form renders; no clipped point labels');app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
