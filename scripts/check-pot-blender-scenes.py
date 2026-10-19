"""Inspect saved Blender solids against canonical source controls."""
import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
source=json.loads((root/'output/pot-blender/source.json').read_text())
for id,g in source.items():
 bpy.ops.wm.open_mainfile(filepath=str(root/'assets/models/pot-blender'/(id+'.blend')))
 s=bpy.context.scene
 for p in g['points']:
  o=s.objects.get(p['label']);assert o is not None
  assert abs(o['CH']-p['ch'])<1e-8 and abs(o['OS']-p['os'])<1e-8 and abs(o['design_Z']-p['z'])<1e-8
 for p in g['points'][::4]:
  solids=[o for o in s.objects if o.type=='MESH' and o.get('bearing_type')==p['bearing']]
  assert len(solids)>=3,(id,p['bearing'],'missing solid components')
  zs=[(o.matrix_world@Vector(v)).z for o in solids for v in o.bound_box]
  assert abs(max(zs)-(p['z']-g['top']))<1e-6
  assert abs(min(zs)-(p['z']-g['top']-p['assemblyHeight']))<1e-6
  grout=s.objects.get('Bottom grout '+p['bearing']);assert grout is not None
  assert abs(grout.dimensions.z-p['bottomGrout'])<1e-6
 assert not any('Assembly height envelope' in o.name for o in s.objects)
 print('PASS',id,'solid components, source markers, assembly height, separate grout')
