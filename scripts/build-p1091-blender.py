"""Run with Blender --background --python this_file. Isolated new scene only.
Geometry is a PARTIAL envelope, not approved concrete fabrication geometry.
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/p1091-blender'
data = json.loads((OUT/'p1091-source.json').read_text())
datum = data['head']['topPier']
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1
scene['status'] = data['status']
scene['source'] = data['source']
scene['origin_EL'] = datum
scene['origin_N'] = data['pier']['n']
scene['origin_E'] = data['pier']['e']
scene['axes'] = data['axes']

def material(name, rgb):
    m=bpy.data.materials.new(name); m.diffuse_color=(*rgb,1); return m
concrete=material('PARTIAL concrete envelope',(0.57,0.65,0.70))
plinth=material('Drawing controlled plinth',(0.84,0.66,0.28))
orange=material('Island survey controls - NO footprint',(1,0.30,0.04))
island=material('Island 1200 wide 317 rise',(0.48,0.58,0.64))
ink=material('Print black labels and leaders',(0,0,0))

def mesh(name, verts, faces, mat):
    me=bpy.data.meshes.new(name); me.from_pydata(verts,[],faces); me.update()
    ob=bpy.data.objects.new(name,me); scene.collection.objects.link(ob); ob.data.materials.append(mat)
    return ob
def prism(name, ring, bottom, top, mat):
    n=len(ring)
    return mesh(name,[(x,y,bottom) for x,y in ring]+[(x,y,top) for x,y in ring],
        [tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],mat)
def box(name,x0,x1,y0,y1,z0,z1,mat):
    return prism(name,[(x0,y0),(x1,y0),(x1,y1),(x0,y1)],z0,z1,mat)
def line(name,pts,mat=ink,radius=0.012):
    c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D'; c.bevel_depth=radius; c.bevel_resolution=2
    p=c.splines.new('POLY'); p.points.add(len(pts)-1)
    for v,co in zip(p.points,pts): v.co=(*co,1)
    ob=bpy.data.objects.new(name,c); scene.collection.objects.link(ob); ob.data.materials.append(mat)
    return ob

# Actual eight corner column profile from app, not an assumed rectangle.
corners=sorted([p for p in data['column'] if p['label'].isdigit()],key=lambda p:int(p['label']))
ring=[(p['os'],-p['ch']) for p in corners]
base=data['pier']['topCap']-datum
column_top=base+data['pier']['columnHeightMm']/1000
assert abs(column_top+2.9)<1e-8
prism('Column 3x2m H8.970m - app corner profile',ring,base,column_top,concrete)
# Overall head taper only: detailed chamfers/joints remain unresolved.
top=[(-3.24,-1.75),(0,-1.75),(3.24,-1.75),(3.24,0),(3.24,1.75),(0,1.75),(-3.24,1.75),(-3.24,0)]
# Order bottom and upper rings by angle so there are no crossed faces.
ring=sorted(ring,key=lambda p:math.atan2(p[1],p[0]))
top=sorted(top,key=lambda p:math.atan2(p[1],p[0]))
mesh('PARTIAL tapered head envelope 2.500m',[(x,y,-2.9) for x,y in ring]+[(x,y,-.4) for x,y in top],
     [tuple(reversed(range(8))),tuple(range(8,16))]+[(i,(i+1)%8,(i+1)%8+8,i+8) for i in range(8)],concrete)
box('Head rim 0.400m',-3.24,3.24,-1.75,1.75,-.4,0,concrete)
box('Down-chainage high half +0.600m',-3.24,3.24,-1.75,0,0,.6,concrete)
# 023165-C PLAN: central 1200 OS strip (600 each side).
# ELEVATION + SIDE ELEVATION: 317 rise on both steps, 283 between low
# island top and high main surface (600 - 317). No interpolation between steps.
box('Low island 1200 wide EL115.110',-.6,.6,0,1.75,0,.317,island)
box('High island 1200 wide EL115.710',-.6,.6,-1.75,0,.6,.917,island)
# Edge upstands: 150 OS thickness; 3500 base CH, 2900 top CH;
# top is 1800 above high surface, slope drop 1270 => shoulder EL+1.130.
# Sharp envelope only: the specified 100x100 chamfers are not fabricated here.
profile=[(-1.75,.6),(-1.75,1.13),(-1.45,2.4),(1.45,2.4),
         (1.75,1.13),(1.75,0),(0,0),(0,.6)]
for name,x0,x1 in [('Left',-3.24,-3.09),('Right',3.09,3.24)]:
    n=len(profile)
    mesh(name+' edge upstand PARTIAL unchamfered',
         [(x,y,z) for x in [x0,x1] for y,z in profile],
         [tuple(reversed(range(n))),tuple(range(n,2*n))]+
         [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],concrete)
for group in ['UL','UR','DL','DR']:
    pts=[p for p in data['plinths'] if p['label'].startswith(group)]
    xs=[p['os'] for p in pts]; ys=[p['ch'] for p in pts] # bearing frame -> physical increasing Y
    z=pts[0]['z']-datum; bottom=0 if group.startswith('U') else .6
    ob=box(group+' Plinth EL '+str(pts[0]['z']),min(xs),max(xs),min(ys),max(ys),bottom,z,plinth)
    ob['source_frame']='bearing CH = physical Y; NOT head CH'

# Survey markers retain the canonical points; solids are independently dimensioned.
for p in data['head']['points']:
    if p['z'] is None: continue # S1/S2 reference elevation is unknown
    pos=(p['os'],-p['ch'],p['z']-datum)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.045,location=pos)
    ob=bpy.context.object; ob.name=p['label']+' EL '+str(p['z']); ob.data.materials.append(orange)
    ob['N']=p['n']; ob['E']=p['e']; ob['EL']=p['z']; ob['canonical_CH']=p['ch']; ob['OS']=p['os']

bpy.ops.object.camera_add(location=(10,-13,11))
camera=bpy.context.object; camera.name='Head review camera'; target=Vector((0,0,-.9))
camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'; camera.data.ortho_scale=14.8; scene.camera=camera
right=camera.rotation_euler.to_quaternion() @ Vector((1,0,0))
up=camera.rotation_euler.to_quaternion() @ Vector((0,1,0))
toward=(camera.location-target).normalized()
def screen(x,y): return target+right*x+up*y+toward*4
def label(name, text, position, size=.18,mat=ink):
    c=bpy.data.curves.new(name,'FONT'); c.body=text; c.size=size; c.extrude=0
    ob=bpy.data.objects.new(name,c); scene.collection.objects.link(ob); ob.location=position
    ob.rotation_euler=camera.rotation_euler; ob.data.materials.append(mat)
    return ob
# Place annotations on the same projected side as their physical points.
# Order by screen height, never by label number or survey CH sign.
# This is camera-only layout: canonical N/E/EL and every mesh remain unchanged.
for side,names in [(-1,['T8','T3','T5','T4']),(1,['T7','T1','T6','T2'])]:
    entries=[]
    for name in names:
        p=next(p for p in data['head']['points'] if p['label']==name)
        start=Vector((p['os'],-p['ch'],p['z']-datum))
        entries.append((float((start-target).dot(up)),p,start))
    entries.sort(key=lambda item:item[0],reverse=True)
    previous=float('inf')
    for py,p,start in entries:
        y=min(py,previous-.52); previous=y
        end=screen(side*4.9,y)
        line(p['label']+' leader',[start,end],radius=.008)
        ob=label(p['label']+' label',f"{p['label']}  {p['z']:.3f} m",screen(side*5.05,y),.25)
        ob.data.align_x='RIGHT' if side<0 else 'LEFT'
# Compact screen-space compass, retaining the projection of physical +Y.
direction=Vector((Vector((0,1,0)).dot(right),Vector((0,1,0)).dot(up)))
direction.normalize()
tail=Vector((4.1,3.55)); tip=tail+direction*1.15
perp=Vector((-direction.y,direction.x))
line('Increasing chainage axis',[screen(*tail),screen(*tip)],orange,.025)
line('Arrow left',[screen(*(tip-direction*.28+perp*.14)),screen(*tip),
                   screen(*(tip-direction*.28-perp*.14))],orange,.025)
label('Increasing label','INCREASING CHAINAGE',screen(3.45,3.18),.20)
label('Title','P-1091 | PARTIAL SURVEY MODEL',screen(-4.5,5.0),.24)
label('Warning','Island 1.200m wide / rise 0.317m | chamfers & fittings excluded',screen(-4.5,4.55),.16)
scene.render.engine='BLENDER_WORKBENCH'
scene.display.shading.light='STUDIO'; scene.display.shading.color_type='MATERIAL'
scene.display.shading.show_shadows=True; scene.display.shading.show_cavity=True
scene.world=bpy.data.worlds.new('White review background')
scene.display.shading.background_type='VIEWPORT'
scene.display.shading.background_color=(1,1,1)
scene.world.color=(1,1,1)
scene.view_settings.view_transform='Standard'
scene.view_settings.look='None'
scene.view_settings.exposure=0
scene.view_settings.gamma=1
scene.render.resolution_x=1600; scene.render.resolution_y=1200; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.filepath=str(OUT/'p1091-preview-v5.png')
bpy.context.view_layer.update()
for name in ['Low island 1200 wide EL115.110','High island 1200 wide EL115.710']:
    ob=bpy.data.objects[name]
    assert abs(ob.dimensions.x-1.2)<1e-6 and abs(ob.dimensions.z-.317)<1e-6
for p in data['head']['points']:
    if not p['label'].startswith('T'): continue
    expected=.6 if p['label'] in ['T2','T4'] else (.317 if p['ch']<0 else .917)
    assert abs(p['z']-datum-expected)<1e-6, p['label']
scene['v2_source_sha256']='9dbd75351d24df9e217c169d0b179078b906b3ffc0471ffa24959028aa3adfd6'
scene['v2_review']='023165-C page 01/01 PLAN, ELEVATION, SIDE ELEVATION visually reviewed 2026-10-16'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'P-1091-PARTIAL-v5.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'P-1091-PARTIAL-v5.glb'),export_format='GLB',export_extras=True)
bpy.ops.render.render(write_still=True)
print(json.dumps({'objects':len(scene.objects),'columnHeight':column_top-base,'headDepth':-column_top,'output':str(OUT)}))
