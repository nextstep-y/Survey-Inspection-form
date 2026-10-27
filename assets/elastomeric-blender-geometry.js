// Shared by offline rendering and the live-image freshness guard.
window.ElastomericBlender=(()=>{
 const round=n=>Number(n.toFixed(6));
 function points(pier,work,input){
  const imported=input||_excelChOsPoints(pier,work,'canvas');
  const raw=imported||ARRAYS_RAW[WORK_ARRAY_KEY[work](pier)]||[];
  const ps=input||_orientPierSpecificPoints(pier,work,raw,Boolean(imported));
  return ps.map(p=>({label:p.label,ch:round(p.ch),os:round(p.os),z:round(getWorkPointElev(pier,work,p.label)-getTopOfColumnElevation(pier))}));
 }
 function groups(ps){
  const result={};
  for(const p of ps){const m=p.label.match(/^(.+?)(\d+)$/);if(!m)return null;(result[m[1]+':'+Math.floor((+m[2]-1)/4)]??=[]).push(p);}
  const gs=Object.values(result);
  return gs.length&&gs.every(g=>g.length===4&&new Set(g.map(p=>p.ch+','+p.os)).size===4)?gs:null;
 }
 function build(pier,input,headInput){
  const ps=points(pier,'Elastomeric',input),plinth=points(pier,'Bearing Plinths');
  if(ps.length<4||[...ps,...plinth].some(p=>![p.ch,p.os,p.z].every(Number.isFinite)))return null;
  const gs=groups(ps),pg=groups(plinth)||[],ts=getPierHeadModel(pier).points.filter(p=>/^T\d+$/.test(p.label));
  if(!gs||ts.length<4)return null;
  // Match by physical containment, not label prefix: imported names can differ.
  const pads=[];let supportMissing=!pg.length;
  for(const g of gs){
   const ch=g.reduce((s,p)=>s+p.ch,0)/4,os=g.reduce((s,p)=>s+p.os,0)/4;
   const matches=pg.filter(b=>ch>=Math.min(...b.map(p=>p.ch))-1e-6&&ch<=Math.max(...b.map(p=>p.ch))+1e-6&&os>=Math.min(...b.map(p=>p.os))-1e-6&&os<=Math.max(...b.map(p=>p.os))+1e-6);
   const support=matches.length===1?matches[0]:null;
   if(!support)supportMissing=true;
   const base=support?support.reduce((s,p)=>s+p.z,0)/4:round(getWorkPointElev(pier,'Bearing Plinths',g[0].label.replace(/^E/,''))-getTopOfColumnElevation(pier));
   if(support&&Math.max(...support.map(p=>p.z))-Math.min(...support.map(p=>p.z))>1e-5||g.some(p=>p.z<=base))return null;
   pads.push({points:g,base:round(base),rise:round(g[0].z-base)});
  }
  // Never fabricate or relocate a supporting footprint to hide a source conflict.
  return {points:ps,groups:supportMissing?[]:pg,pads,supportMissing,head:getDrawingPlinthControl(pier)?.headBounds||{minCH:Math.min(...ts.map(p=>p.ch)),maxCH:Math.max(...ts.map(p=>p.ch)),minOS:Math.min(...ts.map(p=>p.os)),maxOS:Math.max(...ts.map(p=>p.os))},
   step:['P-1091','P-1094'].includes(pier.id)?.6:0,highSign:pier.id==='P-1091'?-1:1,...(getConfirmedBearingHeadStep(pier)||{}),body:window.StructuralBlender.bodyFor(pier,'Bearing Plinths'),islands:window.StructuralBlender.islandsFor(pier,headInput),renderRevision:'elastomeric-1'};
 }
 return {build};
})();
