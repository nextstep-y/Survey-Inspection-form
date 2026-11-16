// Faithful rendering of page 1 only of the supplied 03-Elevation Check.docx.
// This is a blank supplemental form, not a drawing reference or elevation rule.
window.BlindingElevationPrint=(()=>{
 const source='assets/forms/blinding-elevation-check-page-1.svg';
 const style=document.createElement('style');style.textContent=`
 .blinding-elevation-attachment {display:none;}
 @media print {
  @page blindingElevation {size:A4 portrait;margin:0;}
  .blinding-elevation-attachment {display:block!important;}
  .blinding-elevation-page {page:blindingElevation;break-before:page!important;page-break-before:always!important;break-inside:avoid!important;page-break-inside:avoid!important;width:210mm;height:297mm;margin:0;padding:0;box-sizing:border-box;}
  .blinding-elevation-page img {display:block;width:210mm;height:297mm;object-fit:contain;margin:0;padding:0;border:0;}
 }
 `;document.head.append(style);
 async function prepare(work){
  document.querySelectorAll('.blinding-elevation-attachment').forEach(e=>e.remove());
  if(work!=='Blinding Concrete')return null;
  const image=new Image();image.alt='Elevation Check supplemental form - source Word page 1';
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Elevation Check page 1 is unavailable. No print was started.'));image.src=source;});
  if(!image.naturalWidth)throw Error('Empty Elevation Check page 1');
  const section=document.createElement('section');section.className='drawing-print-attachments blinding-elevation-attachment';
  const page=document.createElement('div');page.className='blinding-elevation-page';page.append(image);section.append(page);return section;
 }
 return {prepare,source};
})();
