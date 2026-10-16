'use client'
import { useEffect, useRef } from 'react'

export default function CosmicDust(){
 const canvas=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
  const el=canvas.current!,ctx=el.getContext('2d');if(!ctx)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  let width=0,height=0,frame=0,last=0,time=0,x=0,y=0,tx=0,ty=0
  let seed=3947;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  const particles=Array.from({length:4200},()=>({x:random(),y:random(),depth:.2+random()*.8,phase:random()*6.283,size:.3+random()*.75,alpha:.1+random()*.28}))
  const resize=()=>{width=el.clientWidth;height=el.clientHeight;const dpr=Math.min(devicePixelRatio,1.5);el.width=width*dpr;el.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  const observer=new ResizeObserver(resize);observer.observe(el);resize()
  const parent=el.parentElement!
  const move=(e:PointerEvent)=>{if(e.pointerType==='touch')return;const r=el.getBoundingClientRect();tx=(e.clientX-r.left)/width-.5;ty=(e.clientY-r.top)/height-.5}
  const leave=()=>{tx=ty=0};parent.addEventListener('pointermove',move);parent.addEventListener('pointerleave',leave)
  const draw=(now:number)=>{
   const dt=Math.min((now-last)/1000,.05);last=now
   if(!document.hidden){
    if(!reduced){time+=dt;x+=(tx-x)*(1-Math.exp(-dt*1.4));y+=(ty-y)*(1-Math.exp(-dt*1.4))}
    ctx.clearRect(0,0,width,height)
    for(const p of particles){
     const flowX=Math.sin(time*.045+p.phase+p.y*5)*20,flowY=Math.cos(time*.035+p.phase+p.x*4)*14
     const px=((p.x*width+flowX*p.depth+x*95*p.depth)%width+width)%width
     const py=((p.y*height+flowY*p.depth+y*65*p.depth)%height+height)%height
     const dist=Math.hypot(px/width-(x+.5),py/height-(y+.5))
     const light=1+Math.max(0,1-dist*3)*.6
     ctx.fillStyle=`rgba(${p.depth>.8?'198,255,135':'205,213,208'},${p.alpha*light*(.8+.2*Math.sin(time*.12+p.phase))})`
     ctx.fillRect(px,py,p.size,p.size)
    }
   }
   frame=requestAnimationFrame(draw)
  };frame=requestAnimationFrame(draw)
  return()=>{cancelAnimationFrame(frame);observer.disconnect();parent.removeEventListener('pointermove',move);parent.removeEventListener('pointerleave',leave)}
 },[])
 return <canvas ref={canvas} className="cosmic-dust" aria-hidden="true"/>
}
