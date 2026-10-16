'use client'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import ParticleBloom, { type EntityInteraction } from './ParticleBloom'
import ButtonStudies from './ButtonStudies'
import RetroMood from './RetroMood'
import PrismFlare from './PrismFlare'
import CosmicDust from './CosmicDust'
import ParticleShockwave from './ParticleShockwave'
import './hero-study.css'

const palette = ['#7B7B7B', '#C6FF1B', '#E9ECE6']
export default function HeroStudy(){
 const [mood,setMood]=useState('observatory')
 const root=useRef<HTMLElement>(null),file=useRef<HTMLButtonElement>(null),stage=useRef<HTMLDivElement>(null)
 const interaction=useRef<EntityInteraction>({x:0,y:0,strength:0,burst:0,morph:0})
 const drag=useRef({held:false,x:0,y:0,ox:0,oy:0,startX:0,startY:0,absorbing:0,fromX:0,fromY:0,done:false,shrink:1})
 const [status,setStatus]=useState('Bring the file closer.'),[done,setDone]=useState(false)
 useEffect(()=>{
  const el=root.current!,card=file.current!,entity=stage.current!
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  let frame=0,last=0,clock=0,mx=0,my=0,tx=0,ty=0,swellAt=-10000
  const place=()=>{if(drag.current.held||drag.current.absorbing)return;const b=el.getBoundingClientRect();drag.current.x=b.width*(b.width<650?.24:.19);drag.current.y=b.height*(b.width<650?.77:.56)}
  place();window.addEventListener('resize',place)
  const move=(e:globalThis.PointerEvent)=>{const b=el.getBoundingClientRect();tx=(e.clientX-b.left)/b.width-.5;ty=(e.clientY-b.top)/b.height-.5}
  const leave=()=>{tx=ty=0};el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave)
  const draw=(now:number)=>{
   const dt=Math.min((now-last)/1000,.05);last=now
   if(!document.hidden){
    clock+=dt;const d=drag.current,b=entity.getBoundingClientRect(),r=el.getBoundingClientRect(),cx=b.left-r.left+b.width/2,cy=b.top-r.top+b.height/2
    let dx=d.x-cx,dy=d.y-cy,dist=Math.hypot(dx,dy)
    if(d.absorbing){
     const t=Math.min(1,(now-d.absorbing)/600),ease=1-Math.pow(1-t,3)
     d.x=d.fromX+(cx-d.fromX)*ease;d.y=d.fromY+(cy-d.fromY)*ease
     card.style.opacity=String(Math.pow(1-t,1.4));d.shrink=Math.max(.001,1-t)
     if(t===1){d.absorbing=0;d.done=true;setDone(true);setStatus('A little more yours.');interaction.current.burst=1;interaction.current.morph+=1;swellAt=now}
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
 const start=(e:PointerEvent<HTMLButtonElement>)=>{if(e.button!==0||drag.current.done||drag.current.absorbing)return;const r=root.current!.getBoundingClientRect(),d=drag.current;d.held=true;d.ox=e.clientX-r.left-d.x;d.oy=e.clientY-r.top-d.y;d.startX=d.x;d.startY=d.y;e.currentTarget.setPointerCapture(e.pointerId);setStatus('It can feel you getting closer.')}
 const move=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d.held)return;const r=root.current!.getBoundingClientRect();d.x=Math.max(65,Math.min(r.width-65,e.clientX-r.left-d.ox));d.y=Math.max(40,Math.min(r.height-40,e.clientY-r.top-d.oy))}
 const release=()=>{const d=drag.current;if(!d.held)return;d.held=false;const b=stage.current!.getBoundingClientRect(),r=root.current!.getBoundingClientRect();const dist=Math.hypot(d.x-(b.left-r.left+b.width/2),d.y-(b.top-r.top+b.height/2));if(dist<Math.min(b.width,b.height)*.34){d.absorbing=performance.now();d.fromX=d.x;d.fromY=d.y;setStatus('Making a connection…')}else setStatus('Bring the file closer.')}
 useEffect(()=>{window.addEventListener('pointerup',release);window.addEventListener('mouseup',release);return()=>{window.removeEventListener('pointerup',release);window.removeEventListener('mouseup',release)}},[])
 const reset=()=>{drag.current.done=false;drag.current.absorbing=0;const b=root.current!.getBoundingClientRect();drag.current.x=b.width*(b.width<650?.24:.19);drag.current.y=b.height*(b.width<650?.77:.56);file.current!.style.opacity='1';drag.current.shrink=1;setDone(false);setStatus('Bring the file closer.')}
 return <main ref={root} className="entity-playground" data-mood={mood}>
  <RetroMood mood={mood} onMood={setMood}/>
  <div className="cosmos" aria-hidden="true"><div className="cosmos-motion"><div className="solar-veil"/><div className="orbit-light"/><div className="planet-edge"/><div className="horizon-glow"/><div className="horizon"/></div><div className="entity-atmosphere"/></div>
  <svg className="cosmic-grain" width="100%" height="100%" aria-hidden="true"><filter id="cosmic-noise"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#cosmic-noise)"/></svg>
  <PrismFlare/><ButtonStudies/><CosmicDust/><ParticleShockwave interaction={interaction}/>
  <div ref={stage} className="playground-entity" role="img" aria-label="Living Tesseral entity reacts to the nearby file"><ParticleBloom dark active={false} colors={palette} organic waves wireframe={!done} radiant={done} interaction={interaction}/></div>
  <button ref={file} className="magnetic-file" aria-label="Drag sample brand brief into Tesseral, or press Enter to connect" aria-hidden={done} tabIndex={done?-1:0} onPointerDown={start} onPointerMove={move} onPointerUp={release} onLostPointerCapture={release} onDragStart={e=>e.preventDefault()} onPointerCancel={()=>{drag.current.held=false;setStatus('Bring the file closer.')}} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&!drag.current.absorbing&&!done){e.preventDefault();drag.current.absorbing=performance.now();drag.current.fromX=drag.current.x;drag.current.fromY=drag.current.y;setStatus('Making a connection…')}}}>
   <svg width="28" height="34" viewBox="0 0 28 34" fill="none" aria-hidden="true"><path d="M5 1h12l8 8v23H3V3a2 2 0 012-2Z" stroke="currentColor"/><path d="M17 1v9h8M8 17h12M8 22h12M8 27h8" stroke="currentColor"/></svg><span><strong>Brand brief</strong><small>PDF · SAMPLE FILE</small></span><span className="file-grip">⠿</span>
  </button>
  <div className="playground-status"><p role="status">{status}</p><span>{done?'Knowledge changes its shape.':'Drag the file into your Tesseral.'}</span>{done&&<button onClick={reset}>Try again ↗</button>}</div>
 </main>
}
