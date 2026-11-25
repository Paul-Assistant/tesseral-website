"""Reproducible Cycles material benchmark. Run with blender -b -P this-file."""
import bpy, math, os
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=128; scene.cycles.use_denoising=True
scene.render.resolution_x=1400; scene.render.resolution_y=850; scene.render.resolution_percentage=100
scene.world.color=(.23,.23,.23)
scene.view_settings.view_transform='AgX'
# All visible metal shares this shader; only the brushing direction changes.
def metal(name, radial=False):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(.8,.81,.82,1);p.inputs['Metallic'].default_value=1;p.inputs['Roughness'].default_value=.24
 p.inputs['Anisotropic'].default_value=.8
 tc=n.new('ShaderNodeTexCoord'); scale=n.new('ShaderNodeVectorMath');scale.operation='MULTIPLY';scale.inputs[1].default_value=(3,900,3);l.new(tc.outputs['Generated'],scale.inputs[0])
 noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=2;noise.inputs['Detail'].default_value=2;l.new(scale.outputs[0],noise.inputs['Vector'])
 ramp=n.new('ShaderNodeMapRange');ramp.inputs['To Min'].default_value=.17;ramp.inputs['To Max'].default_value=.25;l.new(noise.outputs['Fac'],ramp.inputs['Value']);l.new(ramp.outputs[0],p.inputs['Roughness'])
 bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.12;bump.inputs['Distance'].default_value=.0005;l.new(noise.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],p.inputs['Normal'])
 if radial:
  tangent=n.new('ShaderNodeTangent');tangent.direction_type='RADIAL';tangent.axis='Z';l.new(tangent.outputs[0],p.inputs['Tangent'])
  wave=n.new('ShaderNodeTexWave');wave.wave_type='RINGS';wave.rings_direction='Z';wave.inputs['Scale'].default_value=340;l.new(tc.outputs['Object'],wave.inputs['Vector']);l.new(wave.outputs['Fac'],bump.inputs['Height'])
 return m
alu=metal('Shared brushed aluminium');cap=metal('Radially machined aluminium',True)
def material(name,col,rough):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Roughness'].default_value=rough;return m
floor=material('Neutral enamel EDEEED',(.847,.855,.847),.42)
# Fine enamel texture is geometry-scale microstructure, not screen noise.
n=floor.node_tree.nodes;l=floor.node_tree.links;noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=700;b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.1;b.inputs['Distance'].default_value=.0003;l.new(noise.outputs['Fac'],b.inputs['Height']);l.new(b.outputs[0],n.get('Principled BSDF').inputs['Normal'])
def finish(o,mat,bevel=0):
 o.data.materials.append(mat)
 if bevel:
  mod=o.modifiers.new('Machined edge radius','BEVEL');mod.width=bevel;mod.segments=5
 for f in o.data.polygons:f.use_smooth=True
 mod=o.modifiers.new('Face normals','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=50
 return o
def box(name,loc,dim,mat,bevel=.02):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,mat,bevel)
def cylinder(name,loc,r,d,mat,bevel=.008):
 bpy.ops.mesh.primitive_cylinder_add(vertices=160,radius=r,depth=d,location=loc);o=bpy.context.object;o.name=name;return finish(o,mat,bevel)
# Actual bored recesses in the panel, with flush inserts. They receive real occlusion.
panel=box('Solid panel',(0,0,-.15),(200,200,.3),floor,.01)
for x in [-.92,.92]:
 cut=cylinder('Bore',(x,0,0),.65,.14,floor,0)
 mod=panel.modifiers.new('Circular recess','BOOLEAN');mod.object=cut;mod.operation='DIFFERENCE';bpy.context.view_layer.objects.active=panel;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cut,do_unlink=True)
 cylinder('Flush insert',(x,0,-.014),.635,.04,floor,.006)
# Dense continuous rounded diamond relief shared by both grips.
def grip(name,cyl,parent=None):
 cols,rows=(80,15) if cyl else (20,13);nx,ny=cols*6,rows*6;verts=[];faces=[]
 for j in range(ny+1):
  v=j/ny
  for i in range(nx+1):
   u=i/nx;dx=abs((u*cols%1)-.5)*2;dy=abs((v*rows%1)-.5)*2;q=max(0,1-max(dx,dy));h=.012*q
   if cyl:
    a=u*math.tau;r=.435+h;verts.append((-.92+r*math.cos(a),r*math.sin(a),.10+v*.36))
   else:verts.append(((u-.5)*.55,-.108-h,.14+v*.32))
 for j in range(ny):
  for i in range(nx):
   a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.data.materials.append(alu)
 for f in mesh.polygons:f.use_smooth=True
 if parent:o.parent=parent
 return o
cylinder('Knob foot',(-.92,0,.05),.37,.10,alu)
cylinder('Knob cylinder',(-.92,0,.285),.435,.37,alu)
grip('Diamond machined knob',True)
bpy.ops.mesh.primitive_cone_add(vertices=160,radius1=.443,radius2=.420,depth=.065,location=(-.92,0,.492));finish(bpy.context.object,alu,.008)
cylinder('Brushed top',(-.92,0,.533),.420,.025,cap,.008)
# Full capsule lever with a small physical axle anchored in the insert.
pivot=cylinder('Solid pivot',(.92,0,.065),.075,.48,alu);pivot.rotation_euler[1]=math.pi/2
lever=bpy.data.objects.new('Switch assembly',None);scene.collection.objects.link(lever);lever.location=(.92,0,.07)
body=box('One rounded aluminium body',(0,0,.30),(.61,.22,.58),alu,.105);body.parent=lever
front=grip('Front matching diamond grip',False,lever)
back=grip('Rear matching diamond grip',False,lever);back.rotation_euler[2]=math.pi
# Unified physical softbox lighting; no painted shadows or pose-dependent material changes.
def area(name,pos,power,size,size_y):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='RECTANGLE';data.size=size;data.size_y=size_y;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
area('Upper right softbox',(2.5,3,4),450,1.5,2.5)
area('Broad left fill',(-3,-1,3),55,3,4)
area('Long overhead reflection',(0,1,5),90,.5,4)
flag=box('Studio negative fill',(-2,1,3),(1.5,.04,3),material('Black reflection card',(.015,.015,.015),.7),0)
flag.rotation_euler[1]=-.35
flag.visible_camera=False
bpy.ops.object.camera_add(location=(0,-2.6,8));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,.15))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=3.9;scene.camera=camera
out=os.path.abspath('public/lab/aluminium-render');os.makedirs(out,exist_ok=True)
for state,angle in [('on',-18),('off',38)]:
 lever.rotation_euler[0]=math.radians(angle);scene.render.filepath=os.path.join(out,state+'.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath='/tmp/tesseral-aluminium-study.blend')
