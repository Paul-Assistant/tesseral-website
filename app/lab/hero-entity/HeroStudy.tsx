'use client'
import { useEffect, useRef, useState } from 'react'
import ParticleBloom from './ParticleBloom'
import './hero-study.css'

const palette = ['#7B7B7B', '#C6FF1B', '#D7D4CD']
const samples = [
  {name:'Brand brief',type:'PDF · 12 pages',icon:'▤',answer:'You want to feel premium without becoming unapproachable. Let’s explore that.'},
  {name:'Visual references',type:'FIGMA · Collection',icon:'✳',answer:'Quiet typography. Unexpected colour. There’s a useful tension here to build on.'},
  {name:'Competitor research',type:'RESEARCH · 8 sources',icon:'↗',answer:'Your competitors lead with technical expertise. What if your brand led with the people behind it?'}
]
export default function HeroStudy(){
 const root=useRef<HTMLElement>(null)
 const [clean,setClean]=useState(false),[haze,setHaze]=useState(65),[grain,setGrain]=useState(18)
 const [selected,setSelected]=useState<number|null>(null),[dragging,setDragging]=useState(false)
 useEffect(()=>{
  const el=root.current!;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  let x=0,y=0,tx=0,ty=0,frame=0
  const move=(e:PointerEvent)=>{if(e.pointerType==='touch')return;tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5}
  const leave=()=>{tx=ty=0}
  const draw=()=>{if(!document.hidden&&!reduced){x+=(tx-x)*.035;y+=(ty-y)*.035;el.style.setProperty('--mx',`${x*65}px`);el.style.setProperty('--my',`${y*45}px`)}frame=requestAnimationFrame(draw)}
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);frame=requestAnimationFrame(draw)
  return()=>{cancelAnimationFrame(frame);el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave)}
 },[])
 const feed=(i:number)=>{setSelected(i);setDragging(false)}
 return <main ref={root} className={`entity-study ${clean?'is-clean':''}`} style={{'--haze':haze/100,'--grain':grain/100} as React.CSSProperties}>
  <div className="space-field" aria-hidden="true"><div className="space-drift"><div className="space-cloud cloud-one"/><div className="space-cloud cloud-two"/><div className="space-cloud cloud-three"/><div className="space-ray"/></div></div>
  <svg className="space-grain" width="100%" height="100%" aria-hidden="true"><filter id="space-noise"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#space-noise)"/></svg>
  <header className="study-header"><a href="/" aria-label="Tesseral homepage"><img src="/header/wordmark.svg" alt="Tesseral"/></a><span className="study-edition">EXPLORATION 01 / LIVING INTELLIGENCE</span><button className="study-view" onClick={()=>setClean(!clean)}>{clean?'Show headline ↗':'Explore the entity ↗'}</button></header>
  <div className="study-copy"><p className="study-eyebrow"><span/> YOUR CREATIVE INTELLIGENCE</p><h1>Give your next big idea<br/><span>a mind to work with.</span></h1><p className="study-description">Meet your Tesseral. Shaped by 17 years of agency experience,<br className="desktop-break"/> it gets to know your client through files, research and conversations.</p></div>
  <div className={`entity-stage ${dragging?'is-dragging':''}`} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='copy'}} onDrop={e=>{e.preventDefault();const value=e.dataTransfer.getData('text/tesseral-sample');if(/^[0-2]$/.test(value))feed(Number(value));else setDragging(false)}}>
   <button className="entity-touch" aria-label="Meet your Tesseral: try a sample brief" onClick={()=>feed(selected===null?0:(selected+1)%samples.length)}><ParticleBloom dark active={selected!==null} colors={palette} organic waves radiant/></button>
   <div className="entity-caption">{dragging?'DROP IT INTO YOUR TESSERAL':'YOUR TESSERAL'}<span>{selected===null?'Ready to think with you':'Connecting your world'}</span></div>
   {selected!==null&&<div className="entity-response" role="status"><small>SAMPLE RESPONSE · {samples[selected].name}</small><p>{samples[selected].answer}</p><button aria-label="Dismiss sample response" onClick={()=>setSelected(null)}>×</button></div>}
  </div>
  <div className="study-sources" aria-label="Sample files">{samples.map((file,i)=><button key={file.name} className={`study-file file-${i} ${selected===i?'is-connected':''}`} draggable onDragStart={e=>{e.dataTransfer.setData('text/tesseral-sample',String(i));e.dataTransfer.effectAllowed='copy';setDragging(true)}} onDragEnd={()=>setDragging(false)} onClick={()=>feed(i)}><span className="file-icon">{file.icon}</span><span><strong>{file.name}</strong><small>{selected===i?'CONNECTED':file.type}</small></span><span className="file-add">{selected===i?'✓':'+'}</span></button>)}</div>
  <footer className="study-bottom"><p>Give it something to think about.<span>Drag a sample file into the entity, or tap to connect.</span></p><div className="study-controls"><label>Atmosphere <input aria-label="Atmosphere" type="range" min="0" max="100" value={haze} onChange={e=>setHaze(+e.target.value)}/></label><label>Grain <input aria-label="Grain" type="range" min="0" max="35" value={grain} onChange={e=>setGrain(+e.target.value)}/></label></div><span className="study-note">HERO STUDY<br/>MOVE TO EXPLORE ↗</span></footer>
 </main>
}
