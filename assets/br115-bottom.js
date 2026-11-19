/* BR115 lower box slab: absolute alignment coordinates, not pier-axis rotation. */
window.BR115Bottom = (() => {
  const choices={}, observations={};
  const isWork=value=>['BR115 Bottom Slab','BR115 Top of Slab'].includes(value);
  const isTop=()=>document.getElementById('element').value==='BR115 Top of Slab';
  let active=null;
  const list=()=>window.BR115_BOTTOM_DATA;
  function selected(pier){
    const sections=list(pier);if(!sections.length)return null;
    if(!choices.BR115)choices.BR115=[sections.find(s=>s.name==='PS70N'||s.name==='PS71N')?.name||sections[0].name];
    const chosen=sections.filter(s=>choices.BR115.includes(s.name)).sort((a,b)=>(a.ch??Infinity)-(b.ch??Infinity));
    const surfaces=chosen.map(section=>{
      if(!isTop()||!section.points.length)return section;
      const c=section.points.find(p=>p.os===0),r=section.points.find(p=>p.os===3);
      // 120001-C: flat top surface, 10300 mm wide, CL to edge 5150 mm.
      const points=section.points.map(p=>{const os=p.os/3*5.15;return {...p,label:p.label.replace(/^B/,'T'),os,n:c.n+(r.n-c.n)*os/3,e:c.e+(r.e-c.e)*os/3,z:section.tor-0.650};});
      return {...section,points,warning:''};
    });
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
    if(!enabled){const reset=document.getElementById('br115-3d-reset');if(reset)reset.hidden=true;const focus=document.getElementById('br115-point-focus');if(focus)focus.hidden=true;const canvas=document.getElementById('pile-canvas');canvas.onpointerdown=canvas.onpointermove=canvas.onpointerup=canvas.onpointercancel=canvas.onwheel=null;canvas.style.touchAction='auto';active=null;const picker=document.getElementById('br115-work-group');if(picker)picker.hidden=true;return;}
    active=selected(pier);
    const sections=list(pier);
    let picker=document.getElementById('br115-work-group');
    if(!picker){picker=document.createElement('div');picker.id='br115-work-group';picker.className='no-print';document.getElementById('element-col').append(picker);}
    picker.hidden=false;
    picker.innerHTML=sections.length?`<div style="max-height:190px;overflow:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px">${sections.map(s=>`<label style="font-size:12px;display:flex;gap:5px;align-items:center"><input type="checkbox" data-joint="${esc(s.name)}" ${choices.BR115.includes(s.name)?'checked':''}>${esc(s.name)}${s.ch===null?' (CH pending)':''}${s.warning&&!isTop()?' ⚠':''}</label>`).join('')}</div><div style="display:flex;gap:4px;margin-top:6px"><button type="button" data-action="all">Select all</button><button type="button" data-action="clear">Clear</button></div><div style="font-size:11px;margin-top:6px">Range (increasing CH)</div><select aria-label="From joint" id="br115-from">${sections.filter(s=>s.ch!==null).sort((a,b)=>a.ch-b.ch).map(s=>`<option>${esc(s.name)}</option>`).join('')}</select><select aria-label="To joint" id="br115-to">${sections.filter(s=>s.ch!==null).sort((a,b)=>a.ch-b.ch).map(s=>`<option>${esc(s.name)}</option>`).join('')}</select><button type="button" data-action="range">Add range</button>`:'Select P-1091 to P-1094.';
    const change=names=>{remember();choices.BR115=names;renderSurveyTable(pier);updatePrintVals();refreshDwgDisplay();};
    picker.querySelectorAll('[data-joint]').forEach(el=>el.onchange=()=>change([...picker.querySelectorAll('[data-joint]:checked')].map(e=>e.dataset.joint)));
    picker.querySelectorAll('[data-action]').forEach(el=>el.onclick=()=>{
      if(el.dataset.action==='all')change(sections.map(s=>s.name));
      else if(el.dataset.action==='clear')change([]);
      else {const a=sections.find(s=>s.name===document.getElementById('br115-from').value).ch,b=sections.find(s=>s.name===document.getElementById('br115-to').value).ch;change([...new Set([...choices.BR115,...sections.filter(s=>s.ch!==null&&s.ch>=Math.min(a,b)&&s.ch<=Math.max(a,b)).map(s=>s.name)])]);}
    });
    panel.innerHTML='<b>BR115 — '+(isTop()?'Top of Slab':'Bottom of lower box slab')+'</b><div id="br115-details"></div>';
    const details=document.getElementById('br115-details');
    const rows=active?.sections||[];
    details.innerHTML=`<b>Selected joints: ${esc(active?.name||'None')} (${active?.points.length||0} points)</b><br>L / C / R: ${isTop()?'left −5.150 m / CL / right +5.150 m':'left −3.000 m / CL / right +3.000 m'}, facing increasing chainage.<br><b>${isTop()?'Top = TOR − 0.650':'Bottom = TOR − 0.650 − H'}. Camber pending: these are NOT formwork setting levels.</b><br>${rows.map(s=>s.ch===null?esc(s.name)+': CH pending — no coordinates or levels':esc(s.name)+': CH '+Math.floor(s.ch/1000)+'+'+(s.ch%1000).toFixed(3)+' · TOR '+s.tor.toFixed(3)+' · H '+s.h.toFixed(3)+(isTop()?' · Top ':' · Bottom ')+s.points[0].z.toFixed(3)+(s.warning?' <b style="color:#9a5d00">'+esc(s.warning)+'</b>':'')).join('<br>')}`;
  }

  function restore(){
    if(!isWork(document.getElementById('element').value))return;
    active?.points.forEach((p,i)=>(observations[p.label]||[]).forEach((v,j)=>{const input=document.getElementById(`in-${['n','e','z'][j]}-${i}`);if(input)input.value=v;}));
    active?.points.forEach((p,i)=>calcDev(i));summary();
  }

  function calcDev(i){
    const tr=document.querySelector(`tr[data-idx="${i}"]`);if(!tr)return;
    const values=['n','e','z'].map(k=>{const el=document.getElementById(`in-${k}-${i}`);return el?.value.trim()?getPrefixVal(el.id):NaN;});
    const dif=values.map((v,j)=>v-Number(tr.dataset[['dn','de','ez'][j]]));
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
    ctx.fillStyle='#fff';ctx.fillRect(0,0,1100,360);ctx.fillStyle='#24485f';ctx.font='bold 27px Arial';ctx.fillText(`BR115 ${isTop()?'Top of Slab':'Bottom slab'} | ${active?.sections.length||0} joints`,30,30);
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
    ['#c4554e','#24485f','#3678b0'].forEach((color,j)=>{ctx.beginPath();secs.forEach((s,i)=>{const [x,y]=xy(s.points[j]);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.strokeStyle=color;ctx.lineWidth=1;ctx.stroke();});
    secs.forEach(s=>s.points.forEach((p,j)=>{const[x,y]=xy(p);ctx.beginPath();ctx.arc(x,y,active.sections.includes(s)?5:2,0,Math.PI*2);ctx.fillStyle=['#c4554e','#24485f','#3678b0'][j];ctx.fill();if(active.sections.includes(s)){ctx.save();ctx.translate(x,y+(j===0?-15:22));ctx.rotate(-.65);ctx.font='bold 24px Arial';ctx.fillText(p.label,0,0);ctx.restore();}}));
    ctx.fillStyle='#24485f';ctx.font='22px Arial';ctx.fillText('Increasing chainage →    L = left / C = CL / R = right | '+(isTop()?'top slab width 10.300 m':'lower slab width 6.000 m'),30,65);ctx.fillText('Selected points highlighted. Gray: actual pier head footprint. '+(isTop()?'Top':'Bottom')+' RL excludes camber.',30,345);
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
    return ['BR115',...(isTop()?['Top_of_Slab']:[]),...names].join('_');
  }
  function references(){const refs=[{dwg:'NSCR-ITD-N03-ZWD-DWG-ST-120002',rev:'C',roles:['Joint heights / Bottom levels'],source:'Reviewed BR115 workbook'}];return{work,refs,status:'REFERENCE FOUND',text:'120001-C / 120002-C / 120003-C; CP N-01 ALT03 profile PL0018-B; review DRC-002342/002345/002346/002349. H conflicts: 71N1, 71S5.'};}
  return{isWork,isTop,prepare,restore,structureChanged,selected,fileTitle,formatChainage,points:p=>selected(p)?.points||[],draw,calcDev,summary,references};
})();
