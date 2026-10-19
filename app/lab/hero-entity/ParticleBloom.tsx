'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'

// Every visible grain is geometry. There is no filled surface or screen-noise
// texture beneath it: folds become dense inside and disperse into dust outside.
const vertexShader = `
  uniform float time, energy, pixelRatio, viewportScale, organic, waves, wireframe;
  uniform vec3 lowColor, midColor, highColor;
  uniform vec2 magnet;
  uniform float attraction, burst, evolution;
  attribute vec4 seed;
  varying vec3 tint;
  varying float opacity;
  // A continuous, asymmetric trefoil: three soft lobes pass through the
  // center at different depths. Both parameters wrap without an open seam.
  vec3 organicForm(vec2 q){
    float t=(q.x+1.)*3.14159265, v=q.y*3.14159265;
    t+=evolution*.16;
    float breath=sin(time*.24);
    float lobe=2.+.13*breath+.22*sin(evolution*1.4);
    vec3 center=vec3(sin(t)+lobe*sin(2.*t),cos(t)-lobe*cos(2.*t),-1.05*sin(3.*t))*.43;
    vec3 tangent=normalize(vec3(cos(t)+2.*lobe*cos(2.*t),-sin(t)+2.*lobe*sin(2.*t),-3.15*cos(3.*t)));
    vec3 normal=normalize(vec3(-tangent.y,tangent.x,0.));
    vec3 binormal=normalize(cross(tangent,normal));
    float width=.39+.12*sin(3.*t+.7+time*.17)+.06*cos(2.*t-time*.13);
    float twist=.5*sin(2.*t+time*.14)+.3*cos(3.*t);
    float fold=1.+.12*sin(3.*v+2.*t-time*.2);
    float a=cos(v)*width*fold;
    float b=sin(v)*width*(.76+.12*cos(2.*t));
    if(waves>.5){
      // Broad open wavefronts curl along the lobe path, rather than forming
      // closed tubes. Their outer banks disperse into the surrounding space.
      float bank=q.y;
      width=.64+.19*sin(3.*t+.7+time*.17)+.09*cos(2.*t-time*.13);
      twist=.85*sin(2.*t+time*.18)+.5*cos(3.*t-time*.12);
      a=bank*width*(1.+.16*sin(2.*t+bank*3.-time*.22));
      b=.27*sin(bank*3.7+2.*t-time*.28)+.12*cos(bank*5.2-3.*t+time*.16);
      center+=normal*(.11*sin(3.*t-time*.24))+binormal*(.12*sin(2.*t+time*.2));
    }
    vec3 p=center+normal*(a*cos(twist)-b*sin(twist))+binormal*(a*sin(twist)+b*cos(twist));
    p.x+=.09*sin(p.y*2.3+time*.18);
    p.y+=.07*sin(p.x*2.+time*.21);
    p+=normal*sin(3.*t-time*.45)*energy*.045;
    return p;
  }
  vec3 form(vec2 q){
    if(organic>.5)return organicForm(q);
    float u=q.x, v=q.y;
    float breath=sin(time*.27);
    float curl=2.1+.45*breath;
    float theta=u*curl+.45+.16*sin(v*2.+time*.19);
    float width=1.5*pow(max(.001,1.-pow(abs(u),4.)),.33);
    vec3 p=vec3(v*width*cos(theta),u*(1.25+.14*breath),v*width*sin(theta));
    p.x+=.24*sin(u*3.5+time*.18);
    p.y+=.27*sin(v*2.6+u*1.3+time*.22)*(1.-u*u);
    p.z+=.46*cos(u*2.5)+.65*cos(v*2.7+u*.8+time*.17);
    return p;
  }
  void main(){
    vec2 q=position.xy;
    vec2 contour=q;
    {
      // Contours are made of the same grains, with sparse cross threads.
      // A few free grains remain between them and disperse at the banks.
      if(seed.w<.76)contour.y=floor((q.y+1.)*14.+.5)/14.-1.+(seed.x-.5)*.003;
      else if(seed.w<.96)contour.x=floor((q.x+1.)*38.+.5)/38.-1.+(seed.y-.5)*.0015;
    }
    q=mix(q,contour,wireframe);
    vec3 p=form(q);
    vec3 n=normalize(cross(form(q+vec2(.003,0.))-p,form(q+vec2(0.,.003))-p));
    float border=max(abs(q.x),abs(q.y));
    float dissolve=smoothstep(.6,1.,border);
    if(organic>.5){
      // The closed lobes have no parameter borders. Dust follows their folds
      // instead, preserving the continuous silhouette and its dense interior.
      dissolve=.24+.60*pow(.5+.5*sin(q.y*6.283+q.x*9.424-time*.12),3.);
    }
    if(waves>.5)dissolve=smoothstep(.35,1.,abs(q.y));
    float cloud=step(mix(.86,.73,waves),seed.w);
    float thickness=.004+pow(dissolve,2.)*.035+cloud*.035;
    if(waves>.5)thickness+=dissolve*dissolve*(.09+cloud*.10);
    thickness*=mix(1.,.22,wireframe);
    p+=n*position.z*thickness;
    if(waves>.5){
      vec3 drift=vec3(sin(q.x*9.4+time*.21),cos(q.y*3.1-time*.17),sin(q.x*6.2+q.y*2.+time*.2));
      p+=drift*dissolve*dissolve*seed.z*.18;
    }
    p+=vec3(seed.x-.5,seed.y-.5,seed.z-.5)*dissolve*dissolve*.11;
    p+=n*sin(time*.5+seed.y*6.283)*(.008+energy*.02);
    p.x+=sin(p.y*2.+evolution)*.12*sin(evolution);
    p.z+=cos(p.x*2.+evolution)*.17*sin(evolution*.8);
    // Scale response is a single eased swell controlled by the playground.
    vec4 mv=modelViewMatrix*vec4(p,1.);
    vec2 destination=magnet*vec2(2.55,2.55);
    // Sparse, curved wisps. Most grains stay in the body, with no wedge boundary.
    vec2 delta=destination-mv.xy;
    float alignment=max(0.,dot(normalize(mv.xy+vec2(.0001)),normalize(destination+vec2(.0001))));
    float strand=pow(alignment,3.)*smoothstep(.68,.98,seed.z);
    float driftPhase=time*.9+seed.x*6.283;
    float pull=attraction*strand*(.45+.4*sin(seed.y*3.14));
    vec2 perpendicular=normalize(vec2(-delta.y,delta.x)+vec2(.0001));
    mv.xy+=delta*pull*.9;
    mv.xy+=perpendicular*sin(driftPhase+pull*4.)*sin(pull*3.14)*(.12+seed.y*.32);
    mv.z+=sin(driftPhase*.7)*pull*.2;
    vec3 normal=normalize(normalMatrix*n), view=normalize(-mv.xyz);
    float face=abs(dot(normal,view));
    if(dot(normal,view)<0.)normal=-normal;
    float diffuse=max(dot(normal,normalize(vec3(-.5,.8,1.))),0.);
    float field=clamp(.43+q.x*.45+q.y*.18+.035*sin(time*.12),0.,1.);
    if(organic>.5)field=clamp(.48+p.y*.28+p.x*.15+.04*sin(time*.12),0.,1.);
    vec3 c=mix(lowColor,midColor,smoothstep(.12,.58,field));
    c=mix(c,highColor,smoothstep(.50,.9,field));
    c*=mix(.50+.72*diffuse,1.12,smoothstep(.55,.9,field));
    c+=midColor*pow(1.-face,3.)*.22;
    c*=.92+seed.z*.16;
    // Tiny pale grains catch light independently, like fine illuminated sand.
    c=mix(c,mix(midColor,vec3(1.),.5),pow(seed.x,18.)*.36*dissolve);
    tint=c*(1.+burst*1.9);
    opacity=(.94+seed.y*.06)*(1.-smoothstep(.75,1.,border));
    if(organic>.5)opacity=.96-dissolve*cloud*.46;
    if(waves>.5)opacity=(1.-smoothstep(.48,1.,abs(q.y)))*(.96-.25*cloud);
    opacity*=mix(1.,.4,cloud);
    float rearSoftness=1.+(1.-smoothstep(-1.2,-.3,p.z))*.8;
    gl_PointSize=clamp((1.5+seed.x*.8)*(1.+(1.-dissolve)*.6)*pixelRatio*viewportScale*(7./-mv.z)*rearSoftness, .7, 4.5*pixelRatio);
    gl_PointSize*=mix(1.,.72,wireframe);opacity*=mix(1.,.78,wireframe);
    gl_Position=projectionMatrix*mv;
  }
`
const fragmentShader = `
  varying vec3 tint;varying float opacity;
  void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
    float a=(1.-smoothstep(.65,1.,r))*opacity;if(a<.012)discard;
    // Stochastic coverage avoids translucent foreground dust writing depth
    // over an opaque interior. Grain color stays saturated where it is dense.
    float threshold=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
    if(a<threshold)discard;
    gl_FragColor=vec4(tint,1.);
  }
`
const postVertex = 'varying vec2 tex;void main(){tex=uv;gl_Position=vec4(position.xy,0.,1.);}'

