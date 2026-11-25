"""Bake interactive frames using study 11's unchanged Cycles materials and lights.
Run after render-aluminium-study.py. Outputs are cropped/packed by pack-aluminium.mjs.
"""
import bpy, math, os, json, runpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
if not os.path.exists('/tmp/tesseral-aluminium-study.blend'):
 runpy.run_path('scripts/render-aluminium-study.py')
bpy.ops.wm.open_mainfile(filepath='/tmp/tesseral-aluminium-study.blend')
s=bpy.context.scene;s.cycles.samples=48;s.cycles.use_denoising=True;s.cycles.use_animated_seed=False
s.render.resolution_x=1400;s.render.resolution_y=640;s.render.resolution_percentage=100
s.camera.data.ortho_scale=7.2
# Expand the studio rig with the wider row, preserving the approved angular
# softbox sizes and illumination rather than moving the knob into the old flag.
rig_scale=2.25/.92
for light in [o for o in s.objects if o.type=='LIGHT']:
 light.location*=rig_scale;light.data.energy*=rig_scale**2
 light.data.size*=rig_scale;light.data.size_y*=rig_scale
flag=bpy.data.objects['Studio negative fill'];flag.location*=rig_scale;flag.scale*=rig_scale
# Keep the exact approved camera direction, shader nodes, lights and studio flag.
# Only expand the panel arrangement into four equal, physically bored seats.
for o in list(bpy.data.objects):
 if o.name.startswith(('Solid panel','Flush insert')):bpy.data.objects.remove(o,do_unlink=True)
floor=bpy.data.materials['Neutral enamel EDEEED'];alu=bpy.data.materials['Shared brushed aluminium'];cap=bpy.data.materials['Radially machined aluminium']
def finish(o,mat,bevel=.006):
 o.data.materials.append(mat)
 if bevel:
  m=o.modifiers.new('Machined radius','BEVEL');m.width=bevel;m.segments=5
 for p in o.data.polygons:p.use_smooth=True
 m=o.modifiers.new('Face normals','WEIGHTED_NORMAL');m.keep_sharp=True
 return o
def cylinder(loc,r,d,mat):
 bpy.ops.mesh.primitive_cylinder_add(vertices=128,radius=r,depth=d,location=loc);return finish(bpy.context.object,mat)
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,-.15));panel=bpy.context.object;panel.name='Four-place panel';panel.dimensions=(200,200,.3);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);panel.data.materials.append(floor)
for x in [-2.25,-.75,.75,2.25]:
 cut=cylinder((x,0,0),.65,.14,floor);mod=panel.modifiers.new('Bore','BOOLEAN');mod.object=cut;mod.operation='DIFFERENCE';bpy.context.view_layer.objects.active=panel;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cut,do_unlink=True)
 cylinder((x,0,-.014),.635,.04,floor)
# Relocate complete assemblies, never rescale or re-shade their materials.
lever=bpy.data.objects['Switch assembly'];lever.location.x=2.25
bpy.data.objects['Solid pivot'].location.x=2.25
knob=bpy.data.objects.new('Rotary assembly',None);s.collection.objects.link(knob);knob.location=(-2.25,0,0)
for name in ['Knob foot','Knob cylinder','Diamond machined knob','Cone','Brushed top']:
 o=bpy.data.objects[name];o.location.x+=.92;o.parent=knob
# Geometry-built grip has its world offset in vertices.
o=bpy.data.objects['Diamond machined knob']
for v in o.data.vertices:v.co.x+=.92
o.location.x=0
# A small engraved index makes rotation legible without rotating the light rig.
dark=bpy.data.materials.new('Dial index');dark.diffuse_color=(.12,.13,.14,1)
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,.335,.548));mark=bpy.context.object;mark.name='Index';mark.dimensions=(.016,.075,.0015);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);finish(mark,dark,.003);mark.parent=knob
out=os.path.abspath('public/lab/aluminium-render/interactive');os.makedirs(out,exist_ok=True)
def project(p):
 v=world_to_camera_view(s,s.camera,Vector(p));return [v.x*1400,(1-v.y)*640]
bpy.context.view_layer.update()
centers=[project((x,0,0)) for x in [-2.25,-.75,.75,2.25]]
# Crop wide enough to include all cast shadows; borders are background-identical.
regions=[]
for x,y in centers:regions.append([round(x-145),round(y-155),290,300])
regions[3][3]=390
def render(name,region=None):
 if region:
  x,y,w,h=region;s.render.use_border=True;s.render.use_crop_to_border=True;s.render.border_min_x=x/1400;s.render.border_max_x=(x+w)/1400;s.render.border_min_y=1-(y+h)/640;s.render.border_max_y=1-y/640
 else:s.render.use_border=False
 s.render.filepath=os.path.join(out,name+'.png');bpy.ops.render.render(write_still=True);print('DONE',name,flush=True)
lever.rotation_euler.x=math.radians(-18);knob.rotation_euler.z=0
if not os.environ.get('SWITCH_ONLY'):render('base')
# 33 intermediate poses permit smooth reversals from the currently displayed angle.
for i in range(33):
 lever.rotation_euler.x=math.radians(-18+56*i/32);render('switch-%02d'%i,regions[3])
lever.rotation_euler.x=math.radians(-18)
for i in ([] if os.environ.get('SWITCH_ONLY') else range(49)):
 knob.rotation_euler.z=math.radians(-135+270*i/48);render('knob-%02d'%i,regions[0])
knob.rotation_euler.z=0
# Particle colors are sampled from a real rendered aluminium cap in this same scene.
for i,x in ([] if os.environ.get('SWITCH_ONLY') else enumerate([-.75,.75])):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=96,ring_count=48,location=(x,0,.08));dome=bpy.context.object;dome.name='Particle material sample';dome.scale=(.53,.53,.25);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 dome.data.materials.append(cap)
 for p in dome.data.polygons:p.use_smooth=True
 render('particle-%d'%i,regions[i+1]);bpy.data.objects.remove(dome,do_unlink=True)
meta={'width':1400,'height':640,'centers':centers,'regions':regions,'switchFrames':33,'knobFrames':49,'sphereCenter':[project((x,0,.08)) for x in [-.75,.75]],'sphereRadius':.53*1400/7.2}
with open(os.path.join(out,'geometry.json'),'w') as f:json.dump(meta,f)
print('FINISHED',flush=True)
