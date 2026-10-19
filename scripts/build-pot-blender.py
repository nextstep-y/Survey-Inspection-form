"""Verified top-plate axis envelopes; no invented internal bearing fabrication."""
import bpy,json,math,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from blender_head_body import add_head_body
source=json.loads((ROOT/'output/pot-blender/source.json').read_text())
out=ROOT/'assets/pot-blender';out.mkdir(exist_ok=True)
models=ROOT/'assets/models/pot-blender';models.mkdir(parents=True,exist_ok=True)
manifest={}
for id,g in source.items():
 bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene;bpy.context.preferences.filepaths.save_version=0
 def mat(name,color):
  m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);return m
 steel=mat('Steel top plate',(.25,.38,.48));gold=mat('Assembly envelope - schematic',(.75,.62,.35));ink=mat('Labels',(.015,.025,.035));red=mat('Survey midpoint',(.8,.12,.04))
 def line(name,coords,material=ink,r=.008):
  c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;p=c.splines.new('POLY');p.points.add(len(coords)-1)
  for v,co in zip(p.points,coords):v.co=(*co,1)
  o=bpy.data.objects.new(name,c);s.collection.objects.link(o);c.materials.append(material)
 def cube(name,loc,size,material):
  bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material);return o
 concrete=mat('Pier head concrete',(.72,.77,.79));plinthmat=mat('Concrete bearing plinth',(.82,.77,.63));islandmat=mat('Island concrete',(.57,.68,.72))
 context=g['context'];bounds=add_head_body(context['body'],concrete)
 def prism(name,ring,bottom,top,material):
  n=len(ring);verts=[(p['os'],p['ch'],z) for z in [bottom,top] for p in ring]
  me=bpy.data.meshes.new(name);me.from_pydata(verts,[],[tuple(range(n,2*n)),tuple(reversed(range(n)))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]);me.materials.append(material);o=bpy.data.objects.new(name,me);s.collection.objects.link(o);return o
 ring=context['body']['upper'];lo=min(p['ch'] for p in ring);hi=max(p['ch'] for p in ring);left=min(p['os'] for p in ring);rightOS=max(p['os'] for p in ring)
 def rectangle(a,b,c,d):return [{'ch':a,'os':c},{'ch':a,'os':d},{'ch':b,'os':d},{'ch':b,'os':c}]
 if context['step']:
  a,b=(lo,0) if context['highSign']<0 else (0,hi)
  prism('Raised head step',rectangle(a,b,left,rightOS),0,context['step'],concrete)
 for island in context['islands']['surfaces']:prism('Pier head island',island['ring'],island['bottom'],island['top'],islandmat)
 groups={}
 for p in context['plinths']:groups.setdefault(p['label'][:-1],[]).append(p)
 for name,ps in groups.items():
  assert len(ps)==4
  x=sum(p['os'] for p in ps)/4;y=sum(p['ch'] for p in ps)/4;top=ps[0]['z'];base=context['step'] if y*context['highSign']>0 else 0
  prism('Bearing plinth '+name,ps,base,top,plinthmat)
 centers=[]
 for j in range(2):
  ps=g['points'][j*4:j*4+4];p=ps[0];x=p['centerOS'];y=p['centerCH'];z=p['z']-g['top'];height={'S1':.147,'S2':.269,'S3':.143,'S4':.245,'S5':.269,'S6':.250}[p['bearing']]
  support=next((ps for ps in groups.values() if abs(sum(q['ch'] for q in ps)/4-y)<1e-6 and abs(sum(q['os'] for q in ps)/4-x)<1e-6),None)
  assert support is not None, 'Missing centered supporting plinth'
  assert abs(support[0]['z']-(z-height))<1e-6, 'Pot bottom must equal supporting plinth top'
  # The top outline is source-controlled. S4's shaped plate is represented by
  # its overall bounding axes only, not a fabricated rectangular steel plate.
  if p['bearing']=='S4':
   a=p['width']/2;b=p['length']/2
   line('S4 overall outline reference',[(x-a,y-b,z),(x+a,y-b,z),(x+a,y+b,z),(x-a,y+b,z),(x-a,y-b,z)],steel,.018)
  else:
   me=bpy.data.meshes.new('Top plate surface');me.from_pydata([(x-p['width']/2,y-p['length']/2,z),(x+p['width']/2,y-p['length']/2,z),(x+p['width']/2,y+p['length']/2,z),(x-p['width']/2,y+p['length']/2,z)],[],[(0,1,2,3)]);me.materials.append(steel);o=bpy.data.objects.new(p['bearing']+' top outline',me);s.collection.objects.link(o)
  # Wire envelope shows actual assembly height without implying internal parts.
  a=p['width']/2;b=p['length']/2
  for dx,dy in [(-a,-b),(a,-b),(a,b),(-a,b)]:line('Assembly height envelope',[(x+dx,y+dy,z-height),(x+dx,y+dy,z)],gold)
  line('Base envelope',[(x-a,y-b,z-height),(x+a,y-b,z-height),(x+a,y+b,z-height),(x-a,y+b,z-height),(x-a,y-b,z-height)],gold)
  centers.append(Vector((x,y,z)))
 target=sum(centers,Vector())/2+Vector((0,0,-1.3))
 bpy.ops.object.camera_add(location=target+Vector((9,-12,15)));cam=bpy.context.object;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=16;s.camera=cam
 q=cam.rotation_euler.to_quaternion();right=q@Vector((1,0,0));up=q@Vector((0,1,0));toward=(cam.location-target).normalized();height=16/1.8
 def screen(x,y):return target+right*((x-.5)*16)+up*((.5-y)*height)+toward*18
 def text(body,x,y,size=.14,align='LEFT'):
  c=bpy.data.curves.new(body,'FONT');c.body=body;c.size=size;c.align_x=align;o=bpy.data.objects.new(body,c);s.collection.objects.link(o);o.location=screen(x,y);o.rotation_euler=cam.rotation_euler;c.materials.append(ink)
 text(id.replace('-live','')+' - POT BEARING | BLENDER',.035,.07,.19)
 text('On concrete plinths / pier head lower profile schematic',.035,.115,.16)
 entries={-1:[],1:[]}
 for p in g['points']:
  pos=Vector((p['os'],p['ch'],p['z']-g['top']));side=-1 if (pos-target).dot(right)<0 else 1
  entries[side].append((.5-(pos-target).dot(up)/height,p,pos))
  bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.032,location=pos);o=bpy.context.object;o.name=p['label'];o.data.materials.append(red);o['CH']=p['ch'];o['OS']=p['os'];o['design_Z']=p['z']
 for side,items in entries.items():
  items.sort(key=lambda x:x[0]);previous=.22
  for k,(py,p,pos) in enumerate(items):
   y=max(previous+.09,min(py,.78-(3-k)*.09));previous=y;x=.15 if side<0 else .85
   line('Leader '+p['label'],[pos,screen(x,y)])
   text(p['label']+' '+format(p['z'],'.3f'),x-.015 if side<0 else x+.015,y,.19,'RIGHT' if side<0 else 'LEFT')
 text('INCREASING CHAINAGE',.77,.15,.11,'CENTER')
 d=Vector((Vector((0,1,0)).dot(right),-Vector((0,1,0)).dot(up))).normalized();tail=Vector((.77,.23));tip=tail+Vector((d.x*.055,d.y*.099))
 line('Increasing chainage',[screen(*tail),screen(*tip)],red,.012)
 back=(tip-tail)*.25;perp=Vector((-back.y*.4,back.x*.4));line('Arrowhead',[screen(*(tip-back+perp)),screen(*tip),screen(*(tip-back-perp))],red,.012)
 s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=False;s.display.shading.show_cavity=True;s.world=bpy.data.worlds.new('White');s.display.shading.background_type='VIEWPORT';s.display.shading.background_color=(1,1,1);s.view_settings.view_transform='Standard';s.view_settings.look='None'
 s.world.color=(1,1,1)
 s.render.resolution_x=1800;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.filepath=str(out/(id+'.png'));s.unit_settings.system='METRIC';s['status']='Verified top outline; schematic assembly envelope; no fabrication internals'
 bpy.ops.wm.save_as_mainfile(filepath=str(models/(id+'.blend')),compress=True);bpy.ops.render.render(write_still=True)
 manifest[id]={'image':'assets/pot-blender/'+id+'.png','points':g['points'],'context':g['context']}
(ROOT/'assets/pot-blender-manifest.js').write_text('window.POT_BLENDER_MANIFEST='+json.dumps(manifest,separators=(',',':'))+';\n')
