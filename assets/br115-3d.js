/* Survey visualization from reviewed joint coordinates and 120002-C section sizes.
   Linear loft between known joints; reinforcement, ducts, fillets and diaphragms omitted. */
window.BR115ThreeD=(()=>{
 let yaw=-0.62,pitch=0.52,zoom=1,drag=null,focused=null,hits=[];
 const W=1100,H=360;
 function draw(ctx,pier){
  const selected=BR115Bottom.selected(pier);
  if(focused&&!selected?.points.some(p=>p.label===focused))focused=null;
  const controls=document.getElementById('canvas-view-controls');if(controls)controls.style.display='flex';
  const status=document.getElementById('canvas-model-status');if(status){status.style.display='';status.textContent='Calculated 3D · drag to rotate';}
  const canvas=document.getElementById('pile-canvas');canvas.style.touchAction='none';
  let reset=document.getElementById('br115-3d-reset');if(!reset){reset=document.createElement('button');reset.id='br115-3d-reset';reset.type='button';reset.className='canvas-view-btn';reset.textContent='Reset view';controls.append(reset);}reset.hidden=false;
  reset.onclick=()=>{yaw=-.62;pitch=.52;zoom=1;focused=null;drawPileArray(currentPier);};
  let focus=document.getElementById('br115-point-focus');
  if(!focus){focus=document.createElement('select');focus.id='br115-point-focus';focus.setAttribute('aria-label','Highlight survey point');focus.style.cssText='max-width:180px;font:12px Arial;padding:4px';controls.append(focus);}
  focus.hidden=false;focus.replaceChildren();
  const allOption=document.createElement('option');allOption.value='';allOption.textContent='All points';focus.append(allOption);
  selected?.points.forEach(p=>{const option=document.createElement('option');option.value=p.label;option.textContent=p.label+' / '+p.joint;focus.append(option);});focus.value=focused||'';
  focus.onchange=()=>{focused=focus.value||null;drawPileArray(currentPier);};
  const hitAt=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;return hits.find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);};
  canvas.onpointerdown=e=>{if(canvasViewMode!=='3d'||!BR115Bottom.isWork(document.getElementById('element').value))return;const hit=hitAt(e);if(hit){focused=focused===hit.id?null:hit.id;drawPileArray(currentPier);return;}drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(!drag){const hit=hitAt(e);canvas.style.cursor=hit?'pointer':'grab';canvas.title=hit?.title||'Drag to rotate; click a point ID to highlight';return;}yaw+=(e.clientX-drag.x)*.008;pitch=Math.max(.15,Math.min(1.35,pitch+(e.clientY-drag.y)*.006));drag={x:e.clientX,y:e.clientY};drawPileArray(currentPier);};
  canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
  canvas.onwheel=e=>{if(canvasViewMode!=='3d'||!BR115Bottom.isWork(document.getElementById('element').value))return;e.preventDefault();zoom=Math.max(.6,Math.min(3,zoom*Math.exp(-e.deltaY*.001)));drawPileArray(currentPier);};
  hits=[];
  ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#24485f';ctx.font='bold 25px Arial';ctx.fillText(`BR115 | ${BR115Bottom.mode().label} | 3D`,26,29);
  ctx.font='18px Arial';ctx.fillText('L = left / C = CL / R = right, facing increasing chainage · RL excludes camber',26,54);
  if(!selected?.points.length){ctx.font='20px Arial';ctx.fillText('Select joints with confirmed chainages to show 3D.',26,110);return {joints:[],points:[]};}
  const all=BR115_BOTTOM_DATA.filter(s=>s.ch!==null).sort((a,b)=>a.ch-b.ch);
  const lo=Math.min(...selected.sections.filter(s=>s.ch!==null).map(s=>s.ch)),hi=Math.max(...selected.sections.filter(s=>s.ch!==null).map(s=>s.ch));
  const before=all.filter(s=>s.ch<lo).at(-1),after=all.find(s=>s.ch>hi);
  const sections=all.filter(s=>s.ch>=(before?.ch??lo)&&s.ch<=(after?.ch??hi));
  const origin=sections[Math.floor(sections.length/2)].points.find(p=>p.os===0),datum=Math.min(...sections.map(s=>s.tor-.65-s.h));
  const angle=((pier.deg||0)+(pier.min||0)/60+(pier.sec||0)/3600)*Math.PI/180;
  const local=p=>{const dn=p.n-origin.n,de=p.e-origin.e;return{x:dn*Math.sin(angle)-de*Math.cos(angle),y:dn*Math.cos(angle)+de*Math.sin(angle),z:p.z-datum};};
  const at=(s,os,z)=>{const source=BR115_BOTTOM_DATA.find(row=>row.name===s.name),c=source.points.find(p=>p.os===0),r=source.points.find(p=>p.os===3);return local({n:c.n+(r.n-c.n)*os/3,e:c.e+(r.e-c.e)*os/3,z});};
  const rotate=p=>{const v=p.x*Math.sin(yaw)+p.y*Math.cos(yaw);return{x:p.x*Math.cos(yaw)-p.y*Math.sin(yaw),y:v*Math.sin(pitch)-p.z*Math.cos(pitch),depth:v*Math.cos(pitch)+p.z*Math.sin(pitch)};};
  const ring=s=>{const t=s.tor-.65,b=t-s.h;return [[-5.15,t],[5.15,t],[5.15,t-.25],[4.25,t-.25],[3,t-.525],[3,b],[-3,b],[-3,t-.525],[-4.25,t-.25],[-5.15,t-.25]].map(([os,z])=>rotate(at(s,os,z)));};
  const inner=s=>{const d=window.BR115_SECTION_DATA?.[s.name];if(!d)return null;const t=s.tor-.65,b=t-s.h+d.d,w=3-d.w;return [[-w,t-.525],[-d.a,t-d.b],[d.a,t-d.b],[w,t-.525],[w,b+.15],[w-.15,b],[-w+.15,b],[-w,b+.15]].map(([os,z])=>rotate(at(s,os,z)));};
  const rings=sections.map(ring),inners=sections.map(inner),vertices=rings.flat();
  const minX=Math.min(...vertices.map(p=>p.x)),maxX=Math.max(...vertices.map(p=>p.x)),minY=Math.min(...vertices.map(p=>p.y)),maxY=Math.max(...vertices.map(p=>p.y));
  const scale=Math.min(880/Math.max(1,maxX-minX),166/Math.max(1,maxY-minY))*zoom;
  const project=p=>({x:W/2+(p.x-(minX+maxX)/2)*scale,y:185+(p.y-(minY+maxY)/2)*scale});
  const faces=[];
  for(let i=1;i<rings.length;i++)for(let j=0;j<rings[i].length;j++){const k=(j+1)%rings[i].length;faces.push({points:[rings[i-1][j],rings[i-1][k],rings[i][k],rings[i][j]],fill:j===0?'#dce7ed':j===5?'#aabfcd':'#c0d0db'});}
  for(let i=1;i<inners.length;i++)if(inners[i-1]&&inners[i])for(let j=0;j<inners[i].length;j++){const k=(j+1)%inners[i].length;faces.push({points:[inners[i-1][j],inners[i-1][k],inners[i][k],inners[i][j]],fill:'#899fac'});}
  for(const i of [0,rings.length-1])faces.push({points:rings[i],hole:inners[i],fill:'#b5c7d2'});
  faces.sort((a,b)=>b.points.reduce((s,p)=>s+p.depth,0)/b.points.length-a.points.reduce((s,p)=>s+p.depth,0)/a.points.length);
  const path=points=>points.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});
  ctx.save();ctx.beginPath();ctx.rect(12,76,W-24,232);ctx.clip();
  faces.forEach(face=>{ctx.beginPath();path(face.points);ctx.closePath();if(face.hole){path(face.hole);ctx.closePath();}ctx.fillStyle=face.fill;ctx.fill('evenodd');ctx.strokeStyle='#738d9e';ctx.lineWidth=.8;ctx.stroke();});
  // Selected sections are drawn through the envelope so Bottom points remain identifiable.
  selected.sections.filter(s=>s.ch!==null).forEach(s=>{ctx.beginPath();path(ring(s));ctx.closePath();ctx.strokeStyle='rgba(41,93,125,.55)';ctx.lineWidth=1.2;ctx.stroke();});
  ctx.restore();
  // Keep all IDs outside the envelope. Within each rail the projected X order
  // is retained so same-side leaders cannot cross one another.
  const labels=[],labelBoxes=[],leaders=[];
  const labelledJoint=selected.points.length>30?(selected.points.find(p=>p.label===focused)?.joint||selected.points[0]?.joint):null;
  const mapped=selected.points.filter(p=>Number.isFinite(p.z)).map(p=>({p,q:project(rotate(local(p))),color:p.os<0?'#c4554e':p.os>0?'#3678b0':'#183e57'}));
  [{side:'L',y:92,color:'#c4554e',match:p=>p.os<0},{side:'CL',y:286,color:'#183e57',match:p=>p.os===0},{side:'R',y:311,color:'#3678b0',match:p=>p.os>0}].forEach(rail=>{
    const row=mapped.filter(item=>rail.match(item.p)&&(!labelledJoint||item.p.joint===labelledJoint)).sort((a,b)=>a.q.x-b.q.x||a.p.ch-b.p.ch);
    const font=Math.min(21,Math.max(9,850/Math.max(1,row.length)/4.8));
    ctx.font='bold '+font+'px Arial';
    row.forEach((item,i)=>{
      const x=row.length===1?Math.min(980,Math.max(150,item.q.x)):120+i*880/(row.length-1);
      const width=ctx.measureText(item.p.label).width+14;
      const box={x:x-width/2,y:rail.y-17,w:width,h:23,id:item.p.label,title:item.p.label+' / '+item.p.joint+' | N '+item.p.n.toFixed(3)+' E '+item.p.e.toFixed(3)+' RL '+item.p.z.toFixed(3)};
      labelBoxes.push({...box,color:item.color,font,text:item.p.label,emphasized:!focused||focused===item.p.label});
      leaders.push({id:item.p.label,color:item.color,from:item.q,to:{x,y:rail.side==='L'?rail.y+6:rail.y-19},rail:rail.side});labels.push(item.p.label);hits.push(box);
    });
    ctx.fillStyle=rail.color;ctx.font='bold 17px Arial';ctx.fillText(rail.side,24,rail.y);
  });
  leaders.sort((a,b)=>Number(a.id===focused)-Number(b.id===focused)).forEach(line=>{
    ctx.save();ctx.globalAlpha=focused && line.id!==focused ? 0.18 : 0.85;
    ctx.strokeStyle=line.color;ctx.lineWidth=line.id===focused?3:1.2;ctx.beginPath();ctx.moveTo(line.from.x,line.from.y);ctx.lineTo(line.to.x,line.to.y);ctx.stroke();ctx.restore();
  });
  labelBoxes.forEach(box=>{ctx.save();ctx.globalAlpha=box.emphasized?1:.25;ctx.fillStyle='#fff';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.strokeStyle=box.color;ctx.lineWidth=box.id===focused?2:1;ctx.strokeRect(box.x,box.y,box.w,box.h);ctx.font='bold '+box.font+'px Arial';ctx.fillStyle=box.color;ctx.textAlign='center';ctx.fillText(box.text,box.x+box.w/2,box.y+17);ctx.restore();});
  mapped.sort((a,b)=>Number(a.p.label===focused)-Number(b.p.label===focused)).forEach(({p,q,color})=>{
    ctx.save();ctx.globalAlpha=focused && p.label!==focused ? 0.3 : 1;ctx.beginPath();ctx.arc(q.x,q.y,p.label===focused?7:5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.restore();
    hits.push({x:q.x-8,y:q.y-8,w:16,h:16,id:p.label,title:p.label+' / '+p.joint+' | RL '+p.z.toFixed(3)});
  });
  ctx.fillStyle='#526b7c';ctx.font='16px Arial';ctx.fillText('Calculated loft between joints; reinforcement, ducts, diaphragms and fillets omitted.',26,331);
  const point=selected.points.find(p=>p.label===focused);
  ctx.fillText(point?`${point.label} / ${point.joint} | N ${point.n.toFixed(3)}  E ${point.e.toFixed(3)}  RL ${Number.isFinite(point.z)?point.z.toFixed(3):'PENDING'}`:`Selected: ${selected.sections.length} joints / ${selected.points.length} points (${mapped.length} with target RL) · ${labelledJoint?'Labels: '+labelledJoint+' (choose point above)':'Click an ID to highlight its leader and point'}`,26,351);
  const result={joints:sections.map(s=>s.name),points:selected.points.map(p=>({id:p.label,n:p.n,e:p.e,z:p.z})),labels,labelBoxes:labelBoxes.map(({x,y,w,h,id})=>({x,y,w,h,id})),leaders,focused};canvas.dataset.br115Model=JSON.stringify(result);return result;
 }
 return{draw};
})();
