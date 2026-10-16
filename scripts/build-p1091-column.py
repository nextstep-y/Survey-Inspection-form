"""P-1091 full shaft review; no invented lift construction joint."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/p1091-blender'
d=json.loads((OUT/'p1091-source.json').read_text())
bpy.ops.wm.open_mainfile(filepath=str(OUT/'P-1091-PARTIAL-v5.blend'))
shaft=bpy.data.objects['Column 3x2m H8.970m - app corner profile']
for ob in list(bpy.data.objects):
    if ob!=shaft: bpy.data.objects.remove(ob,do_unlink=True)
scene=bpy.context.scene
base=d['pier']['topCap']; height=d['pier']['columnHeightMm']/1000; top=base+height
ink=bpy.data.materials['Print black labels and leaders']
orange=bpy.data.materials['Island survey controls - NO footprint']
target=Vector((0,0,-6.0))
bpy.ops.object.camera_add(location=(12,-16,10))
camera=bpy.context.object; camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'; camera.data.ortho_scale=15.5; scene.camera=camera
q=camera.rotation_euler.to_quaternion(); right=q@Vector((1,0,0)); up=q@Vector((0,1,0)); toward=(camera.location-target).normalized()
def screen(x,y):return target+right*x+up*y+toward*6
def line(name,pts,mat=ink,r=.012):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r
 p=c.splines.new('POLY');p.points.add(len(pts)-1)
 for v,co in zip(p.points,pts):v.co=(*co,1)
 ob=bpy.data.objects.new(name,c);scene.collection.objects.link(ob);c.materials.append(mat)
def label(name,text,x,y,size=.23,align='LEFT'):
 c=bpy.data.curves.new(name,'FONT');c.body=text;c.size=size;c.align_x=align
 ob=bpy.data.objects.new(name,c);scene.collection.objects.link(ob);ob.location=screen(x,y);ob.rotation_euler=camera.rotation_euler;c.materials.append(ink)
groups={-1:[],1:[]}
for p in d['column']:
 pos=Vector((p['os'],-p['ch'],top-d['head']['topPier']))
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.05,location=pos)
 ob=bpy.context.object;ob.name='Column '+p['label'];ob.data.materials.append(orange)
 ob['CH']=p['ch'];ob['OS']=p['os'];ob['EL']=top
 sx=(pos-target).dot(right);sy=(pos-target).dot(up)
 groups[-1 if sx<0 else 1].append((sy,p,pos))
for side,entries in groups.items():
 entries.sort(key=lambda e:e[0],reverse=True)
 previous=4.1
 for sy,p,pos in entries:
  y=min(sy,previous-.43);previous=y
  line('Leader '+p['label'],[pos,screen(side*3.5,y)],r=.008)
  label('Label '+p['label'],p['label'],side*3.65,y,.26,'RIGHT' if side<0 else 'LEFT')
label('Title','P-1091 COLUMN | FULL SHAFT',-6.7,5.25,.29)
label('Scope','PARTIAL | lift joint not defined | offsets in metres',-6.7,4.8,.20)
label('Top','TOP OF SHAFT  '+f'{top:.3f} m',-6.7,-1.7,.24)
label('Base','BASE / TOP CAP  '+f'{base:.3f} m',-6.7,-2.25,.24)
label('Height','COLUMN HEIGHT  '+f'{height:.3f} m',-6.7,-2.8,.24)
label('Size','ENVELOPE 3.000 OS x 2.000 CH m',-6.7,-3.35,.21)
label('Datum','Pier head low top 114.793 m is NOT shaft top',-6.7,-4.5,.20)
direction=Vector((Vector((0,1,0)).dot(right),Vector((0,1,0)).dot(up))).normalized()
tail=Vector((4.3,4.3));tip=tail+direction*.9;perp=Vector((-direction.y,direction.x))
line('Increasing axis',[screen(*tail),screen(*tip)],orange,.025)
line('Arrow',[screen(*(tip-direction*.25+perp*.13)),screen(*tip),screen(*(tip-direction*.25-perp*.13))],orange,.025)
label('Chainage','INCREASING CHAINAGE',3.3,3.8,.18)
scene['status']='PARTIAL full shaft review; no first/second lift boundary; app profile not newly drawing-certified'
scene.render.resolution_x=1800;scene.render.resolution_y=1300
scene.render.filepath=str(OUT/'p1091-column-v1.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'P-1091-COLUMN-PARTIAL-v1.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'P-1091-COLUMN-PARTIAL-v1.glb'),export_format='GLB',export_extras=True)
bpy.ops.render.render(write_still=True)
assert abs(top-111.893)<1e-8
print(json.dumps({'base':base,'top':top,'height':height,'points':len(d['column'])}))
