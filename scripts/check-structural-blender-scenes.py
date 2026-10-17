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
 body=t['geometry'].get('body')
 if body:
  for name in ['Head lower rim - review envelope','Head tapered underside - schematic profile']:
   assert name in bpy.data.objects,(key,'lower head missing')
  ob=bpy.data.objects['Head tapered underside - schematic profile']
  assert abs(min(v.co.z for v in ob.data.vertices)+body['depth'])<1e-5
  if body['stub']>0:assert 'Column connection - shortened' in bpy.data.objects
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
text=(root/'assets/bearing-blender-manifest.js').read_text()
bearing=json.loads(text.split('=',1)[1].rstrip(';\n'))
for key,t in bearing['templates'].items():
 bpy.ops.wm.open_mainfile(filepath=str(root/'assets/models/bearing-blender'/f'{key}.blend'))
 scene=bpy.context.scene;body=t['body']
 for ob in scene.objects:
  if ob.type=='MESH':
   for vertex in ob.data.vertices:
    v=world_to_camera_view(scene,scene.camera,ob.matrix_world@vertex.co)
    assert v.z>0 and .04<v.x<.96 and .06<v.y<.94,(key,ob.name,'model clipped')
 assert 'Head tapered underside - schematic profile' in bpy.data.objects
 ob=bpy.data.objects['Head tapered underside - schematic profile']
 assert abs(min(v.co.z for v in ob.data.vertices)+body['depth'])<1e-5
 record=next(r for r in bearing['records'].values() if r['template']==key)
 for p in record['points']:
  ob=bpy.data.objects[p['label']]
  assert abs(ob.location.x-p['os'])<1e-5 and abs(ob.location.y-p['ch'])<1e-5
  assert abs(ob.location.z-(p['z']-record['topPier']+.005))<1e-5
 for a in t['anchors']:
  ob=bpy.data.objects['Leader '+a['label']]
  v=world_to_camera_view(scene,scene.camera,ob.matrix_world@Vector(ob.data.splines[0].points[-1].co[:3]))
  assert v.z>0 and abs(v.x-a['x'])<1e-5 and abs(1-v.y-a['y'])<1e-5
print('PASS: '+str(len(bearing['templates']))+' bearing scenes; lower head body, unchanged bearing controls and visible leaders.',flush=True)
