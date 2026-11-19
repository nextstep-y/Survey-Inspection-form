const {app,BrowserWindow}=require('electron');const assert=require('node:assert/strict');const path=require('path');
app.whenReady().then(async()=>{try{
 const w=new BrowserWindow({show:false,width:1600,height:1200});w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));await w.loadFile(process.env.BR115_TEST_ENTRY||path.resolve(__dirname,'../index.html'));
 const result=await w.webContents.executeJavaScript(`(async()=>{
 document.getElementById('structure-type').value='br115';onStructureTypeChange();
 const click=(name,value)=>{const el=[...document.querySelectorAll('[data-joint]')].find(e=>e.dataset.joint===name);el.checked=value;el.dispatchEvent(new Event('change'));};
 document.querySelector('[data-action="clear"]').click();
 for(const name of ['PS70N','PS70S','P2S','P2N'])click(name,true);
 const out={type:currentStructureType(),work:document.getElementById('element').value,count:currentArray.length,joints:BR115Bottom.selected(currentPier).sections.map(s=>s.name),matches:getPierMatches(''),pickerCount:document.querySelectorAll('[data-joint]').length,pierHidden:getComputedStyle(document.getElementById('pier-no-col')).display,context:currentPier.id,detailsDisplay:getComputedStyle(document.getElementById('br115-panel')).display};
 const original=currentArray[0];document.getElementById('in-z-0').value=(original.z+.005).toFixed(3);calcDev(0);out.dz=document.getElementById('dev-dz-0').textContent;out.empty=document.getElementById('dev-dn-0').textContent;
 click('70S1',true);const ix=currentArray.findIndex(p=>p.label===original.label);out.restored=document.getElementById('in-z-'+ix).value;out.expected=(original.z+.005).toFixed(3);
 click('70S1',false);out.xlsx=JSON.stringify(_xlsxBuildRows()).includes('PS70S');
 const old=URL.createObjectURL;let blob;URL.createObjectURL=b=>{blob=b;return old(b);};exportDesign('csv');out.csv=await blob.text();URL.createObjectURL=old;
 document.querySelector('[data-action="clear"]').click();out.clear=currentArray.length;
 document.getElementById('br115-from').value='P2S';document.getElementById('br115-to').value='P2N';document.querySelector('[data-action="range"]').click();out.range=currentArray.length;
 click('71N1',false);
 document.querySelector('[data-action="clear"]').click();click('PS70N',true);click('PS71N',true);out.cross=currentArray.map(p=>({joint:p.joint,z:p.z}));out.crossRows=document.querySelectorAll('#survey-body tr').length;out.noPierHeader=!JSON.stringify(_xlsxBuildRows()).includes('Pier Information - Auto-filled');
 return out;})().catch(e=>{throw Error(e.stack)})`.replace(" click('71N1',false);",''));
 assert.equal(result.detailsDisplay,'none');assert.equal(result.pickerCount,48);assert.equal(result.pierHidden,'none');assert.equal(result.context,'BR115');assert.equal(result.crossRows,6);assert.equal(result.noPierHeader,true);assert.ok(result.cross.some(p=>p.joint==='PS71N'&&Math.abs(p.z-113.827)<1e-8));assert.equal(result.type,'br115');assert.equal(result.work,'BR115 Bottom Slab');assert.equal(result.count,12);assert.deepEqual(new Set(result.joints),new Set(['PS70N','PS70S','P2S','P2N']));assert.equal(result.matches.length,4);assert.equal(result.dz,'0.005');assert.equal(result.empty,'—');assert.equal(result.restored,result.expected);assert.equal(result.xlsx,true);assert.equal(result.csv.split('\n').length,12);assert.equal(result.clear,0);assert.equal(result.range,18);
 const leave=await w.webContents.executeJavaScript(`document.getElementById('structure-type').value='pier';onStructureTypeChange();({hidden:document.getElementById('br115-work-group').hidden,hasBR:[...document.getElementById('element').options].some(o=>o.value==='BR115 Bottom Slab'),work:document.getElementById('element').value})`);
 assert.equal(leave.hidden,true);assert.equal(leave.hasBR,false);assert.equal(leave.work,'Bored Pile');
 await w.webContents.executeJavaScript(`document.getElementById('structure-type').value='br115';onStructureTypeChange();`);
 await new Promise(r=>setTimeout(r,250));
 require('fs').writeFileSync('/tmp/br115-app-multi.png',(await w.webContents.capturePage()).toPNG());console.log('PASS',JSON.stringify(result),leave);app.exit(0);
}catch(e){console.error(e);app.exit(1);}});
