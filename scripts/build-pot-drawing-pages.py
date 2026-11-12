"""Package exact Pot detail pages; preserve full source sheets and revisions."""
from pathlib import Path
import subprocess,re,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path('/Users/weerayutpooncharoen/Library/CloudStorage/OneDrive-Personal/Documentos/03.Philippine/04.Drawing/21.Balance Cantiliver')
OUT=ROOT/'assets/pot-drawings';OUT.mkdir(parents=True,exist_ok=True)
TMP=ROOT/'output/pot-drawing-print';TMP.mkdir(parents=True,exist_ok=True)
refs=json.loads((TMP/'references.json').read_text())
required={r['dwg']+'|'+r['rev'] for row in refs for r in row['refs']}
catalog={}
pack=SOURCE/'BR115/NSCR-GCR-N03-ZWD-DRC-ST-001714 (Rev. B)(1).pdf'
for code in list(range(66040,66046))+list(range(66052,66058)):
 number=f'{code:06d}';dwg='NSCR-ITD-N03-ZWD-DWG-ST-'+number;key=dwg+'|B'
 if key not in required:continue
 pdf=SOURCE/f'BR114/{dwg}-B.pdf' if code<66050 else pack
 page=1 if code<66050 else code-66046
 text=subprocess.check_output(['pdftotext','-f',str(page),'-l',str(page),'-layout',str(pdf),'-'],text=True)
 if not re.search(re.escape(dwg)+r'-B\b',text):raise RuntimeError('Revision/title mismatch '+key)
 if 'POT BEARING' not in text.upper():raise RuntimeError('Not a Pot detail '+key)
 target=OUT/f'{number}-B-1';raster=TMP/f'{number}-B-1'
 subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-singlefile','-scale-to','3000','-jpeg','-jpegopt','quality=92',str(pdf),str(raster)],check=True,stderr=subprocess.DEVNULL)
 subprocess.run(['cwebp','-quiet','-q','82',str(raster.with_suffix('.jpg')),'-o',str(target.with_suffix('.webp'))],check=True)
 catalog[key]={'dwg':dwg,'rev':'B','sourceFile':pdf.name,'sourcePdfPage':page,'sourceSha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'pages':[str(target.with_suffix('.webp').relative_to(ROOT))]}
missing=sorted(required-set(catalog))
coverage=[{'pier':r['pier'],'references':[x['dwg']+'|'+x['rev'] for x in r['refs']],'status':'READY' if r['refs'] and all(x['dwg']+'|'+x['rev'] in catalog for x in r['refs']) else 'NO_REFERENCE' if not r['refs'] else 'PDF_REQUIRED'} for r in refs]
data={'checked':'2026-11-12','drawings':catalog,'missing':missing,'coverage':coverage}
(ROOT/'assets/pot-drawing-pages.js').write_text('window.POT_DRAWING_PAGES='+json.dumps(data,separators=(',',':'))+';\n')
(ROOT/'docs/pot-drawing-print-coverage.json').write_text(json.dumps(data,indent=2))
print(json.dumps({'drawings':len(catalog),'missing':missing,'ready':sum(r['status']=='READY' for r in coverage)}))
