const{app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
app.whenReady().then(async()=>{try{
const w=new BrowserWindow({show:false,width:1500,height:1100});w.webContents.session.webRequest.onBeforeRequest({urls:['https://*/*','http://*/*']},(_,cb)=>cb({cancel:true}));await w.loadFile(process.env.BR115_TEST_ENTRY||path.resolve(__dirname,'../index.html'));
const r=await w.webContents.executeJavaScript(`(async()=>{
 document.getElementById('structure-type').value='br115';onStructureTypeChange();document.querySelector('[data-action="clear"]').click();
 for(const name of ['P2S','PS70S','PS70N','P2N']){const el=[...document.querySelectorAll('[data-joint]')].find(e=>e.dataset.joint===name);el.checked=true;el.dispatchEvent(new Event('change'));}
 const design=JSON.stringify(currentArray);
 document.getElementById('work-desc').value='As-Built';onWorkChange();updatePrintVals();
 const z=+document.querySelector('#survey-body tr').dataset.ez;document.getElementById('in-z-0').value=(z+.002).toFixed(3);calcDev(0);
 const out={bar:document.getElementById('tol-bar-text').textContent,bottom:document.getElementById('br115-contract-criteria').textContent,unchanged:JSON.stringify(currentArray)===design,status:document.getElementById('sum-status').textContent,dz:document.getElementById('dev-dz-0').textContent,cls:document.getElementById('dev-dz-0').className,pages:BR115Contract.clauses.segment.pdf};
 document.getElementById('element').value='BR115 Top of Top Slab';onWorkChange();updatePrintVals();out.top=document.getElementById('br115-contract-criteria').textContent;out.xlsx=JSON.stringify(_xlsxBuildRows());
 const include=document.getElementById('br115-attach-drawings');include.checked=false;include.dispatchEvent(new Event('change'));window.print=()=>{};await printDoc();await new Promise(r=>setTimeout(r,100));return out;
})()`);
assert.equal(r.unchanged,true);assert.equal(r.status,'NOT ASSESSED');assert.equal(r.dz,'0.002');assert.equal(r.cls,'dev-cell');assert.equal(r.pages,146);assert.ok(r.bar.includes('Survey accuracy ±3 mm'));assert.ok(!r.bar.includes('0.025'));assert.ok(r.bottom.includes('Bottom slab thickness: ±9 mm'));assert.ok(!r.bottom.includes('overall top width'));assert.ok(r.top.includes('overall top width: ±1.5 mm per 300 mm, maximum ±25 mm'));assert.ok(r.top.includes('only for bridges without overlay'));assert.ok(r.xlsx.includes('PDF 149'));assert.ok(r.xlsx.includes('not absolute N/E/RL acceptance limits'));
fs.writeFileSync('/tmp/br115-contract-form.pdf',await w.webContents.printToPDF({landscape:true,preferCSSPageSize:true,printBackground:true}));console.log('PASS contract source pages, Top/Bottom scope, no false PASS from survey accuracy, As-Built override, Excel/PDF',r.bar);app.exit(0);
}catch(e){console.error(e);app.exit(1);}});
