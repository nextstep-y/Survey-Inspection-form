"""External bearing review solids. Undimensioned component proportions are schematic."""
import bpy,json,math,sys,os
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from blender_head_body import add_head_body
source=json.loads((ROOT/'output/pot-blender/source.json').read_text())
out=ROOT/'assets/pot-blender';out.mkdir(exist_ok=True)
models=ROOT/'assets/models/pot-blender';models.mkdir(parents=True,exist_ok=True)
manifest={}
selected=os.environ.get('POT_PIERS','').split(',') if os.environ.get('POT_PIERS') else None
manifest_file=ROOT/'assets/pot-blender-manifest.js'
if selected and manifest_file.exists():
 manifest=json.loads(manifest_file.read_text().split('=',1)[1].strip().rstrip(';'))
for id,g in source.items():
 if selected and id not in selected:continue
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
 context=g['context'];body={**context['body'],'stub':min(context['body']['stub'],.45)};bounds=add_head_body(body,concrete)
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
  ps=g['points'][j*4:j*4+4];p=ps[0];x=p['centerOS'];y=p['centerCH'];z=p['z']-g['top'];height=p['assemblyHeight'];grout=p['bottomGrout']
  support=next((ps for ps in groups.values() if abs(sum(q['ch'] for q in ps)/4-y)<1e-6 and abs(sum(q['os'] for q in ps)/4-x)<1e-6),None)
  assert support is not None, 'Missing centered supporting plinth'
  assert abs(support[0]['z']+grout-(z-height))<1e-6, 'Pot bottom must equal plinth top plus bottom grout'
  groutmat=mat('Bottom grout - schematic footprint',(.91,.85,.66))
  prism('Bottom grout '+p['bearing'],rectangle(y-p['length']/2,y+p['length']/2,x-p['width']/2,x+p['width']/2),z-height-grout,z-height,groutmat)
  # Overall outline/height/center are exact controls. Thickness split and lug
  # widths are illustrative; no inferred anchor/embedment dimensions are used.
  bottom=z-height;plate=height*.20;topplate=height*.18
  diameter=min(p['width'],p['length'])*.88
  def cylinder(name,radius,z0,z1,material):
   bpy.ops.mesh.primitive_cylinder_add(vertices=80,radius=radius,depth=z1-z0,location=(x,y,(z0+z1)/2));o=bpy.context.object;o.name=name;o.data.materials.append(material);o['scope']='External review solid; internal thickness proportions schematic';return o
  cylinder(p['bearing']+' bottom plate',diameter/2,bottom,bottom+plate,steel)
  cylinder(p['bearing']+' pot housing',diameter*.46,bottom+plate,z-topplate,mat('Pot housing',(.13,.24,.31)))
  if p['bearing']=='S4':
   # Fixed bearing: circular top with four mounting lugs, not a wire square.
   radius=min(p['width'],p['length'])*.425
   cylinder('S4 circular top',radius,z-topplate,z,steel)
   for axis in [0,1]:
    for sign in [-1,1]:
     dx=sign*(p['width']/2-radius*.28) if axis==0 else 0;dy=sign*(p['length']/2-radius*.28) if axis==1 else 0
     size=(radius*.56,radius*.42,topplate) if axis==0 else (radius*.42,radius*.56,topplate)
     cube('S4 top mounting lug',(x+dx,y+dy,z-topplate/2),size,steel)
  else:
   cube(p['bearing']+' solid top plate',(x,y,z-topplate/2),(p['width'],p['length'],topplate),steel)
   if p['bearing'] in ['S1','S2','S5']:
    # Guide direction is CH for S1/S2 and OS for S5; no survey point changes.
    transverse=p['bearing']=='S5'
    for sign in [-1,1]:
     dx=0 if transverse else sign*p['width']*.43;dy=sign*p['length']*.43 if transverse else 0
     cube('Guide rail '+p['bearing'],(x+dx,y+dy,z-topplate-height*.05),(p['width']*.9 if transverse else p['width']*.06,p['length']*.06 if transverse else p['length']*.9,height*.10),gold)
  for o in list(s.objects):
   if o.type=='MESH' and (o.name.startswith(p['bearing']) or o.name.startswith('S4 ')):o['source_outline']=p['source'];o['bearing_type']=p['bearing']
  centers.append(Vector((x,y,z)))
 target=sum(centers,Vector())/2+Vector((0,0,-1.3))
 bpy.ops.object.camera_add(location=target+Vector((9,-12,15)));cam=bpy.context.object;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=16;s.camera=cam
 q=cam.rotation_euler.to_quaternion();right=q@Vector((1,0,0));up=q@Vector((0,1,0));toward=(cam.location-target).normalized();height=16/1.8
 def screen(x,y):return target+right*((x-.5)*16)+up*((.5-y)*height)+toward*18
 def text(body,x,y,size=.14,align='LEFT'):
  c=bpy.data.curves.new(body,'FONT');c.body=body;c.size=size;c.align_x=align;o=bpy.data.objects.new(body,c);s.collection.objects.link(o);o.location=screen(x,y);o.rotation_euler=cam.rotation_euler;c.materials.append(ink)
 anchors=[]
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
   anchors.append({'label':p['label'],'x':x-.015 if side<0 else x+.015,'y':y,'side':side})
 d=Vector((Vector((0,1,0)).dot(right),-Vector((0,1,0)).dot(up))).normalized();tail=Vector((.77,.23));tip=tail+Vector((d.x*.055,d.y*.099))
 line('Increasing chainage',[screen(*tail),screen(*tip)],red,.012)
 back=(tip-tail)*.25;perp=Vector((-back.y*.4,back.x*.4));line('Arrowhead',[screen(*(tip-back+perp)),screen(*tip),screen(*(tip-back-perp))],red,.012)
 s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=False;s.display.shading.show_cavity=True;s.world=bpy.data.worlds.new('White');s.display.shading.background_type='VIEWPORT';s.display.shading.background_color=(1,1,1);s.view_settings.view_transform='Standard';s.view_settings.look='None'
 s.world.color=(1,1,1)
 s.render.resolution_x=1800;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.filepath=str(out/(id+'.png'));s.unit_settings.system='METRIC';s['status']='External review solids: outline and total height controlled; component thicknesses schematic'
 bpy.ops.wm.save_as_mainfile(filepath=str(models/(id+'.blend')),compress=True);bpy.ops.render.render(write_still=True)
 manifest[id]={'image':'assets/pot-blender/'+id+'.png','points':g['points'],'context':g['context'],'anchors':anchors,'renderRevision':'external-solids-1'}
(ROOT/'assets/pot-blender-manifest.js').write_text('window.POT_BLENDER_MANIFEST='+json.dumps(manifest,separators=(',',':'))+';\n')
