"""Match existing work references to exact PDF revisions; never substitute."""
import json,re,subprocess,os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
DRIVE=Path('/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/SURVEY CP-N03 SHARE DRIVE')
refs=json.loads((ROOT/'output/head-drawing-print/references.json').read_text())
required={r['dwg']+'|'+r['rev'] for row in refs for r in row['refs']}
roots=[DRIVE/'PIER HEAD CONCRETE DETAILS',DRIVE/'Pier head type',DRIVE/'Survey Calculation-Program',Path.home()/'Downloads']
found={}
for folder in roots:
 for name in subprocess.check_output(['rg','--files',str(folder)],text=True).splitlines():
  m=re.search(r'(NSCR-ITD-N03-ZWD-DWG-ST-\d{6})(.*?)\.pdf$',Path(name).name,re.I)
  if not m:continue
  suffix=m[2].strip();rev=re.search(r'Rev\.?\s*([A-Z0-9]+)',suffix,re.I) or re.search(r'^[- _]+([A-Z0-9]+)',suffix,re.I)
  version=rev[1].upper() if rev else '0'
  # Filename omits revision; rendered title block explicitly reads B.
  if Path(name).name=='NSCR-ITD-N03-ZWD-DWG-ST-023000.pdf':version='B'
  aconex={'NSCR-ITD-N03-ZWD-DWG-ST-023031.pdf':'A','NSCR-ITD-N03-ZWD-DWG-ST-023241.pdf':'E','NSCR-ITD-N03-ZWD-DWG-ST-039531.pdf':'D'}
  if Path(name).name in aconex:version=aconex[Path(name).name]
  key=m[1].upper()+'|'+version
  if key in required:found.setdefault(key,Path(name))
catalog={};missing=[];jobs=[]
out=ROOT/'assets/head-drawings';out.mkdir(parents=True,exist_ok=True)
for key in sorted(required):
 if key not in found:missing.append(key);continue
 path=found[key];dwg,rev=key.split('|');code=dwg[-6:]
 info=subprocess.check_output(['pdfinfo',str(path)],text=True,stderr=subprocess.DEVNULL)
 count=int(re.search(r'^Pages:\s*(\d+)',info,re.M)[1])
 pages=[f'assets/head-drawings/{code}-{rev}-{i}.jpg' for i in range(1,count+1)]
 catalog[key]={'dwg':dwg,'rev':rev,'sourceFile':path.name,'sourceFolder':path.parent.name,'pages':pages}
 jobs.append((path,code,rev,count))
def render(job):
 path,code,rev,count=job
 for i in range(1,count+1):
  target=out/f'{code}-{rev}-{i}'
  if target.with_suffix('.jpg').exists():continue
  subprocess.run(['pdftoppm','-f',str(i),'-l',str(i),'-singlefile','-scale-to','3600','-jpeg','-jpegopt','quality=92',str(path),str(target)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
if '--catalog-only' not in os.sys.argv:
 with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(render,jobs))
status=[]
for row in refs:
 keys=[r['dwg']+'|'+r['rev'] for r in row['refs']]
 status.append({'pier':row['pier'],'work':row['work'],'references':keys,'missing':[k for k in keys if k not in catalog],'status':'READY' if keys and all(k in catalog for k in keys) else 'NO_REFERENCE' if not keys else 'PDF_REQUIRED'})
data={'checked':'2026-11-04','drawings':catalog,'missing':missing,'coverage':status}
(ROOT/'assets/head-drawing-pages.js').write_text('window.HEAD_DRAWING_PAGES='+json.dumps(data,separators=(',',':'))+';\n')
(ROOT/'docs/head-drawing-print-coverage.json').write_text(json.dumps(data,indent=2))
print(json.dumps({'required':len(required),'available':len(catalog),'pages':sum(len(x['pages']) for x in catalog.values()),'missing':missing,'coverage':{s:sum(x['status']==s for x in status) for s in ['READY','PDF_REQUIRED','NO_REFERENCE']}}))
