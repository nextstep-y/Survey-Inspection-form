"""Read-only PDF evidence capture. Does not infer approved stake-out geometry."""
from pathlib import Path
import subprocess,json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/br-dowel-audit';OUT.mkdir(parents=True,exist_ok=True)
DRIVE=Path('/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/ITD CP N03 TEAM DRIVE/SUBSTRUCTURE/PIERHEAD')
spec={'888':('BR114','023177-A'),'889':('BR114','023011-B'),'890':('BR114','023159-A'),'891':('BR114','023158-B'),'1048':('BR112','023003-B'),'1051':('BR112','023003-B'),'1091':('BR115','023165-C'),'1092':('BR115','023167-B'),'1093':('BR115','023162-B'),'1094':('BR115','023170-B')}
records={}
for p,(group,num) in spec.items():
 files=list((DRIVE/group).rglob('*'+num+'.pdf'))
 matches=[f for f in files if ('P-'+p) in str(f) or ('P '+p) in str(f)]
 f=(matches or files)[-1];out=OUT/('plan-'+p)
 subprocess.run(['pdftotext','-layout',str(f),str(out)+'.txt'],check=True)
 subprocess.run(['pdftoppm','-png','-singlefile','-scale-to','2800',str(f),str(out)],check=True)
 records[p]=str(f);print(p,f.name,flush=True)
pot=Path('/Users/weerayutpooncharoen/Library/CloudStorage/OneDrive-Personal/Documentos/03.Philippine/04.Drawing/21.Balance Cantiliver/BCPotdrawings_Scale1to1-MO-REVISED by P Num (1).pdf')
subprocess.run(['pdftoppm','-png','-singlefile','-scale-to','10000',str(pot),str(OUT/'pot-details')],check=True)
records['pot']=str(pot)
(OUT/'sources.json').write_text(json.dumps(records,indent=2))
