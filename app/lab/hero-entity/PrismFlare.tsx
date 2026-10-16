'use client'
import {useEffect,useRef} from 'react'
export default function PrismFlare(){
 const ref=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  const el=ref.current!,root=el.closest('main')!,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  if(reduced)return
  let frame=0,last=0,energy=0,shown=0,x=innerWidth*.7,y=innerHeight*.4,tx=x,ty=y,previousX=0,previousY=0,previousTime=0
  const move=(event:PointerEvent)=>{
   if(event.pointerType!=='mouse')return
   const now=performance.now(),r=root.getBoundingClientRect(),planet=root.querySelector(root.dataset.mood==='observatory'?'.retro-orb':'.planet-edge')?.getBoundingClientRect()
   if(!planet)return
   const speed=previousTime?Math.hypot(event.clientX-previousX,event.clientY-previousY)/Math.max(16,now-previousTime):0
   previousX=event.clientX;previousY=event.clientY;previousTime=now
   const cx=planet.left+planet.width/2,cy=planet.top+planet.height/2,rx=planet.width/2,ry=planet.height/2,nx=Math.max(-.94,Math.min(.94,(event.clientX-cx)/rx))
   tx=cx+nx*rx-r.left;ty=cy-ry*Math.sqrt(1-nx*nx)-r.top
   const proximity=Math.exp(-Math.abs(event.clientY-r.top-ty)/240)
   energy=Math.min(.85,energy+Math.min(.2,speed*.07)*proximity)
  }
  const draw=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;energy*=Math.exp(-dt*2.2);shown+=(energy-shown)*(1-Math.exp(-dt*7));x+=(tx-x)*(1-Math.exp(-dt*4));y+=(ty-y)*(1-Math.exp(-dt*4));el.style.transform=`translate3d(${x}px,${y}px,0)`;el.style.opacity=String(shown);frame=requestAnimationFrame(draw)}
  root.addEventListener('pointermove',move);frame=requestAnimationFrame(draw)
  return()=>{root.removeEventListener('pointermove',move);cancelAnimationFrame(frame)}
 },[])
 return <div ref={ref} className="prism-flare" aria-hidden="true"><div className="prism-halo"/><div className="prism-streak"/><div className="prism-core"/></div>
}
