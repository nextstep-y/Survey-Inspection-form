import bpy,json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'assets/dowel-blender-manifest.js').read_text().split('=',1)[1].rstrip(';\n'))
for key,t in m['templates'].items():
 bpy.ops.wm.open_mainfile(filepath=str(root/'assets/models/dowel-blender'/f'{key}.blend'))
 s=bpy.context.scene;g=t['geometry']
 if g.get('detailedP1091'):
  assert 'Low island 1200 wide EL115.110' in bpy.data.objects
  assert 'High island 1200 wide EL115.710' in bpy.data.objects
  assert any(o.name.startswith('Left edge upstand') for o in s.objects)
  assert any(o.name.startswith('Right edge upstand') for o in s.objects)
 for p in g['points']:
  o=bpy.data.objects[p['label']]
  assert abs(o.location.x-p['os'])<1e-5
  assert abs(o.location.y-p.get('modelCH',p['ch'])*g['chSign'])<1e-5
  assert abs(o.location.z-((p['z'] or 0)+.012))<1e-5
  if p.get('kind')=='dowel':
   assert o['relative_Z']=='UNKNOWN - plan axis projection only'
   assert o.show_in_front
 for a in t['anchors']:
  o=bpy.data.objects['Leader '+a['label']]
  v=world_to_camera_view(s,s.camera,Vector(o.data.splines[0].points[-1].co[:3]))
  assert v.z>0 and abs(v.x-a['x'])<1e-5 and abs(1-v.y-a['y'])<1e-5
 for o in s.objects:
  if o.type=='MESH':
   for vert in o.data.vertices:
    v=world_to_camera_view(s,s.camera,o.matrix_world@vert.co)
    assert v.z>0 and .025<v.x<.975 and .04<v.y<.96,(key,o.name,'clipped')
print('PASS '+str(len(m['templates']))+' Dowel scenes: axis coordinates, explicit unknown Z, visible markers, leader rails, detailed P-1091 retained.',flush=True)
