"""Build column references from explicit PDF title blocks, never numbering offsets."""
import json,re,subprocess,os,hashlib
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('/Users/weerayutpooncharoen/Library/CloudStorage/GoogleDrive-survey@itdp-cpn03.ph/Shared drives/SURVEY CP-N03 SHARE DRIVE/Pier Column')
CACHE=ROOT/'output/column-drawing-print/text';CACHE.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'assets/column-drawings';OUT.mkdir(parents=True,exist_ok=True)
def inspect(p):
 try:
  dest=CACHE/(p.stem+'.txt')
  if not dest.exists() or dest.stat().st_mtime < p.stat().st_mtime:
   text=subprocess.check_output(['pdftotext','-layout',str(p),'-'],text=True,stderr=subprocess.DEVNULL,timeout=90);dest.write_text(text)
  else:text=dest.read_text()
  code=re.search(r'ST-(\d{6})',p.name)[1]
  title=text[text.rfind('DRAWING TITLE'):]
  # Only the title-block Pier, not unrelated detail references elsewhere.
  ids=sorted(set(n+s.upper() for n,s in re.findall(r'\bP[-.][ \t]*(\d{3,4})[ \t]*(NB|SB|L|R|A)?\b',title,re.I)))
  revs=set(re.findall(r'ST-'+code+r'-([A-Z0-9]+)\b',title,re.I))
  suffix=p.name.split(code,1)[1]
  named=re.search(r'(?:-\s*(?:Rev\.?\s*)?|\s+Rev\.?\s*)([A-Z0-9]+)\.pdf$',suffix,re.I)
  rev=named[1].upper() if named else (next(iter(revs)).upper() if len(revs)==1 else None)
  issue=None
  if not re.search(r'PIER\s+COLUMN',title,re.I):issue='Not a Column title'
  elif not ids:issue='No explicit Pier in title'
  elif not rev:issue='Revision unconfirmed'
  elif revs and rev not in revs:
   reviewed={'021394':'B','021395':'B','022241':'D','022242':'D','022298':'B'}
   if code in reviewed and revs=={reviewed[code]}:rev=reviewed[code]
   else:issue='Filename/title revision conflict'
  return {'path':str(p),'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'code':code,'rev':rev,'piers':['P-'+i.upper() for i in ids],'title':title,'issue':issue}
 except Exception as e:return {'file':p.name,'issue':str(e)}
files=sorted(SOURCE.glob('*.pdf'))
with ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(inspect,files))
(ROOT/'output/column-drawing-print/inventory.json').write_text(json.dumps(rows,indent=2))
print(json.dumps({'files':len(rows),'usable':sum(not r.get('issue') for r in rows),'issues':[{'file':r['file'],'issue':r['issue']} for r in rows if r.get('issue')]}),flush=True)
if '--inspect-only' in os.sys.argv:raise SystemExit
valid=[r for r in rows if not r.get('issue')]
# Multiple distinct files with the same number must be reviewed, not silently selected.
group={}
for r in valid:group.setdefault(r['code'],[]).append(r)
for code,rs in group.items():
 if len(rs)>1:
  # P-1012 has explicit A and B source PDFs. Use the later supplied B,
  # without changing the pending P-1012 geometry update.
  if code=='021471' and {r['rev'] for r in rs}=={'A','B'}:
   for r in rs:
    if r['rev']=='A':r['issue']='Superseded by supplied Rev.B'
  else:
   for r in rs:r['issue']='Multiple files for drawing number - review required'
valid=[r for r in valid if not r.get('issue')]
def render(r):
 count=int(re.search(r'^Pages:\s*(\d+)',subprocess.check_output(['pdfinfo',r['path']],text=True),re.M)[1])
 pages=[]
 for i in range(1,count+1):
  target=OUT/f"{r['code']}-{r['rev']}-{i}"
  if '--reencode' in os.sys.argv or not target.with_suffix('.webp').exists():
   if not target.with_suffix('.jpg').exists():subprocess.run(['pdftoppm','-f',str(i),'-l',str(i),'-singlefile','-scale-to','3000','-jpeg','-jpegopt','quality=88',r['path'],str(target)],check=True,stderr=subprocess.DEVNULL)
   encoded=target.with_suffix('.tmp.webp')
   subprocess.run(['cwebp','-quiet','-resize','2400','0','-q','60',str(target.with_suffix('.jpg')),'-o',str(encoded)],check=True)
   encoded.replace(target.with_suffix('.webp'))
  pages.append(str(target.with_suffix('.webp').relative_to(ROOT)))
 return {'dwg':'NSCR-ITD-N03-ZWD-DWG-ST-'+r['code'],'rev':r['rev'],'sourceFile':r['file'],'sourceSha256':r['sha256'],'piers':r['piers'],'pages':pages}
with ThreadPoolExecutor(max_workers=4) as pool:drawings=list(pool.map(render,valid))
records={}
for r in drawings:
 for pier in r['piers']:records.setdefault(pier,[]).append(r)
for n in [976,977,1101,1102,1103,1108,1120,1121]:
 base='P-'+str(n)
 if base in records:
  for side in ['L','R']:records.setdefault(base+side,records[base])
data={'sourceFolder':'1qRQHVEiuMHdxZwbL3Hp51kvZZ_AlJcB_','checked':'2026-11-04','records':records,'drawings':{r['dwg']+'|'+r['rev']:r for r in drawings},'issues':[{'file':r['file'],'issue':r['issue']} for r in rows if r.get('issue')]}
(ROOT/'assets/column-drawing-pages.js').write_text('window.COLUMN_DRAWING_PAGES='+json.dumps(data,separators=(',',':'))+';\n')
(ROOT/'docs/column-drawing-print-coverage.json').write_text(json.dumps(data,indent=2))
print(json.dumps({'drawings':len(drawings),'piers':len(records),'pages':sum(len(r['pages']) for r in drawings)}))
