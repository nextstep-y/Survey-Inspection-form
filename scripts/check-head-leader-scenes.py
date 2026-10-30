"""Audit active head scenes; unused historical template variants are excluded."""
import bpy,json,os
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
report=json.loads((root/'output/head-label-audit/report.json').read_text())
seen=set();count=0
for row in report['rows']:
 if row['status']!='BLENDER_MATCH':continue
 if os.environ.get('PIER_IDS') and row['pier'] not in os.environ['PIER_IDS'].split(','):continue
 family,key=row['family'],row['template']
 if (family,key) in seen:continue
 seen.add((family,key))
 m=json.loads((root/f'assets/{family}-blender-manifest.js').read_text().split('=',1)[1].rstrip(';\n'))
 g=m['templates'][key]['geometry']
 bpy.ops.wm.open_mainfile(filepath=str(root/f'assets/models/{family}-blender/{key}.blend'))
 for p in g['points']:
  if not p['label'].startswith(('T','S')):continue
  leader=bpy.data.objects.get('Leader '+p['label'])
  assert leader is not None,(row['pier'],p['label'],'missing leader')
  start=Vector(leader.data.splines[0].points[0].co[:3])
  expected=Vector((p['os'],p.get('modelCH',p['ch'])*g['chSign'],(p.get('z') or 0)+.012))
  assert (start-expected).length<1e-4,(row['pier'],p['label'],'leader at wrong point')
  count+=1
 print('PASS_SCENE',row['pier'],key,flush=True)
print('PASS',len(seen),'active head scenes;',count,'point leader origins',flush=True)
