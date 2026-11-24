import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

type State = { on: boolean; value: number; light: boolean }

// A cut diamond surface, not a printed texture: each facet catches its own reflection.
function knurl(radius: number, height: number, columns: number, rows: number) {
  const positions: number[] = []
  const point = (a: number, y: number, r: number) => [Math.cos(a)*r, y, Math.sin(a)*r]
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
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05
  host.appendChild(renderer.domElement)
  const scene=new THREE.Scene()
  const camera=new THREE.PerspectiveCamera(27,1,.1,60)
  camera.position.set(1.1,6.3,8.5);camera.lookAt(0,.15,0)
  const pmrem=new THREE.PMREMGenerator(renderer), room=new THREE.Scene()
  room.background=new THREE.Color(0x353a40)
  const softboxes: THREE.Mesh[]=[]
  for(const [x,y,z,w,h,power] of [[-3,5,1,2,7,5],[4,3,2,1.2,6,3],[0,4,-4,5,2,4]]){
    const box=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(power,power,power),side:THREE.DoubleSide}))
    box.position.set(x,y,z);box.lookAt(0,0,0);room.add(box);softboxes.push(box)
  }
  const env=pmrem.fromScene(room,.025);scene.environment=env.texture
  softboxes.forEach(box=>{box.geometry.dispose();(box.material as THREE.Material).dispose()});pmrem.dispose()
  const textures: THREE.Texture[]=[]
  const scratch=document.createElement('canvas');scratch.width=scratch.height=512
  const pen=scratch.getContext('2d')!, data=pen.createImageData(512,512)
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const r=Math.hypot(x-256,y-256), n=Math.sin(r*11)*3+Math.sin(r*27)*2
    const v=125+n+Math.sin(x*12.98+y*78.23)*2, i=(y*512+x)*4
    data.data[i]=data.data[i+1]=data.data[i+2]=v;data.data[i+3]=255
  }
  pen.putImageData(data,0,0)
  const brushing=new THREE.CanvasTexture(scratch);textures.push(brushing)
  const directionData=new Uint8Array(256*256*4)
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const angle=Math.atan2(y-128,x-128)+Math.PI/2,i=(y*256+x)*4
    directionData[i]=Math.round((Math.cos(angle)*.5+.5)*255);directionData[i+1]=Math.round((Math.sin(angle)*.5+.5)*255);directionData[i+2]=255;directionData[i+3]=255
  }
  const directions=new THREE.DataTexture(directionData,256,256);directions.needsUpdate=true;textures.push(directions)
  const silver=new THREE.MeshPhysicalMaterial({color:0xcbd0d4,metalness:1,roughness:.24,envMapIntensity:1.5})
  const polished=new THREE.MeshPhysicalMaterial({color:0xe7ebee,metalness:1,roughness:.12,envMapIntensity:1.5})
  const topMetal=new THREE.MeshPhysicalMaterial({color:0xd9dfe2,metalness:1,roughness:.26,bumpMap:brushing,bumpScale:.012,anisotropy:1,anisotropyMap:directions,envMapIntensity:1.1})
  const dark=new THREE.MeshStandardMaterial({color:0x171b1e,metalness:.65,roughness:.38})
  const panel=new THREE.MeshStandardMaterial({color:initial.light?0xc8ced2:0x444b50,metalness:.48,roughness:.42})
  const lime=new THREE.MeshStandardMaterial({color:0xc6ff1b,emissive:0xc6ff1b,emissiveIntensity:0,roughness:.3})
  function mesh(geometry:THREE.BufferGeometry, material:THREE.Material, parent:THREE.Object3D, x=0,y=0,z=0){
    const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object
  }
  function cylinder(r:number,h:number,material:THREE.Material,parent:THREE.Object3D,y:number){return mesh(new THREE.CylinderGeometry(r,r,h,96),material,parent,0,y)}
  function rim(r:number,tube:number,material:THREE.Material,parent:THREE.Object3D,y:number){const ring=mesh(new THREE.TorusGeometry(r,tube,12,128),material,parent,0,y);ring.rotation.x=Math.PI/2;return ring}
  const floor=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.22}),scene,0,-.18);floor.rotation.x=-Math.PI/2
  scene.add(new THREE.HemisphereLight(0xe9f2ff,0x53514c,.5))
  const key=new THREE.DirectionalLight(0xffffff,2);key.position.set(-3,7,4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.normalBias=.018;key.shadow.bias=-.0002;key.shadow.radius=5;scene.add(key)
  const fill=new THREE.DirectionalLight(0xe5edff,1);fill.position.set(4,3,-3);scene.add(fill)
  const mounts=[-1.52,1.52].map(x=>{
    const group=new THREE.Group();group.position.x=x;scene.add(group)
    mesh(new RoundedBoxGeometry(2.75,.16,2.65,5,.12),panel,group,0,-.08)
    cylinder(.78,.025,dark,group,.008);cylinder(.746,.028,silver,group,.019)
    rim(.743,.012,polished,group,.038);cylinder(.64,.035,dark,group,.035)
    return group
  })
  const push=new THREE.Group();mounts[0].add(push);push.userData.control='push'
  cylinder(.36,.36,silver,push,.04)
  cylinder(.61,.035,polished,push,.19)
  mesh(new RoundedBoxGeometry(1.13,.16,.62,6,.07),silver,push,0,.28)
  mesh(new RoundedBoxGeometry(1.06,.018,.54,3,.04),topMetal,push,0,.369)
  // Fine cross-cut grip on the leading edge of the low-profile paddle.
  const grip=mesh(knurl(.03,.78,4,28),polished,push,-.39,.29,.309);grip.rotation.z=-Math.PI/2
  mesh(new RoundedBoxGeometry(.48,.014,.024,2,.009),dark,push,0,.382,.055)
  const indicator=mesh(new RoundedBoxGeometry(.22,.016,.018,2,.007),lime,push,0,.384,-.12)
  const dial=new THREE.Group();mounts[1].add(dial);dial.userData.control='dial'
  cylinder(.49,.13,silver,dial,.08);rim(.5,.026,polished,dial,.12)
  mesh(knurl(.55,.7,80,15),silver,dial,0,.15)
  cylinder(.547,.7,silver,dial,.5)
  rim(.55,.019,polished,dial,.86)
  cylinder(.543,.035,topMetal,dial,.865)
  // Planar UVs keep the circular lathe marks concentric across the cap.
  const cap=mesh(new THREE.CircleGeometry(.535,128),topMetal,dial,0,.885);cap.rotation.x=-Math.PI/2
  mesh(new RoundedBoxGeometry(.025,.008,.17,2,.005),dark,dial,0,.892,-.37)
  for(let i=0;i<41;i++){
    const angle=(-135+i*6.75)*Math.PI/180
    const tick=mesh(new THREE.BoxGeometry(i%5===0?.015:.009,.004,i%5===0?.10:.045),dark,mounts[1],Math.sin(angle)*.91,.008,-Math.cos(angle)*.91);tick.rotation.y=-angle
  }
  let state={...initial}, rotation=(initial.value/100-.5)*Math.PI*1.5, elevation=initial.on?.26:-.16
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
    const targetRotation=(state.value/100-.5)*Math.PI*1.5, targetElevation=state.on?.26:-.16
    const damping=reduced?1:1-Math.exp(-dt*8)
    rotation+=(targetRotation-rotation)*damping;elevation+=(targetElevation-elevation)*damping
    lightX+=(-3+pointerX*.55-lightX)*(reduced?1:1-Math.exp(-dt*3))
    dial.rotation.y=rotation;push.position.y=elevation
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
    const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h
    camera.position.set(1.1,6.3,8.5).multiplyScalar(Math.max(1,1.65/camera.aspect));camera.lookAt(0,.15,0);camera.updateProjectionMatrix();wake()
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
