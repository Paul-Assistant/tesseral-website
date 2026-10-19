'use client'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import ParticleBloom, { type EntityInteraction } from './ParticleBloom'
import HeroComposition, { ParticleLogo } from './HeroComposition'
import { MaterialButton } from './ButtonStudies'
import RetroMood from './RetroMood'
import PrismFlare from './PrismFlare'
import SphereParticles from './SphereParticles'
import CosmicDust from './CosmicDust'
import ParticleShockwave from './ParticleShockwave'
import './hero-study.css'
import './hero-composition.css'

const palette = ['#7B7B7B', '#C6FF1B', '#E9ECE6']
export default function HeroStudy(){
 const [light,setLight]=useState(true)
 const root=useRef<HTMLElement>(null),file=useRef<HTMLButtonElement>(null),stage=useRef<HTMLDivElement>(null)
 const interaction=useRef<EntityInteraction>({x:0,y:0,strength:0,burst:0,morph:0})
 const drag=useRef({held:false,x:0,y:0,ox:0,oy:0,startX:0,startY:0,absorbing:0,fromX:0,fromY:0,done:false,shrink:1})
 const [done,setDone]=useState(false)
 useEffect(()=>{
  const el=root.current!,card=file.current!,entity=stage.current!
  const mobile=matchMedia('(pointer: coarse)').matches||innerWidth<768
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  let frame=0,last=0,clock=0,mx=0,my=0,tx=0,ty=0,swellAt=-10000
  const place=()=>{if(drag.current.held||drag.current.absorbing)return;const b=el.getBoundingClientRect();drag.current.x=b.width*(b.width<650?.78:.847);drag.current.y=b.height*(b.width<650?.72:.252)}
  place();window.addEventListener('resize',place)
  const move=(e:globalThis.PointerEvent)=>{if(mobile)return;const b=el.getBoundingClientRect();tx=(e.clientX-b.left)/b.width-.5;ty=(e.clientY-b.top)/b.height-.5}
  const leave=()=>{tx=ty=0};el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave)
  const draw=(now:number)=>{
   if(mobile&&!drag.current.held&&!drag.current.absorbing&&now-last<33){frame=requestAnimationFrame(draw);return}
   const dt=Math.min((now-last)/1000,.1);last=now
   if(!document.hidden){
    clock+=dt;const d=drag.current,b=entity.getBoundingClientRect(),r=el.getBoundingClientRect(),cx=b.left-r.left+b.width/2,cy=b.top-r.top+b.height/2
    let dx=d.x-cx,dy=d.y-cy,dist=Math.hypot(dx,dy)
    if(d.absorbing){
     const t=Math.min(1,(now-d.absorbing)/600),ease=1-Math.pow(1-t,3)
     d.x=d.fromX+(cx-d.fromX)*ease;d.y=d.fromY+(cy-d.fromY)*ease
     card.style.opacity=String(Math.pow(1-t,1.4));d.shrink=Math.max(.001,1-t)
     if(t===1){d.absorbing=0;d.done=true;setDone(true);interaction.current.burst=1;interaction.current.morph+=1;swellAt=now}
    }
    const reach=d.held?Math.max(0,Math.min(1,(b.width*.8-dist)/(b.width*.55))):0
    interaction.current.x=dx/(b.width*.5);interaction.current.y=-dy/(b.height*.5)
    interaction.current.strength+=(reach-interaction.current.strength)*(1-Math.exp(-dt*8))
    interaction.current.burst=Math.max(0,interaction.current.burst-dt*.65)
    const flash=interaction.current.burst
    el.style.setProperty('--flash',String(reduced?flash*.15:flash))
    const swell=Math.min(1,Math.max(0,(now-swellAt)/4200))
    el.style.setProperty('--pulse',String(reduced?1:1+Math.pow(Math.sin(swell*Math.PI),2)*.075))
    mx+=(tx-mx)*.035;my+=(ty-my)*.035
    el.style.setProperty('--mx',`${reduced?0:mx*70}px`);el.style.setProperty('--my',`${reduced?0:my*48}px`)
    card.style.transform=`translate3d(${d.x}px,${d.y}px,0) translate(-50%,-50%) rotate(${d.held||d.absorbing?0:reduced?0:Math.sin(clock*.5)*3-5}deg) scale(${d.shrink})`
   }
   frame=requestAnimationFrame(draw)
  };frame=requestAnimationFrame(draw)
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',place);el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave)}
 },[])
 const start=(e:PointerEvent<HTMLButtonElement>)=>{if(e.button!==0||drag.current.done||drag.current.absorbing)return;const r=root.current!.getBoundingClientRect(),d=drag.current;d.held=true;d.ox=e.clientX-r.left-d.x;d.oy=e.clientY-r.top-d.y;d.startX=d.x;d.startY=d.y;e.currentTarget.setPointerCapture(e.pointerId);}
 const move=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d.held)return;const r=root.current!.getBoundingClientRect();d.x=Math.max(65,Math.min(r.width-65,e.clientX-r.left-d.ox));d.y=Math.max(40,Math.min(r.height-40,e.clientY-r.top-d.oy))}
 const release=()=>{const d=drag.current;if(!d.held)return;d.held=false;const b=stage.current!.getBoundingClientRect(),r=root.current!.getBoundingClientRect();const dist=Math.hypot(d.x-(b.left-r.left+b.width/2),d.y-(b.top-r.top+b.height/2));if(dist<Math.min(b.width,b.height)*.34){d.absorbing=performance.now();d.fromX=d.x;d.fromY=d.y;}}
 useEffect(()=>{window.addEventListener('pointerup',release);window.addEventListener('mouseup',release);return()=>{window.removeEventListener('pointerup',release);window.removeEventListener('mouseup',release)}},[])
 return <main ref={root} className="entity-playground" data-mood="observatory" data-theme={light?'light':'dark'}>
  <div className="hero-theme-toggle"><MaterialButton kind="icon" label={light?'Switch to dark mode':'Switch to light mode'} selected={!light} onSelect={()=>setLight(!light)}><svg className="theme-glyph" data-light={light} width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g className="theme-sun" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></g><path className="theme-moon" d="M19.8 15A8 8 0 0 1 9 4.2 8 8 0 1 0 19.8 15Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg></MaterialButton></div>
  <RetroMood/>
  <div className="cosmos" aria-hidden="true"><div className="cosmos-motion"><div className="solar-veil"/><div className="orbit-light"/><div className="planet-edge"/><div className="horizon-glow"/><div className="horizon"/></div><div className="entity-atmosphere"/></div>
  <svg className="cosmic-grain" width="100%" height="100%" aria-hidden="true"><filter id="cosmic-noise"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#cosmic-noise)"/></svg>
  <SphereParticles/><PrismFlare/><HeroComposition/><CosmicDust/><ParticleShockwave interaction={interaction}/>
  <div ref={stage} className="playground-entity" role="img" aria-label="Living Tesseral entity reacts to the nearby file"><ParticleBloom dark={!light} active={false} colors={light?['#343B3D','#C6FF1B','#6B7577']:palette} organic waves wireframe={!done} radiant={done} interaction={interaction}/></div>
  <button ref={file} className="magnetic-file material-frost" aria-label="Drag sample Figma file into Tesseral, or press Enter to connect" aria-hidden={done} tabIndex={done?-1:0} onPointerDown={start} onPointerMove={move} onPointerUp={release} onLostPointerCapture={release} onDragStart={e=>e.preventDefault()} onPointerCancel={()=>{drag.current.held=false;}} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&!drag.current.absorbing&&!done){e.preventDefault();drag.current.absorbing=performance.now();drag.current.fromX=drag.current.x;drag.current.fromY=drag.current.y;}}}>
   <span className="material-backdrop" aria-hidden="true"/><span className="material-cloud" aria-hidden="true"/><span className="material-rim" aria-hidden="true"/><span className="material-reflection" aria-hidden="true"/>
   {!done&&<ParticleLogo/>}<span className="tile-title">Visual reference</span><span className="tile-meta"><span>FIGMA FILE</span><span>8 PAGES</span></span>
  </button>
 </main>
}
