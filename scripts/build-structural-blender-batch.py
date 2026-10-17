"""Render each distinct surveyed geometry in Blender, preserving incomplete-data status."""
import bpy,json,math,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from blender_head_body import add_head_body
source=json.loads((ROOT/'output/structural-blender-batch/source.json').read_text())
OUT=ROOT/'assets/structural-blender';OUT.mkdir(parents=True,exist_ok=True)
MODELS=ROOT/'assets/models/structural-blender';MODELS.mkdir(parents=True,exist_ok=True)
layouts={}
for index,(key,g) in enumerate(source['templates'].items()):
 bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene;bpy.context.preferences.filepaths.save_version=0
 def material(name,color):
  m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);return m
 concrete=material('Concrete',(.72,.78,.81));island=material('Raised island',(.56,.7,.76));ink=material('Leaders',(.025,.025,.025));orange=material('Survey point',(.9,.28,.025));unknown=material('Unknown level - projected point',(.4,.4,.4))
 def mesh(name,verts,faces,mat):
  me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new(name,me);s.collection.objects.link(ob);me.materials.append(mat)
 def line(name,coords,mat=ink,r=.008):
  c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;p=c.splines.new('POLY');p.points.add(len(coords)-1)
  for v,co in zip(p.points,coords):v.co=(*co,1)
  ob=bpy.data.objects.new(name,c);s.collection.objects.link(ob);c.materials.append(mat)
 def position(p,z=None):return Vector((p['os'],p['ch']*g['chSign'],(p.get('z') or 0) if z is None else z))
 bounds=add_head_body(g.get('body'),concrete,g['chSign'])
 for surface in g['surfaces']:
  ps=surface['ring'];n=len(ps);top=[position(p,surface['top']) for p in ps];bottom=surface['bottom'];bounds+=top
  mat=island if surface['name']=='Island' else concrete
  if bottom is None:mesh(surface['name'],top,[tuple(range(n))],mat)
  else:
   base=[position(p,bottom) for p in ps];bounds+=base
   mesh(surface['name'],base+top,[tuple(range(n,2*n)),tuple(reversed(range(n)))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],mat)
  line('Top edge',top+[top[0]],r=.008)
 for ps in g['lines']:
  coords=[position(p,.008) for p in ps];line('Column footprint',coords+[coords[0]])
 bounds += [position(p) for p in g['points']]
 center=Vector(tuple((min(p[i] for p in bounds)+max(p[i] for p in bounds))/2 for i in range(3)))
 bpy.ops.object.camera_add(location=center+Vector((10,-15,14)));cam=bpy.context.object
 cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';s.camera=cam
 q=cam.rotation_euler.to_quaternion();right=q@Vector((1,0,0));up=q@Vector((0,1,0));toward=(cam.location-center).normalized()
 xs=[(p-center).dot(right) for p in bounds];ys=[(p-center).dot(up) for p in bounds]
 scale=max((max(xs)-min(xs))/.60,(max(ys)-min(ys))*1.8/.65,3);cam.data.ortho_scale=scale;height=scale/1.8
 if g['kind']=='Pile cap':center+=right*((min(xs)+max(xs))/2)+up*((min(ys)+max(ys))/2)
 # The annotation plane must stay in front of the camera even for wide special
 # heads. Orthographic framing is unchanged by this distance adjustment.
 cam.location=center+toward*(scale*3);cam.data.clip_end=max(1000,scale*5)
 def screen(x,y):return center+right*((x-.5)*scale)+up*((.5-y)*height)+toward*scale
 entries={-1:[],1:[]}
 for p in g['points']:
  pos=position(p)+Vector((0,0,.012));side=-1 if (pos-center).dot(right)<0 else 1
  entries[side].append((.5-(pos-center).dot(up)/height,p,pos))
  bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=scale*.0028,location=pos);ob=bpy.context.object;ob.name=p['label'];ob.data.materials.append(unknown if p['z'] is None else orange)
  ob['CH']=p['ch'];ob['OS']=p['os'];ob['relative_Z']=p['z'] if p['z'] is not None else 'UNKNOWN - projected on datum'
 anchors=[]
 for side,items in entries.items():
  items.sort(key=lambda x:x[0]);gap=min(.06,.66/max(len(items)-1,1));previous=.17-gap
  for i,(py,p,pos) in enumerate(items):
   ny=max(previous+gap,min(py,.83-(len(items)-1-i)*gap));previous=ny;nx=.16 if side<0 else .84
   line('Leader '+p['label'],[pos,screen(nx,ny)],r=scale*.0006)
   anchors.append({'label':p['label'],'x':nx,'y':ny,'side':side})
 direction=Vector((Vector((0,1,0)).dot(right),Vector((0,1,0)).dot(up))).normalized()
 tail=Vector((.87,.13));tip=tail+Vector((direction.x*.045,-direction.y*.081))
 line('Increasing chainage',[screen(*tail),screen(*tip)],orange,scale*.0013)
 back=Vector((direction.x*.012,-direction.y*.0216));perp=Vector((-back.y*.35,back.x*.35))
 line('Arrow',[screen(*(tip-back+perp)),screen(*tip),screen(*(tip-back-perp))],orange,scale*.0013)
 s.unit_settings.system='METRIC';s['status']=g['status'];s['template']=key;s['axes']='X=OS; Y=increasing chainage; Z=relative display datum'
 # Workbench shadows from leader curves look like extra survey lines. Studio
 # surface lighting supplies depth without casting annotation shadows.
 s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=False;s.display.shading.show_cavity=True
 s.world=bpy.data.worlds.new('White');s.world.color=(1,1,1);s.display.shading.background_type='VIEWPORT';s.display.shading.background_color=(1,1,1)
 s.view_settings.view_transform='Standard';s.view_settings.look='None';s.render.resolution_x=1800;s.render.resolution_y=1000;s.render.resolution_percentage=100
 s.render.image_settings.color_mode='RGB';s.render.image_settings.compression=15
 s.render.filepath=str(OUT/(key+'.png'));bpy.ops.wm.save_as_mainfile(filepath=str(MODELS/(key+'.blend')),compress=True);bpy.ops.render.render(write_still=True)
 layouts[key]={'image':'assets/structural-blender/'+key+'.png','anchors':anchors,'geometry':g}
 print('TEMPLATE_PROGRESS '+str(index+1)+'/'+str(len(source['templates'])),flush=True)
manifest={'records':source['records'],'templates':layouts,'skipped':source['skipped'],'version':'20261017','status':'PARTIAL survey review geometry'}
temporary=ROOT/'output/structural-blender-batch/manifest.js'
temporary.write_text('window.STRUCTURAL_BLENDER_MANIFEST='+json.dumps(manifest,separators=(',',':'))+';\n')
temporary.replace(ROOT/'assets/structural-blender-manifest.js')
print('BATCH_COMPLETE '+str(len(layouts)),flush=True)
