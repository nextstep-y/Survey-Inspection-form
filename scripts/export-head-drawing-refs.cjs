const {app,BrowserWindow}=require('electron'),fs=require('fs'),path=require('path');
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_d,cb)=>cb({cancel:true}));
await w.loadFile(path.resolve(__dirname,'../index.html'));
const records=await w.webContents.executeJavaScript(`Object.values(PIERS_RAW).flatMap(p=>['Pier Head','Bearing Plinths'].map(work=>({pier:p.id,work,...getWorkDrawingReferences(p,work)})))`);
fs.mkdirSync('output/head-drawing-print',{recursive:true});fs.writeFileSync('output/head-drawing-print/references.json',JSON.stringify(records,null,2));console.log(records.length,'Pier/work references');app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
