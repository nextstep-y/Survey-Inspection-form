/* BR115 exact drawing revisions and work-specific printable source pages. */
window.BR115Drawings=(()=>{
 let attach=true;
 function records(){
  const names=new Set(BR115Bottom.selected({})?.sections.map(s=>s.name)||[]);
  if(!names.size)return [];
  return (window.BR115_DRAWING_PAGES||[]).filter(r=>r.common||r.joints.some(n=>names.has(n)));
 }
 function selection(){
  const rows=records();return{records:rows,missing:[],text:rows.length?rows.map(r=>r.dwg+' / Rev.'+r.rev).join('; '):'No Joint selected'};
 }
 function references(){const s=selection();return {work:document.getElementById('element').value,refs:s.records.map(r=>({...r,roles:[r.title],source:r.sourceFile+' / PDF page '+r.sourcePage})),text:s.text,status:s.records.length?'REFERENCE FOUND':'NOT VERIFIED'};}
 function render(){
  let box=document.getElementById('br115-drawing-reference');
  if(!box){box=document.createElement('section');box.id='br115-drawing-reference';box.className='no-print';box.style.cssText='padding:8px 10px;border:1px solid #bbcbd5;font:12px Arial;line-height:1.5';document.getElementById('survey-table').before(box);}
  const enabled=BR115Bottom.isWork(document.getElementById('element').value);box.hidden=!enabled;if(!enabled)return;
  box.replaceChildren();const heading=document.createElement('b');heading.textContent='Drawing Reference';box.append(heading);
  const label=document.createElement('label');label.style.cssText='display:block;margin:5px 0';
  const check=document.createElement('input');check.type='checkbox';check.checked=attach;check.id='br115-attach-drawings';check.onchange=()=>attach=check.checked;label.append(check,' Include referenced drawings when printing PDF');box.append(label);
  const method=document.createElement('div');method.textContent='Method reference: '+BR115Surfaces.methodInfo(BR115Bottom.selected({})?.sections||[]).scope;box.append(method);
  const rows=records();if(!rows.length)box.append('Select at least one Joint to show references.');
  rows.forEach(r=>{const line=document.createElement('div'),a=document.createElement('a');a.href=r.pages[0];a.target='_blank';a.rel='noopener';a.textContent=r.dwg+' / Rev.'+r.rev+' — '+r.title;a.title=r.sourceFile+' / PDF page '+r.sourcePage;line.append(a);box.append(line);});
  const selected=BR115Bottom.selected({})?.sections||[];
  const warnings=selected.filter(s=>s.warning);if(warnings.length){const note=document.createElement('div');note.style.color='#985a00';note.textContent=warnings.map(s=>s.name+': '+s.warning).join(' ');box.append(note);}
 }
 return{records,selection,references,render,include:()=>attach};
})();
