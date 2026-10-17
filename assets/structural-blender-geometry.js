// One serializable geometry contract for the Blender exporter and browser guard.
// Coordinates remain local survey CH/OS; no change to tables or CSV calculations.
window.StructuralBlender = (() => {
  const round = n => Number(Number(n).toFixed(6));
  const ring = ps => {
    const ch=ps.reduce((s,p)=>s+p.ch,0)/ps.length, os=ps.reduce((s,p)=>s+p.os,0)/ps.length;
    return [...ps].sort((a,b)=>Math.atan2(a.ch-ch,a.os-os)-Math.atan2(b.ch-ch,b.os-os));
  };
  const rect = (a,b,c,d) => [{ch:a,os:c},{ch:a,os:d},{ch:b,os:d},{ch:b,os:c}];
  function bodyFor(pier,work='Pier Head') {
    const model=getPierHeadModel(pier),ps=model.points.filter(p=>/^T\d+$/.test(p.label));
    if(ps.length<4)return null;
    const sign=pier.id==='P-1091'&&work!=='Pier Head'?-1:1;
    const a=Math.min(...ps.map(p=>p.ch*sign)),b=Math.max(...ps.map(p=>p.ch*sign)),c=Math.min(...ps.map(p=>p.os)),d=Math.max(...ps.map(p=>p.os));
    if(!(b>a&&d>c))return null;
    const measured=model.topPier-(Number(pier.topCap)+Number(pier.columnHeightMm)/1000);
    const knownDepth=Number(pier.columnHeightMm)>0&&Number.isFinite(Number(pier.topCap))&&Number.isFinite(measured)&&measured>0&&measured<6;
    const depth=round(knownDepth?measured:Math.min(b-a,d-c)*.45);
    const column=ring(_columnArrayPoints(pier).filter(p=>/^\d+$/.test(p.label))).map(p=>({ch:round(p.ch),os:round(p.os)}));
    const stub=column.length>=3?round(Math.min(Math.max(...column.map(p=>p.ch))-Math.min(...column.map(p=>p.ch)),Math.max(...column.map(p=>p.os))-Math.min(...column.map(p=>p.os)))*.55):0;
    return {upper:ring(rect(a,b,c,d)),column,depth,rim:round(Math.min(.3,depth*.2)),stub,knownDepth,
      status:knownDepth?'PARTIAL | head depth from levels; lower profile schematic':'PARTIAL | lower profile and depth schematic'};
  }
  function pointsFor(pier,work) {
    if(work==='Pier Head')return getPierHeadModel(pier).points;
    const imported=_excelChOsPoints(pier,work,'canvas');
    const key=WORK_ARRAY_KEY[work](pier);
    let points=imported || (_isColumnWork(work)?_columnArrayPoints(pier):ARRAYS_RAW[key]||ARRAYS_RAW[pier.piles]||[]);
    points=_orientPierSpecificPoints(pier,work,points,Boolean(imported));
    return work==='Pile cap'&&!imported?_buildPileCapCanvasPoints(pier,key,points):points;
  }
  function build(pier,work,input=pointsFor(pier,work)) {
    const kind=_isColumnWork(work)?'Column':work;
    if(!['Column','Pile cap','Pier Head'].includes(kind))return null;
    const head=kind==='Pier Head', datum=head?getTopOfColumnElevation(pier):0;
    if(head&&!Number.isFinite(datum))return null;
    if(!input.length || input.some(p=>!Number.isFinite(p.ch)||!Number.isFinite(p.os)))return null;
    const points=input.map(p=>({label:String(p.label),ch:round(p.ch),os:round(p.os),z:head&&Number.isFinite(p.z)?round(p.z-datum):head&&/^T\d+$/.test(p.label)?null:0}));
    if(new Set(points.map(p=>p.label)).size!==points.length)return null;
    const boundary=points.filter(p=>head?/^T\d+$/.test(p.label):kind==='Column'?/^\d+$/.test(p.label):/^[A-H]$/.test(p.label));
    if(boundary.length<3)return null;
    const minCH=Math.min(...boundary.map(p=>p.ch)),maxCH=Math.max(...boundary.map(p=>p.ch));
    const minOS=Math.min(...boundary.map(p=>p.os)),maxOS=Math.max(...boundary.map(p=>p.os));
    if(!(maxCH>minCH&&maxOS>minOS))return null;
    const surfaces=[],lines=[];
    let capDepth=null,islandMissing=false;
    const add=(name,ps,top,bottom=null)=>surfaces.push({name,ring:ring(ps).map(p=>({ch:p.ch,os:p.os})),top:round(top),bottom:bottom===null?null:round(bottom)});
    let status;
    if(kind==='Column') {
      add('Upper shaft',boundary,0,-Math.min(maxCH-minCH,maxOS-minOS)*.65);
      status='PARTIAL | upper shaft only; lift height not shown';
    } else if(kind==='Pile cap') {
      capDepth={value:round(Math.max(.6,Math.min(2.5,Math.min(maxCH-minCH,maxOS-minOS)*.2))),known:false,source:'schematic display proportion only'};
      add('Cap body',boundary,0,-capDepth.value);
      const column=points.filter(p=>/^\d+$/.test(p.label));
      if(column.length>=3)lines.push(ring(column));
      const diameter=String(pier.piles||'').match(/(\d{3,4})\s*DIA/i);
      if(diameter){
        const radius=Number(diameter[1])/2000;
        for(const p of points.filter(p=>/^P\d+$/.test(p.label)))lines.push(Array.from({length:48},(_,i)=>({os:round(p.os+radius*Math.cos(i*Math.PI/24)),ch:round(p.ch+radius*Math.sin(i*Math.PI/24))})));
      }
      status='PARTIAL | cap depth schematic; pile axes projected to top';
    } else {
      const step=pier.id==='P-1094'||pier.id==='P-1091'?.6:0;
      if(step&&minCH<0&&maxCH>0){
        add('Low top',rect(minCH,0,minOS,maxOS),0);
        add('High top',rect(0,maxCH,minOS,maxOS),step,0);
      }else add('Head top envelope',rect(minCH,maxCH,minOS,maxOS),0);
      const islands=points.filter(p=>/^T\d+$/.test(p.label)&&Number(p.label.slice(1))>=5).sort((a,b)=>Number(a.label.slice(1))-Number(b.label.slice(1)));
      for(let i=0;i<islands.length;i+=4){
        const ps=islands.slice(i,i+4);
        if(ps.length!==4||ps.some((p,j)=>Number(p.label.slice(1))!==5+i+j)){islandMissing=true;continue;}
        const ordered=ring(ps),distinct=new Set(ps.map(p=>p.ch+','+p.os));
        // Four survey corners must define a non-degenerate parallelogram.
        // Do not expand duplicate / malformed source points into a large box.
        const area=ordered.reduce((s,p,j)=>s+p.os*ordered[(j+1)%4].ch-ordered[(j+1)%4].os*p.ch,0)/2;
        const midError=Math.hypot(ordered[0].ch+ordered[2].ch-ordered[1].ch-ordered[3].ch,ordered[0].os+ordered[2].os-ordered[1].os-ordered[3].os);
        if(distinct.size!==4||Math.abs(area)<1e-5||midError>.006){islandMissing=true;continue;}
        const a=Math.min(...ps.map(p=>p.ch)),b=Math.max(...ps.map(p=>p.ch)),c=Math.min(...ps.map(p=>p.os)),d=Math.max(...ps.map(p=>p.os));
        if(!(b>a&&d>c)){islandMissing=true;continue;}
        const split=step&&a<0&&b>0;
        if(split&&ps.some(p=>!([a,b].includes(p.ch)&&[c,d].includes(p.os)))){islandMissing=true;continue;}
        const pieces=step&&a<0&&b>0?[[a,0],[0,b]]:[[a,b]];
        for(const [lo,hi] of pieces){
          const zs=ps.filter(p=>p.ch>=lo-1e-6&&p.ch<=hi+1e-6).map(p=>p.z);
          if(!zs.length||zs.some(z=>z===null)||Math.max(...zs)-Math.min(...zs)>1e-5){islandMissing=true;continue;}
          const base=step&&(lo+hi)>0?step:0;
          if(zs[0]>base)add('Island',split?rect(lo,hi,c,d):ps,zs[0],base);
        }
      }
      status=bodyFor(pier,work)?.status||'PARTIAL | lower profile unavailable';
      if(points.some(p=>p.z===null))status+=' | ? = missing EL';
      else if(islandMissing)status+=' | Island geometry incomplete';
    }
    return {kind,points,surfaces,lines,status,chSign:pier.id==='P-1091'&&head?-1:1,...(head?{body:bodyFor(pier,work),islandMissing}:{}),...(capDepth?{capDepth}:{})};
  }
  function islandsFor(pier,headPoints=null) {
    const model=build(pier,'Pier Head',headPoints||pointsFor(pier,'Pier Head'));
    if(!model)return {surfaces:[],missing:true};
    // P-1091 head survey CH has the opposite display sense to its bearing CH.
    const sign=pier.id==='P-1091'?-1:1;
    return {surfaces:model.surfaces.filter(s=>s.name==='Island').map(s=>({...s,ring:s.ring.map(p=>({ch:round(p.ch*sign),os:p.os}))})),missing:model.islandMissing||model.points.some(p=>p.z===null)};
  }
  return {build,pointsFor,bodyFor,islandsFor};
})();
