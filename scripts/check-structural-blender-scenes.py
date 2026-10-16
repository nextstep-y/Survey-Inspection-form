"""Check saved Blender scenes, including annotation clipping on wide heads."""
import bpy,json
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
root=Path(__file__).resolve().parents[1]
text=(root/'assets/structural-blender-manifest.js').read_text()
manifest=json.loads(text.split('=',1)[1].rstrip(';\n'))
for key,t in manifest['templates'].items():
 bpy.ops.wm.open_mainfile(filepath=str(root/'assets/models/structural-blender'/f'{key}.blend'))
 scene=bpy.context.scene
 for a in t['anchors']:
  ob=bpy.data.objects['Leader '+a['label']]
  endpoint=ob.matrix_world@Vector(ob.data.splines[0].points[-1].co[:3])
  projected=world_to_camera_view(scene,scene.camera,endpoint)
  assert projected.z>0,(key,a['label'],'leader behind camera')
  assert abs(projected.x-a['x'])<1e-5,(key,a['label'],'x mismatch')
  assert abs(1-projected.y-a['y'])<1e-5,(key,a['label'],'y mismatch')
 for p in t['geometry']['points']:
  ob=bpy.data.objects[p['label']]
  assert abs(ob.location.x-p['os'])<1e-5
  assert abs(ob.location.y-p['ch']*t['geometry']['chSign'])<1e-5
  assert abs(ob.location.z-((p['z'] or 0)+.012))<1e-5
 for ob in [bpy.data.objects['Increasing chainage'],bpy.data.objects['Arrow']]:
  for p in ob.data.splines[0].points:
   v=world_to_camera_view(scene,scene.camera,ob.matrix_world@Vector(p.co[:3]))
   assert v.z>0 and 0<v.x<1 and 0<v.y<1,(key,'arrow clipped')
print('PASS: '+str(len(manifest['templates']))+' Blender scenes; survey markers, leader anchors and chainage arrows within camera.',flush=True)
