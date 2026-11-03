"""Read-only CSV intake; render source PDFs for offline browser printing."""
import csv,json,re,subprocess,os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(os.environ.get('PILECAP_SOURCE','/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/SURVEY CP-N03 SHARE DRIVE/Pile Cap '))
meta=json.loads((ROOT/'docs/pilecap-drive-files.json').read_text())
files={}
for f in meta['files']:
 m=re.search(r'ST-(\d{6})',f['name'])
 if m:files.setdefault(m[1],[]).append(f)
records={};issues=[];jobs=[]
for line,row in enumerate(csv.reader((SOURCE/'Pile Cap Drawing list.csv').open(encoding='utf-8-sig')),1):
 if len(row)<3 or not row[0].strip():continue
 raw,rev,title=row[:3];m=re.search(r'P[-.\s]*(\d{3,4}(?:NB|SB|A)?)\b',title,re.I)
 if not m:issues.append({'row':line,'reason':'Pier identity missing','raw':row});continue
 pier='P-'+m[1].upper();suffix=re.split(r'ST[-.]',raw,flags=re.I)[-1];code=re.sub(r'\D','',suffix)
 # Explicit corrections visually verified against the source title blocks.
 fixed={'P-828':'020015','P-833':'020050'}
 if len(code)!=6:
  if pier in fixed:code=fixed[pier]
  else:issues.append({'row':line,'pier':pier,'reason':'Malformed drawing number','raw':raw});continue
 listed_rev=rev.strip()
 if pier=='P-1132' and code=='022464':rev='C' # User confirmed 2026-11-03.
 matches=files.get(code,[])
 if len(matches)!=1:issues.append({'row':line,'pier':pier,'reason':'PDF missing or ambiguous','code':code});continue
 f=matches[0];explicit=re.search(r'(?:Rev\s*|[- ])([A-Z])\.pdf$',f['name'],re.I)
 if explicit and explicit[1].upper()!=rev.strip().upper():
  issues.append({'row':line,'pier':pier,'reason':'CSV/PDF revision conflict','csv':rev,'file':f['name']});continue
 path=SOURCE/f['name']
 if not path.exists():issues.append({'row':line,'pier':pier,'reason':'Local source not available','file':f['name']});continue
 info=subprocess.check_output(['pdfinfo',str(path)],text=True,stderr=subprocess.DEVNULL)
 pages=int(re.search(r'^Pages:\s*(\d+)',info,re.M)[1])
 item={'dwg':'NSCR-ITD-N03-ZWD-DWG-ST-'+code,'rev':rev.strip(),'listedRevision':listed_rev,'revisionSource':'User confirmed PDF Rev.C, 2026-11-03' if rev.strip()!=listed_rev else 'CSV register','title':title,'sourceRow':line,'sourceFile':f['name'],'driveId':f['id'],'pages':[f'assets/pilecap-drawings/{code}-{rev.strip()}-{i}.jpg' for i in range(1,pages+1)]}
 records.setdefault(pier,[]).append(item);jobs.append((path,code,rev.strip(),pages))
out=ROOT/'assets/pilecap-drawings';out.mkdir(parents=True,exist_ok=True)
def render(job):
 path,code,rev,pages=job
 if all((out/f'{code}-{rev}-{i}.jpg').exists() for i in range(1,pages+1)):return
 for i in range(1,pages+1):
  prefix=out/f'{code}-{rev}-{i}'
  subprocess.run(['pdftoppm','-f',str(i),'-l',str(i),'-singlefile','-scale-to','3600','-jpeg','-jpegopt','quality=92',str(path),str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
if '--catalog-only' not in os.sys.argv:
 with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(render,jobs))
data={'sourceFolder':meta['folderId'],'sourceList':'Pile Cap Drawing list.csv','checked':'2026-11-03','records':records,'issues':issues}
(ROOT/'assets/pilecap-drawing-register.js').write_text('window.PILECAP_DRAWING_REGISTER='+json.dumps(data,separators=(',',':'))+';\n')
(ROOT/'docs/pilecap-drawing-intake.json').write_text(json.dumps(data,indent=2))
print(json.dumps({'piers':len(records),'drawings':len(jobs),'pages':sum(j[3] for j in jobs),'issues':issues}))
