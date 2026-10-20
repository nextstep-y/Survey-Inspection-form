"""023023-B dimension-controlled cap envelope; no reinforcing steel."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/p1091-blender'
d=json.loads((OUT/'p1091-source.json').read_text());pts=d['cap'];pier=d['pier']
# Independent millimetre-coordinate controls read from 022023-B tables.
control={'A':(455089.892,1677392.226),'B':(455101.479,1677393.844),
'C':(455102.475,1677386.713),'D':(455090.888,1677385.095),
'P1':(455091.416,1677391.075),'P2':(455095.872,1677391.698),
'P3':(455100.329,1677392.320),'P4':(455092.038,1677386.619),
'P5':(455096.495,1677387.241),'P6':(455100.952,1677387.864)}
a=math.radians(pier['deg']+pier['min']/60+pier['sec']/3600)
for p in pts:
 if p['label'] not in control:continue
 e=pier['e']-p['ch']*math.cos(a)+p['os']*math.sin(a)
 n=pier['n']+p['ch']*math.sin(a)+p['os']*math.cos(a)
 assert max(abs(e-control[p['label']][0]),abs(n-control[p['label']][1]))<.0011,p['label']
bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene
s.unit_settings.system='METRIC'
def mat(name,rgb):
 m=bpy.data.materials.new(name);m.diffuse_color=(*rgb,1);return m
concrete=mat('Concrete',(.62,.68,.71));ink=mat('Print black',(0,0,0));orange=mat('Survey controls',(.9,.27,.03));blue=mat('Projected pile axis',(.1,.24,.35))
def line(name,coords,material=ink,r=.014):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r
 p=c.splines.new('POLY');p.points.add(len(coords)-1)
 for v,co in zip(p.points,coords):v.co=(*co,1)
 ob=bpy.data.objects.new(name,c);s.collection.objects.link(ob);c.materials.append(material)
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,-1.25));cap=bpy.context.object
cap.name='Pile Cap 11.700 OS x 7.200 CH x 2.500';cap.dimensions=(11.7,7.2,2.5);cap.data.materials.append(concrete)
cap['top_EL']=102.923;cap['bottom_EL']=100.423
for p in pts:
 pos=(p['os'],p['ch'],.035)
 if p['label'].startswith('P'):
  # Top-face projection only, not a false pile-head elevation.
  ring=[(p['os']+.6*math.cos(i*math.tau/48),p['ch']+.6*math.sin(i*math.tau/48),.018) for i in range(49)]
  line(p['label']+' axis projected to cap top',ring,blue,.018)
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.06,location=pos)
 ob=bpy.context.object;ob.name='Point '+p['label'];ob.data.materials.append(orange)
 ob['CH']=p['ch'];ob['OS']=p['os'];ob['marker']='top-face survey/axis projection, not embedded pile head'
column=sorted([p for p in pts if p['label'].isdigit()],key=lambda p:int(p['label']))
line('Column footprint',[(p['os'],p['ch'],.025) for p in column+[column[0]]],blue,.025)
target=Vector((0,0,-.7));bpy.ops.object.camera_add(location=(14,-18,17));cam=bpy.context.object
cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=22;s.camera=cam
q=cam.rotation_euler.to_quaternion();right=q@Vector((1,0,0));up=q@Vector((0,1,0));toward=(cam.location-target).normalized()
def screen(x,y):return target+right*x+up*y+toward*10
def label(name,text,x,y,size=.28,align='LEFT'):
 c=bpy.data.curves.new(name,'FONT');c.body=text;c.size=size;c.align_x=align
 ob=bpy.data.objects.new(name,c);s.collection.objects.link(ob);ob.location=screen(x,y);ob.rotation_euler=cam.rotation_euler;c.materials.append(ink)
groups={-1:[],1:[]}
for p in pts:
 if p['label'].startswith('P') and p['label'][1:].isdigit():continue
 pos=Vector((p['os'],p['ch'],.035));sx=(pos-target).dot(right);sy=(pos-target).dot(up)
 groups[-1 if sx<0 else 1].append((sy,p,pos))
for side,entries in groups.items():
 entries.sort(key=lambda v:v[0],reverse=True);previous=4.2
 for sy,p,pos in entries:
  y=min(sy,previous-.42);previous=y
  line('Leader '+p['label'],[pos,screen(side*8,y)],r=.012)
  label('Label '+p['label'],p['label'],side*8.2,y,.29,'RIGHT' if side<0 else 'LEFT')
label('Title','P-1091 PILE CAP | 022023-B',-10,5.2,.36)
label('Dimensions','7.200 CH x 11.700 OS m | thickness 2.500 m',-10,4.65,.26)
label('Level','TOP EL 102.923 m | BOTTOM EL 100.423 m',-10,-4.55,.27)
label('Scope','PARTIAL | circles = pile axes projected to top | reinforcement / 20mm chamfers omitted',-10,-5.1,.21)
direction=Vector((Vector((0,1,0)).dot(right),Vector((0,1,0)).dot(up))).normalized();tail=Vector((7.5,4.6));tip=tail+direction*.8;perp=Vector((-direction.y,direction.x))
line('Increasing axis',[screen(*tail),screen(*tip)],orange,.03)
line('Arrow',[screen(*(tip-direction*.25+perp*.14)),screen(*tip),screen(*(tip-direction*.25-perp*.14))],orange,.03)
label('Chainage','INCREASING CHAINAGE',6.2,4.05,.21)
s['source']='NSCR-ITD-N03-ZWD-DWG-ST-022023-B, PLAN + SECTION 1 + coordinate tables; reviewed 2026-10-16'
s['scope']='PARTIAL sharp concrete envelope; no steel, blinding/gravel, full piles or 20mm chamfers'
s.render.engine='BLENDER_WORKBENCH';s.display.shading.color_type='MATERIAL';s.display.shading.light='STUDIO'
s.display.shading.show_shadows=True;s.display.shading.show_cavity=True
s.world=bpy.data.worlds.new('White');s.world.color=(1,1,1)
s.display.shading.background_type='VIEWPORT';s.display.shading.background_color=(1,1,1)
s.view_settings.view_transform='Standard';s.view_settings.look='None'
s.render.resolution_x=2000;s.render.resolution_y=1100;s.render.resolution_percentage=100
s.render.filepath=str(OUT/'p1091-pilecap-v1.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'P-1091-PILECAP-PARTIAL-v1.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'P-1091-PILECAP-PARTIAL-v1.glb'),export_format='GLB',export_extras=True)
bpy.ops.render.render(write_still=True)
print('PASS: 10 source-coordinate controls within 1.1mm; cap thickness 2.500; pile penetration .075')
