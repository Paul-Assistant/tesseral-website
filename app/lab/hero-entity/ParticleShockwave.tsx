'use client'
import { useEffect, useRef, type RefObject } from 'react'
import type { EntityInteraction } from './ParticleBloom'

export default function ParticleShockwave({ interaction }: { interaction:RefObject<EntityInteraction> }) {
 const canvas=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
  const el=canvas.current!,ctx=el.getContext('2d');if(!ctx)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  let width=0,height=0,frame=0,start=-10000,lastMorph=interaction.current.morph
  let seed=731;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  const points=Array.from({length:6500},()=>({angle:random()*Math.PI*2,spread:random(),speed:random(),size:.35+random()*1.1,alpha:.15+random()*.7,wisp:random()}))
  const resize=()=>{width=el.clientWidth;height=el.clientHeight;const dpr=Math.min(devicePixelRatio,1.5);el.width=width*dpr;el.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  const observer=new ResizeObserver(resize);observer.observe(el);resize()
  const draw=(now:number)=>{
   if(interaction.current.morph!==lastMorph){lastMorph=interaction.current.morph;start=now}
   const age=(now-start)/1000;ctx.clearRect(0,0,width,height)
   if(age>=0&&age<4.5&&!document.hidden){
    const cx=width*(width<650?.5:.53),cy=height*(width<650?.43:.48),max=Math.max(width,height)*.8
    const waveTime=Math.max(0,age-.22),progress=1-Math.exp(-waveTime*1.6),fade=Math.exp(-waveTime*.85)*Math.min(1,waveTime*12)
    ctx.globalCompositeOperation='lighter'
    for(const p of points){
     const core=p.wisp<.32
     const radius=core?(16+age*110*p.speed)*(1+p.spread):max*progress+(p.spread-.5)*(18+progress*95)
     const curl=Math.sin(p.angle*7+age*1.2+p.speed*5)*progress*15
     const a=p.angle+Math.sin(age+p.spread*6)*.035
     const alpha=core?Math.exp(-age*4)*p.alpha:fade*p.alpha*.6
     if(alpha<.008)continue
     ctx.fillStyle=`rgba(${core?'243,255,211':p.speed>.7?'238,242,230':'192,240,111'},${alpha*(reduced?.15:1)})`
     const r=reduced?radius*.15:radius
     ctx.fillRect(cx+Math.cos(a)*(r+curl),cy+Math.sin(a)*(r+curl)*.84,p.size,p.size)
    }
    ctx.globalCompositeOperation='source-over'
   }
   frame=requestAnimationFrame(draw)
  };frame=requestAnimationFrame(draw)
  return()=>{cancelAnimationFrame(frame);observer.disconnect()}
 },[interaction])
 return <canvas ref={canvas} className="particle-shockwave" aria-hidden="true"/>
}
