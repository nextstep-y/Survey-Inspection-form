/* Five survey surfaces. Method: MST-ST-000099 Rev.A, PDF 9-14, ITP 23/25/26.
   Geometry: 120001-C, 120002-C and joint-specific segment dimension drawings.
   The supplied method covers PS70/PS71 pier tables, not every cantilever segment. */
window.BR115Surfaces=(()=>{
 const definitions=[
  {key:'bbs',work:'BR115 Bottom of Bottom Slab',label:'Bottom of Bottom Slab',prefix:'B',file:'Bottom_of_Bottom_Slab',step:1,item:'6.2',page:23,formula:'TOR - 0.650 - H',description:'Soffit of bottom slab: CL and outer edges at ±3.000 m.'},
  {key:'tbs',work:'BR115 Top of Bottom Slab',label:'Top of Bottom Slab',prefix:'U',file:'Top_of_Bottom_Slab',step:1,item:'6.2',page:23,formula:'TOR - 0.650 - H + D',description:'Finished flat floor: CL and flat-slab ends before the 150 mm bottom haunch/chamfer. Not the top of a wall starter.'},
  {key:'web',work:'BR115 Top of Web (Wall)',label:'Top of Web (Wall)',prefix:'W',file:'Top_of_Web_Wall',step:2,item:'7.4',page:25,formula:'TOR - 0.650 - approved Step 2 construction-joint offset',description:'End of Concrete Step 2: left/right web centre lines only; no CL point over the box void. Construction-joint RL is withheld until its dimension and source are entered.'},
  {key:'bts',work:'BR115 Bottom of Top Slab',label:'Bottom of Top Slab',prefix:'S',file:'Bottom_of_Top_Slab',step:3,item:'8.2',page:26,formula:'CL: TOR - 0.650 - B; outer wing tips: TOR - 0.650 - 0.250',description:'Soffit of top slab: CL and outer wing tips at ±5.150 m. CL and wing-tip levels differ where B is not 250 mm.'},
  {key:'tts',work:'BR115 Top of Top Slab',label:'Top of Top Slab',prefix:'T',file:'Top_of_Top_Slab',step:3,item:'8.2',page:26,formula:'TOR - 0.650',description:'Finished deck surface: CL and outer edges at ±5.150 m.'}
 ];
 const aliases={'BR115 Bottom Slab':'bbs','BR115 Top of Slab':'tts'};
 let wallTargets={};try{wallTargets=JSON.parse(localStorage.getItem('br115-step2-targets')||'{}');}catch(_){}
 const definition=work=>definitions.find(d=>d.work===work||d.key===aliases[work]);
 const current=()=>definition(document.getElementById('element')?.value)||definitions[0];
 const isPierTable=name=>/^(PS70[SN]|PS71[SN]|P[23][SN]|P109[23] [+-]2\.5)$/.test(name);
 function methodInfo(sections){
  const mode=current(),names=(sections||[]).map(s=>s.name),table=names.some(isPierTable),outside=names.some(n=>!isPierTable(n));
  return {reference:table?'NSCR-ITD-N03-ZWD-MST-ST-000099 Rev.A / Appendix 2 (ITP)':'MST-ST-000099 Rev.A: pier-table scope only',item:table?'Item '+mode.item+(outside?' (pier-table joints only)':''):'— (outside supplied pier-table method scope)',scope:'Concrete Step '+mode.step+'; MST-ST-000099 Rev.A, PDF '+mode.page+' (ITP). Applies to PS70 / PS71 pier tables only.'};
 }
 function wallTarget(name){const d=wallTargets[name];return d&&Number.isFinite(d.offset)&&d.offset>=0&&typeof d.ref==='string'&&d.ref.trim()?d:null;}
 function setWallTarget(name,offset,ref){if(offset===''&&!ref.trim())delete wallTargets[name];else{const n=Number(offset);if(offset===''||!Number.isFinite(n)||n<0||!ref.trim())throw Error('Enter a non-negative offset and drawing / revision reference.');const section=BR115_BOTTOM_DATA.find(s=>s.name===name);if(!section||n>=section.h)throw Error('The Step 2 interface must be above the bottom of the box girder.');wallTargets[name]={offset:n,ref:ref.trim()};}localStorage.setItem('br115-step2-targets',JSON.stringify(wallTargets));}
 function build(section,mode=current()){
  if(!section.points.length)return {...section,points:[],pending:'Joint chainage is not confirmed.'};
  const c=section.points.find(p=>p.os===0),r=section.points.find(p=>p.os===3),top=section.tor-.650,bottom=top-section.h;
  const dims=window.BR115_SECTION_DATA?.[section.name];const base=c.label.replace(/-C$/,'').replace(/^B/,mode.prefix);
  const at=(side,os,z,reason='')=>({label:base+'-'+side,role:side,os,ch:section.ch,n:c.n+(r.n-c.n)*os/3,e:c.e+(r.e-c.e)*os/3,z,levelStatus:reason||'Nominal design; excludes camber',source:mode.key==='web'?wallTarget(section.name)?.ref||'Step 2 construction-joint dimension pending':'120001-C / 120002-C; '+section.name});
  let points=[],pending='';
  if(mode.key==='bbs')points=section.points.map(p=>({...p,role:p.os<0?'L':p.os>0?'R':'C',ch:section.ch}));
  if(mode.key==='tts')points=[at('L',-5.15,top),at('C',0,top),at('R',5.15,top)];
  if(mode.key==='tbs'){
   if(dims){const os=3-dims.w-.150;points=[at('L',-os,bottom+dims.d),at('C',0,bottom+dims.d),at('R',os,bottom+dims.d)];}
   else{pending='D / W section dimensions are not verified at this extra offset section; only CL plan position is available.';points=[at('C',0,null,pending)];}
  }
  if(mode.key==='bts'){
   points=[at('L',-5.15,top-.250),at('C',0,dims?top-dims.b:null,dims?'':'B thickness not verified at this extra offset section'),at('R',5.15,top-.250)];
   if(!dims)pending='CL soffit RL is pending B thickness; outer wing-tip levels use the 250 mm detail.';
  }
  if(mode.key==='web'){
   const target=wallTarget(section.name);
   if(dims){const os=3-dims.w/2,z=target?top-target.offset:null;points=[at('L',-os,z,target?'':'Step 2 construction-joint RL pending'),at('R',os,z,target?'':'Step 2 construction-joint RL pending')];}
   else pending='Web thickness / centre-line offset is not verified at this extra offset section.';
   if(!target)pending+=(pending?' ':'')+'The 525 mm web/haunch dimension is geometry, not a verified Step 2 construction-joint elevation.';
  }
  let warning=['bbs','tbs'].includes(mode.key)?section.warning:'';
  if(mode.key==='tbs'&&/^P2[SN]$/.test(section.name))warning+=(warning?' ':'')+'D: 120002-C schedule = 911 mm; 120006-C Half Section B shows 912 mm. Retain the schedule pending clarification.';
  return {...section,points,pending,warning};
 }
 return{definitions,definition,current,isPierTable,methodInfo,build,wallTarget,setWallTarget};
})();
