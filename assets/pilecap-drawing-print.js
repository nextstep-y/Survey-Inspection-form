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
 async function prepare(pier,work,refs){
  clear();
  if(!['Pile cap','Bored Pile','Pier Head','Bearing Plinths'].includes(work)||!/^P-\d/.test(pier||''))return null;
  const records=['Pier Head','Bearing Plinths'].includes(work)?headRecordsFor(pier,refs):recordsFor(pier);
  if(!records?.length)throw Error('No confirmed drawing registered for '+pier+'. Register the correct drawing before printing.');
  const container=document.createElement('section');container.className='drawing-print-attachments';
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
 return {prepare,clear,recordsFor,headRecordsFor};
})();
