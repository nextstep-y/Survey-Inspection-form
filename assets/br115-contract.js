/* Verified against rendered CP N-03 Contract Doc Vol 3 of 15.pdf,
   Book 3 TS200, PDF pages 144-149 and 152 (one-based), 2026-11-19.
   Numeric dimensional/relative criteria are not absolute coordinate tolerances. */
window.BR115Contract=(()=>{
 const source={file:'CP N-03 Contract Doc Vol 3 of 15.pdf',book:'Book 3 - TS200',verified:'2026-11-19'};
 const clauses={
  survey:{clause:'206.18.1.2',page:'TS200-140',pdf:145,accuracyMm:3},
  segment:{clause:'206.18.2 / Table 206.18-1',page:'TS200-141',pdf:146,gradeMm:3,gaugeM:3,slabThicknessMm:9,topWidthMmPer300:1.5,topWidthMaximumMm:25},
  forms:{clause:'206.18.4.1',page:'TS200-144',pdf:149,flatJointStepMm:1.5,cornerJointStepMm:3,adjacentCipFaceOffsetMm:6},
  camber:{clause:'206.18.1.1; 206.18.3.2; 206.18.6.2',pages:['TS200-139','TS200-143','TS200-147'],pdf:[144,148,152]}
 };
 const barText=()=> ['bbs','bts'].includes(BR115Bottom.mode().key)?'Survey accuracy ±3 mm; form-edge/soffit grade ±3 mm / 3 m | TS200 §206.18':'Survey accuracy ±3 mm (measurement accuracy); acceptance per approved geometry | TS200 §206.18';
 function lines(){
  const top=BR115Bottom.isTop(),mode=BR115Bottom.mode();
  return [
   'Survey accuracy: ±3 mm [1]. Form-edge / soffit grade: ±3 mm over 3 m [2]. These are not absolute N/E/RL acceptance limits.',
   (top?'Top slab thickness: ±9 mm; overall top width: ±1.5 mm per 300 mm, maximum ±25 mm [2]. Top flatness: 3 mm in 3 m along traffic, only for bridges without overlay [2].':mode.key==='web'?'Web thickness: ±9 mm [2]. Step 2 construction-joint elevation must come from its drawing; this thickness limit is not an RL tolerance.':mode.key==='bts'?'Top slab thickness: ±9 mm [2] (thickness tolerance, not soffit RL tolerance).':'Bottom slab thickness: ±9 mm [2] (thickness tolerance, not Bottom RL tolerance).'),
   'Form-joint offset: flat surfaces ≤1.5 mm; corners/bends ≤3 mm. Offset between adjacent matching cast-in-place segment faces: ≤6 mm [3].',
   'Absolute position / RL acceptance: use contract drawings / Engineer-directed tolerances and approved stage geometry. Camber is pending; point deviations shown are against nominal design only, without automatic PASS/FAIL.',
   'Source: Contract Vol.3, Book 3 TS200. [1] §206.18.1.2, p.140 (PDF 145). [2] §206.18.2, Table 206.18-1, p.141 (PDF 146). [3] §206.18.4.1, p.144 (PDF 149). Camber: §206.18.1.1 / 206.18.3.2, pp.139 / 143 (PDF 144 / 148).'
  ];
 }
 function render(){
  let panel=document.getElementById('br115-contract-criteria');
  if(!panel){panel=document.createElement('section');panel.id='br115-contract-criteria';document.getElementById('survey-table').before(panel);}
  const enabled=BR115Bottom.isWork(document.getElementById('element').value);panel.hidden=!enabled;if(!enabled)return;
  const title=document.createElement('b');title.textContent='BR115 — Contract survey / geometry criteria';
  panel.replaceChildren(title);lines().forEach((text,i)=>{const line=document.createElement('div');line.textContent=text;if(i===4)line.className='br115-contract-source';panel.append(line);});
 }
 return{source,clauses,barText,lines,render};
})();
