"""Build reusable Blender templates only for byte-identical relative geometry.
Actual per-pier EL labels are overlaid by the app and guarded against live changes.
"""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
source=json.loads((ROOT/'output/bearing-blender-batch/source.json').read_text())
OUT=ROOT/'assets/bearing-blender';OUT.mkdir(parents=True,exist_ok=True)
MODELS=ROOT/'assets/models/bearing-blender';MODELS.mkdir(parents=True,exist_ok=True)
layouts={}
for index,(key,g) in enumerate(source['templates'].items()):
 bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene
 def material(name,color):
  m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);return m
 concrete=material('PARTIAL context surface',(.73,.78,.8));gold=material('Plinth',(.87,.7,.36));ink=material('Leaders',(.02,.02,.02));orange=material('Points',(.9,.3,.04))
 def mesh(name,verts,faces,mat):
  me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);s.collection.objects.link(o);me.materials.append(mat);return o
 def line(name,coords,mat=ink,r=.01):
  c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;p=c.splines.new('POLY');p.points.add(len(coords)-1)
  for v,co in zip(p.points,coords):v.co=(*co,1)
  ob=bpy.data.objects.new(name,c);s.collection.objects.link(ob);c.materials.append(mat)
 h=g['head'];lo,hi=h['minCH'],h['maxCH'];left,rightOS=h['minOS'],h['maxOS']
 def surface(a,b,z):mesh('Context top',[(left,a,z),(rightOS,a,z),(rightOS,b,z),(left,b,z)],[(0,1,2,3)],concrete)
 if g['step'] and lo<0<hi:surface(lo,0,0);surface(0,hi,g['step'])
 else:surface(lo,hi,0)
 for group in g['groups']:
  ch=sum(p['ch'] for p in group)/4;os=sum(p['os'] for p in group)/4
  ring=sorted(group,key=lambda p:math.atan2(p['ch']-ch,p['os']-os))
  base=g['step'] if ch*g['highSign']>0 else 0
  # A top below assumed context cannot be fabricated into a negative solid.
  solid=min(p['z'] for p in ring)>=base
  top=[(p['os'],p['ch'],p['z']) for p in ring]
  if solid:
   mesh('Plinth '+ring[0]['label'],[(p['os'],p['ch'],base) for p in ring]+top,
     [(4,5,6,7),(3,2,1,0)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],gold)
  else:mesh('PARTIAL top only '+ring[0]['label'],top,[(0,1,2,3)],gold)
 spanOS=max(rightOS-left,max(p['os'] for p in g['points'])-min(p['os'] for p in g['points']))
 spanCH=max(hi-lo,max(p['ch'] for p in g['points'])-min(p['ch'] for p in g['points']))
 scale=max(spanOS*1.85,spanCH*2.0,8)
 target=Vector(((left+rightOS)/2,(lo+hi)/2,0))
 bpy.ops.object.camera_add(location=target+Vector((10,-13,13))*max(scale/15,1));cam=bpy.context.object
 cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=scale;s.camera=cam
 q=cam.rotation_euler.to_quaternion();r=q@Vector((1,0,0));u=q@Vector((0,1,0));toward=(cam.location-target).normalized();height=scale*1000/1800
 def screen(nx,ny):return target+r*((nx-.5)*scale)+u*((.5-ny)*height)+toward*scale
 entries={-1:[],1:[]}
 for p in g['points']:
  pos=Vector((p['os'],p['ch'],p['z']+.005));side=-1 if (pos-target).dot(r)<0 else 1
  py=.5-(pos-target).dot(u)/height;entries[side].append((py,p,pos))
  bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=scale*.0025,location=pos);ob=bpy.context.object;ob.name=p['label'];ob.data.materials.append(orange)
  ob['CH']=p['ch'];ob['OS']=p['os'];ob['rise']=p['z']
 anchors=[]
 for side,items in entries.items():
  items.sort(key=lambda a:a[0]);gap=min(.055,.65/max(len(items)-1,1));previous=.15-gap
  for i,(py,p,pos) in enumerate(items):
   ny=max(previous+gap,min(py,.83-(len(items)-1-i)*gap));previous=ny
   nx=.16 if side<0 else .84
   line('Leader '+p['label'],[pos,screen(nx,ny)],r=scale*.0007)
   anchors.append({'label':p['label'],'x':nx,'y':ny,'side':side})
 direction=Vector((Vector((0,1,0)).dot(r),Vector((0,1,0)).dot(u))).normalized()
 tail=Vector((.87,.12));tip=tail+Vector((direction.x* .045,-direction.y*.081))
 line('Increasing chainage',[screen(*tail),screen(*tip)],orange,scale*.0013)
 back=Vector((direction.x*.012,-direction.y*.0216));perp=Vector((-back.y*.35,back.x*.35))
 line('Arrow',[screen(*(tip-back+perp)),screen(*tip),screen(*(tip-back-perp))],orange,scale*.0013)
 s.unit_settings.system='METRIC';s['status']='PARTIAL: plinths from app; context top only, no certified island/head/anchor detail'
 s['template']=key;s['datum']='relative Z; actual Top of Pier supplied by app'
 s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True
 s.world=bpy.data.worlds.new('White');s.world.color=(1,1,1);s.display.shading.background_type='VIEWPORT';s.display.shading.background_color=(1,1,1)
 s.view_settings.view_transform='Standard';s.view_settings.look='None';s.render.resolution_x=1800;s.render.resolution_y=1000;s.render.resolution_percentage=100
 s.render.filepath=str(OUT/(key+'.png'));bpy.ops.wm.save_as_mainfile(filepath=str(MODELS/(key+'.blend')));bpy.ops.render.render(write_still=True)
 layouts[key]={'image':'assets/bearing-blender/'+key+'.png','anchors':anchors}
 print('TEMPLATE_PROGRESS '+str(index+1)+'/'+str(len(source['templates'])),flush=True)
manifest={'records':source['records'],'templates':layouts,'skipped':source['skipped'],'status':'PARTIAL app-data-derived Blender review templates'}
(ROOT/'assets/bearing-blender-manifest.js').write_text('window.BEARING_BLENDER_MANIFEST='+json.dumps(manifest,separators=(',',':'))+';\n')
print('BATCH_COMPLETE '+str(len(layouts)),flush=True)
