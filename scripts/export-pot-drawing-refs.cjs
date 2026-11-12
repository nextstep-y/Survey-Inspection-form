const {app,BrowserWindow}=require('electron'),fs=require('fs'),path=require('path');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
const records=await w.webContents.executeJavaScript(`Object.values(PIERS_RAW).map(p=>({pier:p.id,...getWorkDrawingReferences(p,'Pot Bearing')}))`);
fs.mkdirSync('output/pot-drawing-print',{recursive:true});fs.writeFileSync('output/pot-drawing-print/references.json',JSON.stringify(records,null,2));console.log(JSON.stringify(records.filter(r=>r.refs.length).map(r=>({pier:r.pier,refs:r.refs.map(x=>x.dwg+'|'+x.rev)}))));app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
