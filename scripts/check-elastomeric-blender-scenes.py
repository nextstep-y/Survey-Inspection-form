import bpy,json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'assets/elastomeric-blender-manifest.js').read_text().split('=',1)[1].rstrip(';\n'))
for key,t in m['templates'].items():
 bpy.ops.wm.open_mainfile(filepath=str(root/'assets/models/elastomeric-blender'/f'{key}.blend'))
 s=bpy.context.scene
 for p in t['geometry']['points']:
  ob=bpy.data.objects[p['label']]
  assert abs(ob.location.x-p['os'])<1e-5 and abs(ob.location.y-p['ch'])<1e-5
  assert abs(ob.location.z-p['z']-.005)<1e-5
 for a in t['anchors']:
  ob=bpy.data.objects['Leader '+a['label']]
  v=world_to_camera_view(s,s.camera,Vector(ob.data.splines[0].points[-1].co[:3]))
  assert v.z>0 and abs(v.x-a['x'])<1e-5 and abs(1-v.y-a['y'])<1e-5
 for ob in s.objects:
  if ob.type=='MESH':
   for vert in ob.data.vertices:
    v=world_to_camera_view(s,s.camera,ob.matrix_world@vert.co)
    assert v.z>0 and .03<v.x<.97 and .05<v.y<.95,(key,ob.name,'clipped')
 for p in t['geometry']['pads']:
  ob=bpy.data.objects['Elastomeric '+sorted(p['points'],key=lambda q:__import__('math').atan2(q['ch']-sum(x['ch'] for x in p['points'])/4,q['os']-sum(x['os'] for x in p['points'])/4))[0]['label']]
  assert abs(ob['height_above_plinth']-.067)<1e-6
print('PASS '+str(len(m['templates']))+' Elastomeric scenes: point locations, leaders, visible bounds and pad thickness.',flush=True)
