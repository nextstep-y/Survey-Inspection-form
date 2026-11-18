const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/element-itp-source.json'),'utf8'));
if(process.argv.includes('--source')){
 const file=process.argv[process.argv.indexOf('--source')+1];assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),source.sha256);
 const python='/Users/weerayutpooncharoen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
 const rows=JSON.parse(cp.execFileSync(python,['-c',"import openpyxl,json,sys; s=openpyxl.load_workbook(sys.argv[1],data_only=True)['Sheet2']; print(json.dumps([[str(v).strip() if v is not None else None for v in row] for row in s.iter_rows(min_row=2,max_row=13,max_col=4,values_only=True)]))",file],{encoding:'utf8'}));assert.deepEqual(rows,source.records);console.log('PASS source cells and SHA256');
}
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false,width:390,height:844,webPreferences:{partition:'element-itp-'+Date.now()}});try{
w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));await w.loadFile(path.resolve(__dirname,'../index.html'));
const expected=source.records.map(([work,ms,itp,item])=>({work,number:ms&&itp?ms+' & '+itp:'—',item:item==='-'?'-':'ITEM '+item}));
for(const r of expected){
const actual=await w.webContents.executeJavaScript(`(()=>{const work=${JSON.stringify(r.work)},select=document.getElementById('element'),available=Array.from(select.options).some(o=>o.value===work);if(available){select.value=work;onPierSelect('P-1093');}return {number:WORK_ITP[work]||'—',item:WORK_ITP_ITEM[work]||'—',visible:available?document.getElementById('itp-no-hdr').textContent:null,visibleItem:available?document.getElementById('itp-item-hdr').textContent:null}})()`);
assert.equal(actual.number,r.number,r.work);assert.equal(actual.item,r.item,r.work);if(actual.visible!==null){assert.equal(actual.visible,r.number);assert.equal(actual.visibleItem,r.item);}console.log('PASS',r.work,r.item,actual.visible!==null?'form checked':'reference mapping only');
}
await w.webContents.executeJavaScript(`document.getElementById('element').value='Pot Bearing';onPierSelect('P-1093');window.print=()=>{};window.alert=m=>{throw Error(m)};printDoc();`);
fs.writeFileSync('/tmp/P-1093-Pot-Element-ITP.pdf',await w.webContents.printToPDF({landscape:true,pageSize:'A4',printBackground:true,preferCSSPageSize:true}));
console.log('PASS all 12 Excel mappings and Pot PDF');app.exit(0);
}catch(e){console.error(e);app.exit(1)}});
