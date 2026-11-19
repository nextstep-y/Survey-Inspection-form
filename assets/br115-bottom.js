/* BR115 lower box slab: absolute alignment coordinates, not pier-axis rotation. */
window.BR115Bottom = (() => {
  const choices={}, observations={};
  const isWork=value=>Boolean(BR115Surfaces.definition(value));
  const mode=()=>BR115Surfaces.current();
  const isTop=()=>mode().key==='tts';
  let active=null;
  const list=()=>window.BR115_BOTTOM_DATA;
  function selected(pier){
    const sections=list(pier);if(!sections.length)return null;
    if(!choices.BR115)choices.BR115=[sections.find(s=>s.name==='PS70N'||s.name==='PS71N')?.name||sections[0].name];
    const chosen=sections.filter(s=>choices.BR115.includes(s.name)).sort((a,b)=>(a.ch??Infinity)-(b.ch??Infinity));
    const surfaces=chosen.map(section=>BR115Surfaces.build(section,mode()));
    return {name:surfaces.map(s=>s.name).join(', '),sections:surfaces,points:surfaces.flatMap(s=>s.points.map(p=>({...p,joint:s.name,ch:s.ch})))};
  }
  function structureChanged(){
    const enabled=document.getElementById('structure-type').value==='br115';
    document.body.classList.toggle('br115-work',enabled);
    document.getElementById('pier-no-col').style.display=enabled?'none':'';
    if(!enabled)document.getElementById('pier-card').style.display='none';
    const drawings=document.getElementById('br115-drawing-reference');if(drawings)drawings.hidden=!enabled;const criteria=document.getElementById('br115-contract-criteria');if(criteria)criteria.hidden=!enabled;
    const picker=document.getElementById('br115-work-group');if(picker)picker.hidden=!enabled;
    const panel=document.getElementById('br115-panel');if(panel)panel.hidden=!enabled;
  }
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function remember(){
    if(!active)return;
    active.points.forEach((p,i)=>{observations[p.label]=['n','e','z'].map(k=>document.getElementById(`in-${k}-${i}`)?.value||'');});
  }
  function prepare(pier){
    const enabled=isWork(document.getElementById('element').value);
    let panel=document.getElementById('br115-panel');
    if(!panel){panel=document.createElement('div');panel.id='br115-panel';panel.style.cssText='padding:10px;border:1px solid #93aebf;background:#f1f7fa;font:12px Arial;line-height:1.6';document.getElementById('survey-table').before(panel);}
    panel.hidden=true;
    if(!enabled){const notes=document.getElementById('br115-surface-notes');if(notes)notes.hidden=true;const reset=document.getElementById('br115-3d-reset');if(reset)reset.hidden=true;const focus=document.getElementById('br115-point-focus');if(focus)focus.hidden=true;const canvas=document.getElementById('pile-canvas');canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=canvas.onwheel=null;canvas.style.touchAction='auto';active=null;const picker=document.getElementById('br115-work-group');if(picker)picker.hidden=true;return;}
    active=selected(pier);
    const sections=list(pier);
    let picker=document.getElementById('br115-work-group');
    if(!picker){picker=document.createElement('div');picker.id='br115-work-group';picker.className='no-print';document.getElementById('element-col').append(picker);}
    picker.hidden=false;
    picker.innerHTML=sections.length?`<div style="max-height:190px;overflow:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px">${sections.map(s=>`<label style="font-size:12px;display:flex;gap:5px;align-items:center"><input type="checkbox" data-joint="${esc(s.name)}" ${choices.BR115.includes(s.name)?'checked':''}>${esc(s.name)}${s.ch===null?' (CH pending)':''}${s.warning&&!isTop()?' ⚠':''}</label>`).join('')}</div><div style="display:flex;gap:4px;margin-top:6px"><button type="button" data-action="all">Select all</button><button type="button" data-action="clear">Clear</button></div><div style="font-size:11px;margin-top:6px">Range (increasing CH)</div><select aria-label="From joint" id="br115-from">${sections.filter(s=>s.ch!==null).sort((a,b)=>a.ch-b.ch).map(s=>`<option>${esc(s.name)}</option>`).join('')}</select><select aria-label="To joint" id="br115-to">${sections.filter(s=>s.ch!==null).sort((a,b)=>a.ch-b.ch).map(s=>`<option>${esc(s.name)}</option>`).join('')}</select><button type="button" data-action="range">Add range</button>`:'Select P-1091 to P-1094.';
    const change=names=>{remember();choices.BR115=names;renderSurveyTable(pier);updatePrintVals();refreshDwgDisplay();updateITP();};
    picker.querySelectorAll('[data-joint]').forEach(el=>el.onchange=()=>change([...picker.querySelectorAll('[data-joint]:checked')].map(e=>e.dataset.joint)));
    picker.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>{
      if(el.dataset.action==='all')change(sections.map(s=>s.name));
      else if(el.dataset.action==='clear')change([]);
      else {const a=sections.find(s=>s.name===document.getElementById('br115-from').value).ch,b=sections.find(s=>s.name===document.getElementById('br115-to').value).ch;change([...new Set([...choices.BR115,...sections.filter(s=>s.ch!==null&&s.ch>=Math.min(a,b)&&s.ch<=Math.max(a,b)).map(s=>s.name)])]);}
    });
    panel.innerHTML='<b>BR115 — '+mode().label+'</b><div id="br115-details"></div>';
    const details=document.getElementById('br115-details');
    const rows=active?.sections||[];
    details.textContent='Selected joints: '+(active?.name||'None')+' | '+mode().label+' | '+mode().description+' | '+mode().formula+' | Camber pending. '+rows.map(s=>s.name+': '+(s.pending||'nominal design geometry')).join('; ');
    renderSurfaceNotes(pier,rows);

  }

  function renderSurfaceNotes(pier,rows){
    let panel=document.getElementById('br115-surface-notes');
    if(!panel){panel=document.createElement('section');panel.id='br115-surface-notes';panel.style.cssText='padding:7px 10px;border:1px solid #bacbd5;font:11px/1.4 Arial';document.getElementById('survey-table').before(panel);}
    panel.hidden=['bbs','tts'].includes(mode().key)&&!rows.some(s=>s.pending);panel.replaceChildren();const brief=document.createElement('div');brief.textContent=mode().description;panel.append(brief);
    const pending=rows.filter(s=>s.pending);if(pending.length){const note=document.createElement('div');note.style.color='#8b5400';note.textContent=pending.map(s=>s.name+': '+s.pending).join(' ');panel.append(note);}
    const warnings=rows.filter(s=>s.warning);if(warnings.length){const warning=document.createElement('div');warning.style.color='#8b5400';warning.textContent=warnings.map(s=>s.name+': '+s.warning).join(' ');panel.append(warning);panel.hidden=false;}
    if(mode().key!=='web')return;
    const editor=document.createElement('details');editor.className='no-print';const title=document.createElement('summary');title.textContent='Enter Step 2 construction-joint dimension from drawing';editor.append(title);
    rows.filter(s=>s.ch!==null).forEach(section=>{const row=document.createElement('div');row.style.cssText='display:flex;gap:5px;align-items:center;margin:5px 0;flex-wrap:wrap';const saved=BR115Surfaces.wallTarget(section.name);const label=document.createElement('span');label.textContent=section.name;const offset=document.createElement('input');offset.type='number';offset.min='0';offset.step='.001';offset.placeholder='Offset below top deck (m)';offset.value=saved?.offset??'';offset.setAttribute('aria-label',section.name+' Step 2 offset');const ref=document.createElement('input');ref.type='text';ref.placeholder='Drawing / revision / section';ref.value=saved?.ref||'';ref.setAttribute('aria-label',section.name+' Step 2 source');const apply=document.createElement('button');apply.type='button';apply.textContent='Apply';apply.onclick=()=>{try{remember();BR115Surfaces.setWallTarget(section.name,offset.value,ref.value);renderSurveyTable(pier);updatePrintVals();}catch(error){showToast(error.message);}};row.append(label,offset,ref,apply);editor.append(row);});panel.append(editor);
  }
  function restore(){
    if(!isWork(document.getElementById('element').value))return;
    active?.points.forEach((p,i)=>(observations[p.label]||[]).forEach((v,j)=>{const input=document.getElementById(`in-${['n','e','z'][j]}-${i}`);if(input)input.value=v;}));
    active?.points.forEach((p,i)=>calcDev(i));summary();
  }

  function calcDev(i){
    const tr=document.querySelector(`tr[data-idx="${i}"]`);if(!tr)return;
    const values=['n','e','z'].map(k=>{const el=document.getElementById(`in-${k}-${i}`);return el?.value.trim()?getPrefixVal(el.id):NaN;});
    const dif=values.map((v,j)=>{const value=tr.dataset[['dn','de','ez'][j]];return value!==''?v-Number(value):NaN;});
    dif.push(Number.isFinite(dif[0])&&Number.isFinite(dif[1])?Math.hypot(dif[0],dif[1]):NaN);
    ['dn','de','dz','d'].forEach((k,j)=>{const el=document.getElementById(`dev-${k}-${i}`);el.textContent=Number.isFinite(dif[j])?dif[j].toFixed(3):'—';el.className='dev-cell';});
    if(active?.points[i])observations[active.points[i].label]=['n','e','z'].map(k=>document.getElementById(`in-${k}-${i}`).value);
    summary();
  }
  function summary(){
    const measured=[...document.querySelectorAll('#survey-body [id^="dev-d-"]')].map(e=>parseFloat(e.textContent)).filter(Number.isFinite);
    for(const id of ['sum-dn','sum-de','sum-dev']){const el=document.getElementById(id);if(el){el.textContent='—';el.className='sum-value';}}
    if(measured.length)document.getElementById('sum-dev').textContent=(Math.max(...measured)*1000).toFixed(1)+' mm';
    document.getElementById('sum-count').textContent=measured.length;
    const status=document.getElementById('sum-status');status.textContent='NOT ASSESSED';status.className='sum-value';
    document.getElementById('sum-fail-count').textContent='Absolute position / RL criteria pending';
  }
  function draw(pier){
    const canvas=document.getElementById('pile-canvas'),ctx=canvas.getContext('2d');
    delete canvas.dataset.br115Model;canvas.className='';canvas.width=3300;canvas.height=1080;ctx.setTransform(3,0,0,3,0,0);canvas.style.width='100%';canvas.style.height='auto';
    const controls=document.getElementById('canvas-view-controls');if(controls)controls.style.display='flex';
    const reset=document.getElementById('br115-3d-reset');if(reset)reset.hidden=canvasViewMode!=='3d';const focus=document.getElementById('br115-point-focus');if(focus)focus.hidden=canvasViewMode!=='3d';
    const status=document.getElementById('canvas-model-status');if(status){status.style.display='';status.textContent=canvasViewMode==='3d'?'Calculated 3D':'2D plan';}
    ['2d','3d'].forEach(view=>{const button=document.getElementById('canvas-view-'+view);button?.classList.toggle('active',canvasViewMode===view);button?.setAttribute('aria-pressed',String(canvasViewMode===view));});
    if(canvasViewMode==='3d')return BR115ThreeD.draw(ctx,pier);
    canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=canvas.onwheel=null;
    canvas.style.touchAction='auto';

    document.body.classList.remove('bearing-plinth-work','elastomeric-work','pot-bearing-work','compact-pilecap-print');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,1100,360);ctx.fillStyle='#24485f';ctx.font='bold 27px Arial';ctx.fillText(`BR115 ${mode().label} | ${active?.sections.length||0} joints`,30,30);
    if(!active?.points.length){ctx.font='16px Arial';ctx.fillText('Coordinates / chainage pending — no layout available',30,80);return;}
    const secs=(active?.sections||[]).filter(s=>s.ch!==null).sort((a,b)=>a.ch-b.ch),pts=secs.flatMap(s=>s.points);
    const rad=((pier.deg||0)+(pier.min||0)/60+(pier.sec||0)/3600)*Math.PI/180;
    const local=p=>{const dn=p.n-pier.n,de=p.e-pier.e;return [dn*Math.sin(rad)-de*Math.cos(rad),dn*Math.cos(rad)+de*Math.sin(rad)];};
    const coords=pts.map(local),lo=Math.min(...coords.map(p=>p[0]))-4,hi=Math.max(...coords.map(p=>p[0]))+4;
    const osMin=Math.min(...coords.map(p=>p[1])),osMax=Math.max(...coords.map(p=>p[1]));
    const scale=Math.min(900/(hi-lo),22,115/Math.max(6,osMax-osMin)),midOS=(osMin+osMax)/2;
    const xy=p=>{const [ch,os]=local(p);return[100+(ch-lo)*scale,212.5+(os-midOS)*scale];};
    const heads=[...new Set(secs.map(s=>s.pier))].map(id=>PIERS_RAW[id]);
    heads.forEach(head=>{
    const main=['P-1092','P-1093'].includes(head.id),a=main?2.5:1.75,b=main?3:3.24,cut=main?.15:.1;
    const angle=((head.deg||0)+(head.min||0)/60+(head.sec||0)/3600)*Math.PI/180;
    ctx.beginPath();[[-a+cut,-b],[-a,-b+cut],[-a,b-cut],[-a+cut,b],[a-cut,b],[a,b-cut],[a,-b+cut],[a-cut,-b]].forEach(([ch,os],i)=>{const [x,y]=xy({n:head.n+ch*Math.sin(angle)+os*Math.cos(angle),e:head.e-ch*Math.cos(angle)+os*Math.sin(angle)});i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fillStyle='#edf0f2';ctx.fill();ctx.strokeStyle='#c5ccd0';ctx.stroke();
    ctx.font='20px Arial';ctx.fillStyle='#6f7c83';const [hx]=xy(head);ctx.fillText(`${head.id} ${(a*2).toFixed(2)} × ${(b*2).toFixed(2)} m`,Math.min(830,Math.max(30,hx)),320);
    });
    const color=p=>p.os<0?'#c4554e':p.os>0?'#3678b0':'#24485f';
    const roles=[...new Set(pts.map(p=>p.role||p.label.split('-').at(-1)))];
    roles.forEach(role=>{const points=secs.map(s=>s.points.find(p=>(p.role||p.label.split('-').at(-1))===role)).filter(Boolean);ctx.beginPath();points.forEach((p,i)=>{const[x,y]=xy(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.strokeStyle=color(points[0]);ctx.lineWidth=1;ctx.stroke();});
    pts.forEach(p=>{const[x,y]=xy(p);ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle=color(p);ctx.fill();ctx.save();ctx.translate(x,y+(p.os<0?-15:22));ctx.rotate(-.65);ctx.font='bold 18px Arial';ctx.fillText(p.label,0,0);ctx.restore();});
    ctx.fillStyle='#24485f';ctx.font='20px Arial';ctx.fillText('Increasing chainage →  L = left / C = CL / R = right · '+mode().label,30,65);ctx.fillText('Nominal design geometry; RL excludes camber. Pending levels are withheld.',30,345);
  }

  function formatChainage(value){
    if(value===null||value===undefined||value==='')return '—';
    const metres=Number(String(value).replace('+',''));
    if(!Number.isFinite(metres)||metres<0)return '—';
    const mm=Math.round(metres*1000),km=Math.floor(mm/1000000);
    return km+'+'+((mm%1000000)/1000).toFixed(3).padStart(7,'0');
  }
  function fileTitle(){
    const names=(selected({})?.sections||[]).map(s=>s.name.replace(/[^a-zA-Z0-9.+-]+/g,'_'));
    return ['BR115',mode().file,...names].join('_');
  }
  function references(){return BR115Drawings.references();}

  return{isWork,isTop,mode,prepare,restore,structureChanged,selected,fileTitle,formatChainage,points:p=>selected(p)?.points||[],draw,calcDev,summary,references};
})();
