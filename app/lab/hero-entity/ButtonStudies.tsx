'use client'
import { useRef, useEffect, useState, type ReactNode } from 'react'
import './button-studies.css'

function MaterialButton({kind,children,label,selected,onSelect}:{kind:string;children:ReactNode;label:string;selected:boolean;onSelect:()=>void}){
 const ref=useRef<HTMLButtonElement>(null)
 useEffect(()=>{
  const el=ref.current!,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  let tx=.5,ty=.5,x=.5,y=.5,frame=0,last=0
  const move=(e:PointerEvent)=>{const b=el.getBoundingClientRect();tx=(e.clientX-b.left)/b.width;ty=(e.clientY-b.top)/b.height}
  const leave=()=>{tx=ty=.5}
  const draw=(now:number)=>{const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden){const ease=reduced?1:1-Math.exp(-dt*5);x+=(tx-x)*ease;y+=(ty-y)*ease;el.style.setProperty('--light-x',`${x*100}%`);el.style.setProperty('--light-y',`${y*100}%`);el.style.setProperty('--tilt-x',`${reduced?0:(.5-y)*6}deg`);el.style.setProperty('--tilt-y',`${reduced?0:(x-.5)*7}deg`)}frame=requestAnimationFrame(draw)}
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);frame=requestAnimationFrame(draw)
  return()=>{cancelAnimationFrame(frame);el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave)}
 },[])
 return <button ref={ref} type="button" className={`material-button material-${kind}`} aria-label={label} aria-pressed={selected} onClick={onSelect}><span className="material-backdrop" aria-hidden="true"/><span className="material-cloud" aria-hidden="true"/><span className="material-rim" aria-hidden="true"/><span className="material-reflection" aria-hidden="true"/><span className="material-label">{children}</span></button>
}
export default function ButtonStudies(){
 const [selected,setSelected]=useState('')
 return <aside className="button-studies" aria-label="Interactive button material studies"><svg width="0" height="0" aria-hidden="true" style={{position:'absolute'}}><defs><filter id="button-dispersion" x="-20%" y="-40%" width="140%" height="180%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".013 .025" numOctaves="2" seed="8" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" result="refracted"/><feColorMatrix in="refracted" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/><feOffset in="red" dx="1.4" result="redShift"/><feColorMatrix in="refracted" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan"/><feOffset in="cyan" dx="-1.4" result="cyanShift"/><feBlend in="redShift" in2="cyanShift" mode="screen"/></filter></defs></svg><div className="button-study"><span className="button-study-name">01 / FROSTED FLOW</span><MaterialButton kind="frost" label="Try frosted glass button" selected={selected==='frost'} onSelect={()=>setSelected(selected==='frost'?'':'frost')}>Create your Tesseral <span aria-hidden="true">↗</span></MaterialButton></div><div className="button-study"><span className="button-study-name">02 / LIVING EDGE</span><MaterialButton kind="edge" label="Try reflective edge button" selected={selected==='edge'} onSelect={()=>setSelected(selected==='edge'?'':'edge')}>Create your Tesseral <span aria-hidden="true">↗</span></MaterialButton></div><div className="button-study button-study-small"><span className="button-study-name">03 / ICON</span><MaterialButton kind="icon" label="Try reflective arrow button" selected={selected==='icon'} onSelect={()=>setSelected(selected==='icon'?'':'icon')}><svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></MaterialButton></div><p className="button-study-feedback" role="status">{selected?`${selected==='frost'?'Frosted flow':selected==='edge'?'Living edge':'Reflective icon'} selected · click again to release`:'Hover to explore the light · click to feel the pressed state'}</p></aside>
}
