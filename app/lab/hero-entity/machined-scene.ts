import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

type State = { on: boolean; value: number; light: boolean }

// A cut diamond surface, not a printed texture: each facet catches its own reflection.
function knurl(radius: number, height: number, columns: number, rows: number, topRadius = radius) {
  const positions: number[] = []
  const point = (a: number, y: number, r: number) => { const shoulder=Math.max(0,(y/height-.8)/.2); const tapered=r+(topRadius-radius)*shoulder; return [Math.cos(a)*tapered, y, Math.sin(a)*tapered] }
  for (let row=0; row<rows; row++) for (let col=0; col<columns; col++) {
    const a=col/columns*Math.PI*2, b=(col+1)/columns*Math.PI*2
    const y=row/rows*height, next=(row+1)/rows*height
    const corners=[point(a,y,radius),point(b,y,radius),point(b,next,radius),point(a,next,radius)]
    const peak=point((a+b)/2,(y+next)/2,radius+.018)
    for(let i=0;i<4;i++)positions.push(...corners[i],...peak,...corners[(i+1)%4])
  }
  const geometry=new THREE.BufferGeometry()
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals()
  return geometry
}

export function createMachinedScene(host: HTMLDivElement, initial: State, toggle: () => void, change: (value: number) => void) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})
  renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer:coarse)').matches?1.5:2))
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05
  host.appendChild(renderer.domElement)
  const scene=new THREE.Scene()
  const camera=new THREE.OrthographicCamera(-4.4,4.4,2.6,-2.6,.1,60)
  camera.position.set(0,11,.65);camera.lookAt(0,.15,0)
  const pmrem=new THREE.PMREMGenerator(renderer), room=new THREE.Scene()
  room.background=new THREE.Color(0x92979a)
  const softboxes: THREE.Mesh[]=[]
  for(const [x,y,z,w,h,power] of [[-3,6,2,3.5,8,2.8],[4,4,1,3,6,1.6],[0,5,-4,5,4,1.9],[0,2,5,6,3.5,1.5],[-2,.5,4,2.5,5,1.3]]){
    const box=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(power,power,power),side:THREE.DoubleSide}))
    box.position.set(x,y,z);box.lookAt(0,0,0);room.add(box);softboxes.push(box)
  }
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(3,7),new THREE.MeshBasicMaterial({color:0x81868b,side:THREE.DoubleSide}))
  flag.position.set(2,6,-1);flag.lookAt(0,0,0);room.add(flag);softboxes.push(flag)
  const env=pmrem.fromScene(room,.07);scene.environment=env.texture
  softboxes.forEach(box=>{box.geometry.dispose();(box.material as THREE.Material).dispose()});pmrem.dispose()
  const textures: THREE.Texture[]=[]
  const scratch=document.createElement('canvas');scratch.width=scratch.height=512
  const pen=scratch.getContext('2d')!, data=pen.createImageData(512,512)
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const r=Math.hypot(x-256,y-256), n=Math.sin(r*11)*3+Math.sin(r*27)*2
    const v=125+n*1.6+Math.sin(x*12.98+y*78.23)*3, i=(y*512+x)*4
    data.data[i]=data.data[i+1]=data.data[i+2]=v;data.data[i+3]=255
  }
  pen.putImageData(data,0,0)
  const brushing=new THREE.CanvasTexture(scratch);textures.push(brushing)
  // Fine parallel machining for the lever and sidewalls, circular machining for the cap.
  const linearCanvas=document.createElement('canvas');linearCanvas.width=linearCanvas.height=512
  const linearPen=linearCanvas.getContext('2d')!,linearData=linearPen.createImageData(512,512)
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const grain=Math.sin(y*13.71)*9+Math.sin(y*3.27)*4+Math.sin(x*9.31+y*7.17)*2
    const i=(y*512+x)*4,v=127+grain
    linearData.data[i]=linearData.data[i+1]=linearData.data[i+2]=v;linearData.data[i+3]=255
  }
  linearPen.putImageData(linearData,0,0)
  const linearBrush=new THREE.CanvasTexture(linearCanvas);textures.push(linearBrush)
  const directionData=new Uint8Array(256*256*4)
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const angle=Math.atan2(y-128,x-128)+Math.PI/2,i=(y*256+x)*4
    directionData[i]=Math.round((Math.cos(angle)*.5+.5)*255);directionData[i+1]=Math.round((Math.sin(angle)*.5+.5)*255);directionData[i+2]=255;directionData[i+3]=255
  }
  const directions=new THREE.DataTexture(directionData,256,256);directions.needsUpdate=true;textures.push(directions)
  const silver=new THREE.MeshPhysicalMaterial({color:0xd2d5d7,metalness:1,roughness:.31,bumpMap:linearBrush,bumpScale:.012,anisotropy:.35,envMapIntensity:1.15})
  const polished=new THREE.MeshPhysicalMaterial({color:0xd2d5d7,metalness:1,roughness:.23,bumpMap:linearBrush,bumpScale:.006,envMapIntensity:1.15})
  const topMetal=new THREE.MeshPhysicalMaterial({color:0xd2d5d7,metalness:1,roughness:.19,bumpMap:brushing,bumpScale:.008,anisotropy:.9,anisotropyMap:directions,envMapIntensity:1.1})
  const leverMetal=topMetal
  const dark=new THREE.MeshStandardMaterial({color:0x454b50,metalness:.65,roughness:.5})
  const panel=new THREE.MeshStandardMaterial({color:initial.light?0xc8ced2:0x444b50,metalness:.48,roughness:.42})
  const lime=new THREE.MeshStandardMaterial({color:0xc6ff1b,emissive:0xc6ff1b,emissiveIntensity:0,roughness:.3})
  function mesh(geometry:THREE.BufferGeometry, material:THREE.Material, parent:THREE.Object3D, x=0,y=0,z=0){
    const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object
  }
  function cylinder(r:number,h:number,material:THREE.Material,parent:THREE.Object3D,y:number){return mesh(new THREE.CylinderGeometry(r,r,h,96),material,parent,0,y)}
  function rim(r:number,tube:number,material:THREE.Material,parent:THREE.Object3D,y:number){const ring=mesh(new THREE.TorusGeometry(r,tube,12,128),material,parent,0,y);ring.rotation.x=Math.PI/2;return ring}
  const floor=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.13}),scene,0,-.18);floor.rotation.x=-Math.PI/2
  scene.add(new THREE.HemisphereLight(0xe9f2ff,0x53514c,.5))
  const key=new THREE.DirectionalLight(0xffffff,2);key.position.set(-3,7,4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.018;key.shadow.bias=-.0002;key.shadow.radius=7;key.shadow.blurSamples=16;scene.add(key)
  const fill=new THREE.DirectionalLight(0xe5edff,1);fill.position.set(4,3,-3);scene.add(fill)
  const mounts=[-1.52,1.52].map(x=>{
    const group=new THREE.Group();group.position.x=x;scene.add(group)
    mesh(new RoundedBoxGeometry(2.75,.16,2.65,5,.12),panel,group,0,-.08)
    cylinder(.78,.025,dark,group,.008);cylinder(.746,.028,silver,group,.019)
    rim(.743,.012,polished,group,.038);cylinder(.715,.035,silver,group,.035)
    return group
  })
  // An upright paddle on a transverse pivot, with an open fork below the grip.
  // It rocks forward/back between two detents; the base never lifts out of the panel.
  const hinge=new THREE.Group();mounts[0].add(hinge)
  mesh(new RoundedBoxGeometry(.47,.16,.36,4,.04),silver,hinge,0,.12)
  const axle=mesh(new THREE.CylinderGeometry(.09,.09,.68,48),polished,hinge,0,.22);axle.rotation.z=Math.PI/2
  const push=new THREE.Group();push.position.y=.22;mounts[0].add(push);push.userData.control='push'
  // Extrude the reference's rounded side profile across the lever width.
  // The long sides are solid; there is no rectangular frame around the grip.
  const profile=new THREE.Shape()
  profile.moveTo(-.16,.50);profile.lineTo(-.16,1.06)
  profile.bezierCurveTo(-.16,1.25,.16,1.25,.16,1.06)
  profile.lineTo(.16,.50);profile.bezierCurveTo(.16,.30,-.16,.30,-.16,.50)
  const body=new THREE.ExtrudeGeometry(profile,{depth:.72,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:8,curveSegments:32,steps:1})
  body.rotateY(Math.PI/2);body.translate(-.36,0,0)
  const bodyPositions=body.getAttribute('position'),bodyUV=body.getAttribute('uv')
  for(let i=0;i<bodyPositions.count;i++){
    const x=bodyPositions.getX(i),y=bodyPositions.getY(i),z=bodyPositions.getZ(i)
    const normalY=Math.abs(body.getAttribute('normal').getY(i))
    bodyUV.setXY(i,x/.76+.5,normalY>.7 ? z/.36+.5 : y/1.23)
  }
  mesh(body,leverMetal,push)
  // Narrow neck meets the underside behind the rounded nose, leaving the front recess open.
  const neck=mesh(new RoundedBoxGeometry(.39,.45,.16,6,.055),leverMetal,push,0,.22,-.075)
  neck.rotation.x=-.16
  // Same diamond pitch and raised relief as the rotary sidewall, on both grip faces.
  const facets:number[]=[]
  const pitchX=.0432,pitchY=.0467
  for(const side of [1])for(let row=0;row<9;row++)for(let col=0;col<16;col++){
    const x=(col-7.5)*pitchX,y=.60+row*pitchY,z=side*.179
    const corners=[[x-pitchX/2,y-pitchY/2,z],[x+pitchX/2,y-pitchY/2,z],[x+pitchX/2,y+pitchY/2,z],[x-pitchX/2,y+pitchY/2,z]]
    const peak=[x,y,z+side*.018]
    for(let i=0;i<4;i++){
      const next=(i+1)%4
      facets.push(...corners[side>0?i:next],...corners[side>0?next:i],...peak)
    }
  }
  const faceGeometry=new THREE.BufferGeometry();faceGeometry.setAttribute('position',new THREE.Float32BufferAttribute(facets,3));faceGeometry.computeVertexNormals()
  mesh(faceGeometry,leverMetal,push)
  push.scale.setScalar(.78);hinge.scale.setScalar(.78)
  const indicator=mesh(new RoundedBoxGeometry(.12,.008,.018,2,.004),lime,mounts[0],0,.058,.59)
  const dial=new THREE.Group();mounts[1].add(dial);dial.userData.control='dial'
  cylinder(.49,.13,silver,dial,.08);rim(.5,.026,polished,dial,.12)
  mesh(knurl(.56,.7,72,15,.535),silver,dial,0,.15)
  // Straight wall with a short machined shoulder immediately below the cap.
  const dialProfile=[new THREE.Vector2(.557,0),new THREE.Vector2(.557,.56),new THREE.Vector2(.532,.7)]
  mesh(new THREE.LatheGeometry(dialProfile,96),silver,dial,0,.15)
  rim(.535,.014,polished,dial,.86)
  cylinder(.531,.025,topMetal,dial,.865)
  // Planar UVs keep the circular lathe marks concentric across the cap.
  const cap=mesh(new THREE.CircleGeometry(.53,128),topMetal,dial,0,.885);cap.rotation.x=-Math.PI/2
  mesh(new RoundedBoxGeometry(.025,.008,.17,2,.005),dark,dial,0,.892,-.37)
  for(let i=0;i<41;i++){
    const angle=(-135+i*6.75)*Math.PI/180
    const tick=mesh(new THREE.BoxGeometry(i%5===0?.015:.009,.004,i%5===0?.10:.045),dark,mounts[1],Math.sin(angle)*.91,.008,-Math.cos(angle)*.91);tick.rotation.y=-angle
  }
  dial.scale.setScalar(.78)
  let state={...initial}, rotation=(initial.value/100-.5)*Math.PI*1.5, elevation=initial.on?-.34:.34
  let raf=0, last=0, visible=true, running=false, pointerX=0, lightX=-3
  let drag: {id:number;x:number;value:number;kind:string} | null=null
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches
  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2()
  function hit(e:PointerEvent){
    const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1)
    raycaster.setFromCamera(pointer,camera)
    const target=raycaster.intersectObjects([push,dial],true)[0]?.object
    let object:THREE.Object3D|null=target||null
    while(object && !object.userData.control)object=object.parent
    return object?.userData.control as string|undefined
  }
  function wake(){if(!running && visible && !document.hidden){running=true;last=performance.now();raf=requestAnimationFrame(draw)}}
  function draw(now:number){
    running=false
    if(!visible || document.hidden)return
    const dt=Math.min((now-last)/1000,.05);last=now
    const targetRotation=(state.value/100-.5)*Math.PI*1.5, targetElevation=state.on?-.34:.34
    const damping=reduced?1:1-Math.exp(-dt*8)
    rotation+=(targetRotation-rotation)*damping;elevation+=(targetElevation-elevation)*damping
    lightX+=(-3+pointerX*.55-lightX)*(reduced?1:1-Math.exp(-dt*3))
    dial.rotation.y=rotation;push.rotation.x=elevation
    lime.emissiveIntensity=state.on?.65:0;indicator.visible=state.on
    key.position.x=lightX
    renderer.render(scene,camera)
    if(Math.abs(rotation-targetRotation)+Math.abs(elevation-targetElevation)+Math.abs(lightX+3-pointerX*.55)>.0002){running=true;raf=requestAnimationFrame(draw)}
  }
  function down(e:PointerEvent){const kind=hit(e);if(!kind)return;drag={id:e.pointerId,x:e.clientX,value:state.value,kind};renderer.domElement.setPointerCapture(e.pointerId);if(kind==='dial')renderer.domElement.style.touchAction='none'}
  function move(e:PointerEvent){
    if(drag?.id===e.pointerId && drag.kind==='dial'){
      const value=Math.round(Math.max(0,Math.min(100,drag.value+(e.clientX-drag.x)*.48)))
      state.value=value;change(value);wake();return
    }
    const kind=hit(e);renderer.domElement.style.cursor=kind==='dial'?'ew-resize':kind?'pointer':'default'
    pointerX=pointer.x;wake()
  }
  function up(e:PointerEvent){if(drag?.id!==e.pointerId)return;if(drag.kind==='push' && Math.abs(e.clientX-drag.x)<12)toggle();drag=null;if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);renderer.domElement.style.touchAction='pan-y'}
  function cancel(){drag=null;renderer.domElement.style.touchAction='pan-y'}
  function leave(){pointerX=0;wake()}
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);renderer.domElement.addEventListener('pointerleave',leave)
  const resize=new ResizeObserver(()=>{
    const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h)
    const aspect=w/h,halfWidth=Math.max(3.5,2.1*aspect)
    camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfWidth/aspect;camera.bottom=-halfWidth/aspect
    camera.position.set(0,11,.65);camera.lookAt(0,.15,0);camera.updateProjectionMatrix();wake()
  });resize.observe(host)
  const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake()});visibility.observe(host)
  const resume=()=>{if(!document.hidden)wake()};document.addEventListener('visibilitychange',resume)
  wake()
  return {
    update(on:boolean,value:number,light:boolean){state={on,value,light};panel.color.set(light?0xc8ced2:0x444b50);wake()},
    dispose(){cancelAnimationFrame(raf);resize.disconnect();visibility.disconnect();document.removeEventListener('visibilitychange',resume)
      renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',cancel);renderer.domElement.removeEventListener('pointerleave',leave)
      const materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))}});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.domElement.remove()
    }
  }
}
