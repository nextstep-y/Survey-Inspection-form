"""Refresh cap previews only; preserve survey points and all physical geometry."""
import bpy,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
path=root/'assets/structural-blender-manifest.js'
text=path.read_text();prefix=text.split('=',1)[0]+'='
m=json.loads(text.split('=',1)[1].strip().rstrip(';'))
for key,t in m['templates'].items():
 if t['geometry']['kind']!='Pile cap':continue
 model=root/'assets/models/structural-blender'/f'{key}.blend'
 bpy.ops.wm.open_mainfile(filepath=str(model))
 for o in list(bpy.data.objects):
  if re.fullmatch(r'Leader P\d+[A-Za-z]?',o.name):bpy.data.objects.remove(o,do_unlink=True)
 t['anchors']=[a for a in t['anchors'] if not re.fullmatch(r'P\d+[A-Za-z]?',a['label'])]
 bpy.context.preferences.filepaths.save_version=0
 bpy.ops.wm.save_as_mainfile(filepath=str(model),compress=True)
 bpy.context.scene.render.filepath=str(root/t['image']);bpy.ops.render.render(write_still=True)
 print('CAP_LABELS_UPDATED',key,flush=True)
path.write_text(prefix+json.dumps(m,separators=(',',':'))+';\n')
