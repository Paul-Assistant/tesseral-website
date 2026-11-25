'use client'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import type { AluminiumController, AluminiumGeometry } from './aluminium-interaction'
import './rendered-aluminium.css'

export default function RenderedAluminiumStudy() {
 const [on,setOn]=useState(true),[value,setValue]=useState(50),[mode,setMode]=useState(0)
 const [geometry,setGeometry]=useState<AluminiumGeometry|null>(null),[ready,setReady]=useState(false),[error,setError]=useState(false)
 const canvas=useRef<HTMLCanvasElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<AluminiumController|null>(null)
 const desired=useRef({value:50,on:true,mode:0})
 const drag=useRef<{x:number;value:number;pointer:number}|null>(null)
 useEffect(()=>{
  let disposed=false,started=false
  const observer=new IntersectionObserver(async([entry])=>{
   if(!entry.isIntersecting||started)return;started=true
   try{
    const [module,response]=await Promise.all([import('./aluminium-interaction'),fetch('/lab/aluminium-render/interactive/geometry.json')])
    if(!response.ok)throw new Error('Material geometry unavailable')
    const data=await response.json() as AluminiumGeometry
    if(disposed)return;setGeometry(data)
    const control=await module.createAluminiumInteraction(canvas.current!,data)
    if(disposed){control.dispose();return}engine.current=control;control.value(desired.current.value);control.power(desired.current.on);if(desired.current.mode!==0)control.mode(desired.current.mode);setReady(true)
   }catch{if(!disposed)setError(true)}
  },{rootMargin:'400px'})
  observer.observe(root.current!)
  return()=>{disposed=true;observer.disconnect();engine.current?.dispose();engine.current=null}
 },[])
 function changeValue(next:number){const v=Math.max(0,Math.min(100,Math.round(next)));desired.current.value=v;setValue(v);engine.current?.value(v)}
 function key(e:KeyboardEvent<HTMLDivElement>){
  if(!ready)return
  const n=e.key==='Home'?0:e.key==='End'?100:['ArrowRight','ArrowUp'].includes(e.key)?value+(e.shiftKey?10:1):['ArrowLeft','ArrowDown'].includes(e.key)?value-(e.shiftKey?10:1):e.key==='PageUp'?value+10:e.key==='PageDown'?value-10:null
  if(n!==null){e.preventDefault();changeValue(n)}
 }
 function down(e:PointerEvent<HTMLDivElement>){if(!ready||e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,value,pointer:e.pointerId};e.currentTarget.focus()}
 function move(e:PointerEvent<HTMLDivElement>){if(drag.current?.pointer!==e.pointerId)return;const w=e.currentTarget.getBoundingClientRect().width;changeValue(drag.current.value+(e.clientX-drag.current.x)/Math.max(90,w)*100)}
 function stop(e:PointerEvent<HTMLDivElement>){if(drag.current?.pointer===e.pointerId){drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}}
 function place(index:number):CSSProperties{
  if(!geometry)return {}
  return {left:`${geometry.centers[index][0]/geometry.width*100}%`,top:`${geometry.centers[index][1]/geometry.height*100}%`,width:`${1.3/7.2*100}%`,height:`${1.3/7.2*geometry.width/geometry.height*100}%`}
 }
 return <article className="rendered-aluminium-study" id="rendered-aluminium">
  <header className="material-caption"><span>11 / LIVING ALUMINIUM</span><p>Turn. Speak. Type. Switch.</p></header>
  <div className="aluminium-render-frame" ref={root} onPointerMove={e=>{if(e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();engine.current?.pointer((e.clientX-r.left)*1400/r.width,(e.clientY-r.top)*640/r.height)}} onPointerLeave={()=>engine.current?.pointer(-10000,-10000)}>
   <img className="aluminium-poster" src="/lab/aluminium-render/interactive/base.webp" width="1400" height="640" loading="lazy" alt="Brushed aluminium knob, Voice and Type seats, and power switch"/>
   <canvas ref={canvas} aria-hidden="true" style={{opacity:ready?1:0}}/>
   {geometry&&<>
    <div className="aluminium-hit aluminium-dial" style={place(0)} role="slider" aria-label="Level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={`${value} percent`} aria-disabled={!ready} tabIndex={0} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={()=>{drag.current=null}}/>
    {['Voice','Type'].map((label,i)=><button className="aluminium-hit aluminium-mode" key={label} style={place(i+1)} type="button" aria-label={label} aria-pressed={mode===i} disabled={!ready} onClick={()=>{desired.current.mode=i;setMode(i);engine.current?.mode(i)}}/>)}
    <button className="aluminium-hit aluminium-power" style={place(3)} type="button" role="switch" aria-label="Power" aria-checked={on} disabled={!ready} onClick={()=>{const next=!on;desired.current.on=next;setOn(next);engine.current?.power(next)}}/>
   </>}
  </div>
  <div className="aluminium-status" aria-live="polite"><span>Level <output>{value}%</output></span><span>{mode===0?'Voice':'Type'}</span><span>Power {on?'on':'off'}</span></div>
  <p className="rendered-study-note">{error?'The interactive materials could not load. Refresh to try again.':ready?'Drag the knob. Select a mode. Press it again to send a wave.':'Loading the aluminium controls…'}</p>
 </article>
}
