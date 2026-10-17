"""Shared lower-head review envelope, used by both work families."""
import bpy,bmesh
from mathutils import Vector
def add_head_body(body,material,ch_sign=1):
 if not body:return []
 def coords(ps,z):return [Vector((p['os'],p['ch']*ch_sign,z)) for p in ps]
 def hull(name,vertices):
  me=bpy.data.meshes.new(name);bm=bmesh.new()
  for v in vertices:bm.verts.new(v)
  bmesh.ops.convex_hull(bm,input=list(bm.verts),use_existing_faces=False)
  bm.to_mesh(me);bm.free();me.update();ob=bpy.data.objects.new(name,me);bpy.context.scene.collection.objects.link(ob);me.materials.append(material)
  ob['scope']=body['status'];return vertices
 upper=body['upper'];column=body['column'];depth=body['depth'];rim=body['rim'];bounds=[]
 bounds+=hull('Head lower rim - review envelope',coords(upper,0)+coords(upper,-rim))
 lower=column if len(column)>=3 else upper
 bounds+=hull('Head tapered underside - schematic profile',coords(upper,-rim)+coords(lower,-depth))
 if len(column)>=3 and body['stub']>0:
  bounds+=hull('Column connection - shortened',coords(column,-depth)+coords(column,-depth-body['stub']))
 return bounds
