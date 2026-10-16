// Read the same canonical model as the form; never import the reconciliation CSV.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const context = vm.createContext({window:{}, document:{getElementById:()=>({value:'TYPE1'})}});
vm.runInContext(html.match(/<script id="data-script">([\s\S]*?)<\/script>/)[1], context);
const start=html.indexOf('const PIERS_RAW = ');
vm.runInContext(html.slice(start,html.indexOf('// STATE',start)),context);
const data=vm.runInContext(`(()=>{
 const pier=PIERS_RAW['P-1091'];
 return {pier, head:getPierHeadModel(pier),column:_columnArrayPoints(pier),
 cap:_buildPileCapCanvasPoints(pier,_pileCapArrayKey(pier),ARRAYS_RAW[_pileCapArrayKey(pier)]||[]),
 plinths:_orientPierSpecificPoints(pier,'Bearing Plinths',[],true).map(p=>({...p,z:getWorkPointElev(pier,'Bearing Plinths',p.label)}))};
})()`,context);
data.status='PARTIAL - survey review prototype, not construction geometry';
data.axes='X=OS, Y=-canonical Pier Head CH (increasing chainage), Z=EL-114.793; bearing CH converted separately';
data.source='docs/p1091-canvas-geometry-audit.md; 023165-C; column schedule 022024-A';
const output=path.join(root,'output','p1091-blender');
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'p1091-source.json'),JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify(data,null,2));