export type EntityInteraction = { x:number; y:number; strength:number; burst:number; morph:number }

export default function ParticleBloom({ dark, active, colors, organic=false, waves=false, radiant=false, wireframe=false, interaction: externalInteraction }: { dark:boolean; active:boolean; colors:string[]; organic?:boolean; waves?:boolean; radiant?:boolean; wireframe?:boolean; interaction?:RefObject<EntityInteraction> }) {
  const host=useRef<HTMLDivElement>(null)
  const current=useRef({dark,active,colors,organic,waves,radiant,wireframe});current.current={dark,active,colors,organic,waves,radiant,wireframe}
  const [fallback,setFallback]=useState(false)
  useEffect(()=>{
    const root=host.current;if(!root)return
    let renderer:THREE.WebGLRenderer
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false})}catch{setFallback(true);return}
    const mobile=matchMedia('(pointer: coarse)').matches||window.innerWidth<768
    renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.5));renderer.setClearColor(0,0)
    root.appendChild(renderer.domElement)
    const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group)
    const camera=new THREE.PerspectiveCamera(40,1,.1,30);camera.position.z=7
    const count=mobile?28000:240000
    const positions=new Float32Array(count*3),seeds=new Float32Array(count*4)
    let randomState=170315
    const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296}
    for(let i=0;i<count;i++){
      positions[i*3]=random()*2-1;positions[i*3+1]=random()*2-1
      // Gaussian thickness produces a full body with very sparse outskirts.
      positions[i*3+2]=Math.sqrt(-2*Math.log(Math.max(.00001,random())))*Math.cos(random()*Math.PI*2)
      for(let j=0;j<4;j++)seeds[i*4+j]=random()
    }
    const geometry=new THREE.BufferGeometry()
    geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('seed',new THREE.BufferAttribute(seeds,4))
    const uniforms={magnet:{value:new THREE.Vector2()},attraction:{value:0},burst:{value:0},evolution:{value:0},wireframe:{value:wireframe?1:0},time:{value:0},energy:{value:0},organic:{value:organic?1:0},waves:{value:waves?1:0},pixelRatio:{value:renderer.getPixelRatio()},viewportScale:{value:1},
      lowColor:{value:new THREE.Color(colors[0])},midColor:{value:new THREE.Color(colors[1]||colors[0])},highColor:{value:new THREE.Color(colors[2]||colors[0])}}
    const material=new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:false,depthWrite:true})
    const grains=new THREE.Points(geometry,material);grains.frustumCulled=false;group.add(grains)
    const target=new THREE.WebGLRenderTarget(1,1)
    const glowA=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false}),glowB=glowA.clone()
    const auraA=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false}),auraB=auraA.clone()
    const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),postGeometry=new THREE.PlaneGeometry(2,2)
    const blur=new THREE.ShaderMaterial({uniforms:{image:{value:target.texture},direction:{value:new THREE.Vector2()}},vertexShader:postVertex,
      fragmentShader:`uniform sampler2D image;uniform vec2 direction;varying vec2 tex;
        void main(){vec4 c=vec4(0.);float total=0.;for(int i=-7;i<=7;i++){float w=exp(-float(i*i)/18.);c+=texture2D(image,tex+direction*float(i))*w;total+=w;}gl_FragColor=c/total;}`,
      depthTest:false,depthWrite:false,blending:THREE.NoBlending})
    const composite=new THREE.ShaderMaterial({uniforms:{image:{value:target.texture},glow:{value:glowB.texture},aura:{value:auraB.texture},radiant:{value:radiant?1:0},aspect:{value:1},dark:{value:dark?1:0}},vertexShader:postVertex,
      fragmentShader:`uniform sampler2D image,glow,aura;uniform float dark,radiant,aspect;varying vec2 tex;
        void main(){vec4 grains=texture2D(image,tex),halo=texture2D(glow,tex);
          // Preserve crisp individual grains; only their emitted light is blurred.
          vec3 body=grains.rgb/max(grains.a,.0001);
          vec3 light=halo.rgb/max(halo.a,.0001);
          float a=grains.a+halo.a*.44*(1.-grains.a);
          vec3 c=body*grains.a+light*halo.a*.44*(1.-grains.a);
          c+=halo.rgb*mix(.24,.62,dark);
          if(radiant>.001){
            // A feathered inner light, shaped by the folds themselves.
            // Outside this core the original Tesseral drift composite is exact.
            vec4 wide=texture2D(aura,tex);
            float core=1.-smoothstep(.035,.235,length((tex-.5)*vec2(aspect,1.)));
            core*=smoothstep(.04,.45,wide.a)*radiant;
            float veil=wide.a*.16*(1.-a)*core;
            vec3 pearl=mix(wide.rgb/max(wide.a,.0001),vec3(1.,1.,.96),.22);
            c+=pearl*veil;
            a+=veil;
            c+=(halo.rgb*mix(.24,.46,dark)+pearl*wide.a*mix(.10,.20,dark))*core;
          }
          c=pow(max(c/max(a,.0001),vec3(0.)),vec3(1./2.2))*a;
          gl_FragColor=vec4(c,a);}`,
      transparent:true,depthTest:false,depthWrite:false,blending:THREE.NoBlending})
    const quad=new THREE.Mesh(postGeometry,composite);postScene.add(quad)
    const resize=()=>{
      const w=root.clientWidth*1.5,h=root.clientHeight*1.5,dpr=renderer.getPixelRatio()
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()
      composite.uniforms.aspect.value=w/h
      target.setSize(w*dpr,h*dpr);glowA.setSize(Math.ceil(w*dpr/(mobile?5:3)),Math.ceil(h*dpr/(mobile?5:3)));glowB.setSize(glowA.width,glowA.height)
      auraA.setSize(Math.ceil(w*dpr/6),Math.ceil(h*dpr/6));auraB.setSize(auraA.width,auraA.height)
      uniforms.viewportScale.value=Math.max(.8,root.clientHeight/460)
    }
    const observer=new ResizeObserver(resize);observer.observe(root);resize()
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame=0,elapsed=0,last=0,hover=0,px=0,py=0
    let styleFrom=wireframe?1:0,styleTo=styleFrom,styleTime=3.6
    const interaction=root.parentElement!
    const enter=()=>{hover=1},leave=()=>{hover=0;px=py=0}
    const move=(e:PointerEvent)=>{const b=interaction.getBoundingClientRect();px=(e.clientX-b.left)/b.width-.5;py=(e.clientY-b.top)/b.height-.5}
    interaction.addEventListener('pointerenter',enter);interaction.addEventListener('pointerleave',leave);interaction.addEventListener('pointermove',move);interaction.addEventListener('focus',enter);interaction.addEventListener('blur',leave)
    const tint=new THREE.Color()
    const draw=(now:number)=>{
      if(mobile&&now-last<1000/30-1){frame=requestAnimationFrame(draw);return}
      const dt=Math.min((now-last)/1000,.1);last=now
      if(!document.hidden){
        if(!reduced)elapsed+=dt
        const input=externalInteraction?.current;
        if(input){uniforms.magnet.value.set(input.x,input.y);uniforms.attraction.value=input.strength;uniforms.burst.value=reduced?input.burst*.15:input.burst;uniforms.evolution.value=THREE.MathUtils.lerp(uniforms.evolution.value,input.morph,1-Math.exp(-dt*.72))}
        uniforms.time.value=elapsed;uniforms.energy.value=THREE.MathUtils.lerp(uniforms.energy.value,current.current.active?1:hover*.3,1-Math.exp(-dt*2.1))
        uniforms.organic.value=current.current.organic?1:0
        uniforms.waves.value=current.current.waves?1:0
        const nextStyle=current.current.wireframe?1:0
        if(nextStyle!==styleTo){styleFrom=uniforms.wireframe.value;styleTo=nextStyle;styleTime=0}
        styleTime=Math.min(3.6,styleTime+dt)
        const progress=styleTime/3.6,eased=progress*progress*progress*(progress*(progress*6-15)+10)
        uniforms.wireframe.value=THREE.MathUtils.lerp(styleFrom,styleTo,eased)
        composite.uniforms.dark.value=current.current.dark?1:0
        composite.uniforms.radiant.value=1-uniforms.wireframe.value
        ;[uniforms.lowColor,uniforms.midColor,uniforms.highColor].forEach((u,i)=>u.value.lerp(tint.set(current.current.colors[i]||current.current.colors[0]),1-Math.exp(-dt*2.1)))
        group.rotation.set(.15+(reduced?0:Math.sin(elapsed*.15)*.12+py*.12),.25+(reduced?0:Math.sin(elapsed*.18)*.32+px*.18),-.38+(reduced?0:Math.sin(elapsed*.12)*.08))
        renderer.setRenderTarget(target);renderer.render(scene,camera)
        quad.material=blur;blur.uniforms.image.value=target.texture;blur.uniforms.direction.value.set(2.7/glowA.width,0)
        renderer.setRenderTarget(glowA);renderer.render(postScene,postCamera)
        blur.uniforms.image.value=glowA.texture;blur.uniforms.direction.value.set(0,2.7/glowB.height)
        renderer.setRenderTarget(glowB);renderer.render(postScene,postCamera)
        if(!mobile&&composite.uniforms.radiant.value>.001){
          blur.uniforms.image.value=glowB.texture;blur.uniforms.direction.value.set(3.8/auraA.width,0)
          renderer.setRenderTarget(auraA);renderer.render(postScene,postCamera)
          blur.uniforms.image.value=auraA.texture;blur.uniforms.direction.value.set(0,3.8/auraB.height)
          renderer.setRenderTarget(auraB);renderer.render(postScene,postCamera)
        }
        composite.uniforms.aura.value=mobile?glowB.texture:auraB.texture;
        quad.material=composite;renderer.setRenderTarget(null);renderer.render(postScene,postCamera)
        window.dispatchEvent(new CustomEvent("tesseral-render",{detail:renderer.domElement}))
      }
      frame=requestAnimationFrame(draw)
    }
    frame=requestAnimationFrame(draw)
    return()=>{cancelAnimationFrame(frame);observer.disconnect();interaction.removeEventListener('pointerenter',enter);interaction.removeEventListener('pointerleave',leave);interaction.removeEventListener('pointermove',move);interaction.removeEventListener('focus',enter);interaction.removeEventListener('blur',leave);geometry.dispose();material.dispose();target.dispose();glowA.dispose();glowB.dispose();auraA.dispose();auraB.dispose();postGeometry.dispose();blur.dispose();composite.dispose();renderer.dispose();renderer.domElement.remove()}
  },[])
  return <div className="living-render ethereal-render flow-render" ref={host} aria-hidden="true">{fallback&&<img className="pearl-fallback" src="/header/logo.webp" alt=""/>}</div>
}
