// Local rendered source pages avoid Drive login/CORS failures during printing.
window.PilecapDrawingPrint=(()=>{
 function recordsFor(pier){
  const id=String(pier||'').trim(),all=window.PILECAP_DRAWING_REGISTER?.records||{};
  if(all[id])return all[id];
  // Combined-head L/R records use the same source plan only for the eight
  // previously user-confirmed combined-head families; no generic suffix guess.
  const match=id.match(/^(P-(?:976|977|1101|1102|1103|1108|1120|1121))[LR]$/);
  return match?all[match[1]]||[]:[];
 }
 const style=document.createElement('style');style.textContent=`
 .drawing-print-attachments {display:none;}
 @media print {
  .drawing-print-attachments {display:block!important;}
  .drawing-print-page {display:flex!important;flex-direction:column;align-items:center;justify-content:flex-start;break-before:page!important;page-break-before:always!important;break-inside:avoid!important;width:100%;height:201mm;box-sizing:border-box;margin:0;padding:0;}
  .drawing-print-caption {font:8pt Arial;color:#111;width:100%;height:7mm;flex:none;}
  .drawing-print-page img {width:100%;height:192mm;object-fit:contain;display:block;flex:none;}
 }
 `;document.head.appendChild(style);
 const clear=()=>document.querySelectorAll('.drawing-print-attachments').forEach(e=>e.remove());
 window.addEventListener('afterprint',clear);
 function headRecordsFor(pier,refs){
  if(!refs?.length)throw Error('No confirmed work-specific drawing reference for '+pier);
  const all=window.HEAD_DRAWING_PAGES?.drawings||{},missing=refs.filter(r=>!all[r.dwg+'|'+r.rev]);
  if(missing.length)throw Error('Exact PDF revision required: '+missing.map(r=>r.dwg+' Rev.'+r.rev).join('; '));
  return refs.map(r=>all[r.dwg+'|'+r.rev]);
 }
 function columnRecordsFor(pier,refs){
  if(!refs?.length)throw Error('No confirmed Column drawing reference for '+pier);
  const all=window.COLUMN_DRAWING_PAGES?.drawings||{};
  const allowed=window.COLUMN_DRAWING_PAGES?.records?.[String(pier).trim()]||[];
  return refs.map(r=>{
   const found=all[r.dwg+'|'+r.rev];
   if(!found)throw Error('Exact Column PDF revision required: '+r.dwg+' Rev.'+r.rev);
   if(!allowed.some(a=>a.dwg===r.dwg&&a.rev===r.rev))throw Error('Column drawing is not mapped to '+pier+': '+r.dwg);
   return found;
  });
 }
 function potRecordsFor(pier,refs){
  if(!refs?.length)throw Error('No confirmed Pot Bearing drawing reference for '+pier);
  const catalog=window.POT_DRAWING_PAGES;
  const allowed=catalog?.coverage?.find(r=>String(r.pier).trim()===String(pier).trim())?.references||[];
  const unique=[...new Map(refs.map(r=>[r.dwg+'|'+r.rev,r])).values()];
  return unique.map(r=>{
   const key=r.dwg+'|'+r.rev,found=catalog?.drawings?.[key];
   if(!found)throw Error('Exact Pot Bearing PDF revision required: '+r.dwg+' Rev.'+r.rev);
   if(!allowed.includes(key))throw Error('Pot Bearing drawing is not mapped to '+pier+': '+r.dwg);
   return found;
  });
 }
 const supportedWorks=['Pile cap','Bored Pile','Pier Head','Bearing Plinths','Pot Bearing','Pier Column (1st-Lift)','Pier Column (2nd Lift)'];
 function selectionFor(pier,work){
  if(!supportedWorks.includes(work)||!/^P-\d/.test(pier||''))return null;
  const id=String(pier).trim();let records=[],missing=[];
  if(['Pile cap','Bored Pile'].includes(work))records=recordsFor(id);
  else if(work.startsWith('Pier Column'))records=window.COLUMN_DRAWING_PAGES?.records?.[id]||[];
  else {
   const catalog=work==='Pot Bearing'?window.POT_DRAWING_PAGES:window.HEAD_DRAWING_PAGES;
   const row=catalog?.coverage?.find(r=>String(r.pier).trim()===id&&(work==='Pot Bearing'||r.work===work));
   const keys=row?.references||[];
   missing=keys.filter(k=>!catalog?.drawings?.[k]);
   if(!missing.length)records=keys.map(k=>catalog.drawings[k]);
  }
  records=[...new Map(records.map(r=>[r.dwg+'|'+r.rev,r])).values()];
  const text=records.length?records.map(r=>r.dwg+' / Rev.'+r.rev).join('; '):'DRAWING NOT VERIFIED - '+work;
  return {records,missing,text};
 }
 async function prepare(pier,work,refs){
  clear();
  const selection=selectionFor(pier,work);if(!selection)return null;
  const {records}=selection;
  if(selection.missing.length)throw Error('Exact PDF revision required: '+selection.missing.join('; '));
  if(refs&&JSON.stringify(refs.map(r=>r.dwg+'|'+r.rev))!==JSON.stringify(records.map(r=>r.dwg+'|'+r.rev)))throw Error('Form drawing references differ from attached drawings. Refresh before printing.');
  if(!records?.length)throw Error('No confirmed drawing registered for '+pier+'. Register the correct drawing before printing.');
  const container=document.createElement('section');container.className='drawing-print-attachments';
  container.dataset.drawingReferences=selection.text;
  for(const r of records)for(const [i,path]of r.pages.entries()){
   const image=new Image();image.alt=r.dwg+' Rev.'+r.rev+' page '+(i+1);
   await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Drawing unavailable: '+image.alt));image.src=path;});
   if(!image.naturalWidth)throw Error('Empty drawing image: '+image.alt);
   const page=document.createElement('div');page.className='drawing-print-page';
   const caption=document.createElement('div');caption.className='drawing-print-caption';caption.textContent=pier+' | '+r.dwg+' | Rev.'+r.rev+' | Drawing page '+(i+1)+'/'+r.pages.length;
   page.append(caption,image);container.append(page);
  }
  return container;
 }
 return {prepare,clear,recordsFor,headRecordsFor,columnRecordsFor,potRecordsFor,selectionFor};
})();
