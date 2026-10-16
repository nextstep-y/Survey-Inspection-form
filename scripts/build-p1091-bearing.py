"""Blender bearing-plinth close-up using approved P-1091 V5 context."""
import bpy,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/p1091-blender'
d=json.loads((OUT/'p1091-source.json').read_text());datum=d['head']['topPier']
bpy.ops.wm.open_mainfile(filepath=str(OUT/'P-1091-PARTIAL-v5.blend'))
for ob in list(bpy.data.objects):
 if ob.type!='MESH' or ob.name.startswith(('T','Column ')):
  bpy.data.objects.remove(ob,do_unlink=True)
s=bpy.context.scene;ink=bpy.data.materials['Print black labels and leaders'];orange=bpy.data.materials['Island survey controls - NO footprint']
for ob in s.objects:
 if 'edge upstand' in ob.name: ob.hide_render=True # retain in model, hide to expose all plinth corners
target=Vector((0,0,.0));bpy.ops.object.camera_add(location=(10,-13,12));cam=bpy.context.object
cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=17.5;s.camera=cam
q=cam.rotation_euler.to_quaternion();right=q@Vector((1,0,0));up=q@Vector((0,1,0));toward=(cam.location-target).normalized()
def screen(x,y):return target+right*x+up*y+toward*7
def line(name,coords,mat=ink,r=.01):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r
 p=c.splines.new('POLY');p.points.add(len(coords)-1)
 for v,co in zip(p.points,coords):v.co=(*co,1)
 ob=bpy.data.objects.new(name,c);s.collection.objects.link(ob);c.materials.append(mat)
def label(name,text,x,y,size=.24,align='LEFT'):
 c=bpy.data.curves.new(name,'FONT');c.body=text;c.size=size;c.align_x=align
 ob=bpy.data.objects.new(name,c);s.collection.objects.link(ob);ob.location=screen(x,y);ob.rotation_euler=cam.rotation_euler;c.materials.append(ink)
groups={-1:[],1:[]}
for p in d['plinths']:
 pos=Vector((p['os'],p['ch'],p['z']-datum)) # bearing's own canonical frame
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.04,location=pos)
 ob=bpy.context.object;ob.name=p['label'];ob.data.materials.append(orange)
 ob['CH']=p['ch'];ob['OS']=p['os'];ob['EL']=p['z']
 groups[-1 if p['os']<0 else 1].append(((pos-target).dot(up),p,pos))
for side,entries in groups.items():
 entries.sort(key=lambda e:e[0],reverse=True);previous=3.1
 for py,p,pos in entries:
  y=min(py,previous-.36);previous=y
  line('Leader '+p['label'],[pos,screen(side*5.3,y)])
  label('Label '+p['label'],p['label']+' '+f"{p['z']:.3f}",side*5.45,y,.23,'RIGHT' if side<0 else 'LEFT')
label('Title','P-1091 BEARING PLINTHS',-8,4.25,.31)
label('Scope','PARTIAL | edge walls hidden in view | EL in metres',-8,3.8,.21)
direction=Vector((Vector((0,1,0)).dot(right),Vector((0,1,0)).dot(up))).normalized()
tail=Vector((6.3,3.55));tip=tail+direction*.8;perp=Vector((-direction.y,direction.x))
line('Increasing axis',[screen(*tail),screen(*tip)],orange,.025)
line('Arrow',[screen(*(tip-direction*.24+perp*.12)),screen(*tip),screen(*(tip-direction*.24-perp*.12))],orange,.025)
label('Chainage','INCREASING CHAINAGE',5.2,3.2,.19)
label('Levels','UL / UR 114.917 m   |   DL / DR 115.543 m',-8,-3.9,.23)
label('Exclusions','No pot bearing / anchors / grout; detailed chamfers excluded',-8,-4.3,.19)
s['scope']='P-1091 source-verified plinth sizes/centres/levels; inherited PARTIAL head context; no pot assembly'
s.render.resolution_x=2000;s.render.resolution_y=1100;s.render.resolution_percentage=100
s.render.filepath=str(OUT/'p1091-bearing-v1.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'P-1091-BEARING-PARTIAL-v1.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'P-1091-BEARING-PARTIAL-v1.glb'),export_format='GLB',export_extras=True)
bpy.ops.render.render(write_still=True)
print('PASS: 16 bearing labels retain CH/OS/EL from app snapshot')
