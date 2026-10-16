'use client'
import {useEffect,useRef} from 'react'
export default function PrismFlare(){
 const ref=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  const el=ref.current!,root=el.closest('main')!,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  if(reduced)return
  let frame=0,started=-10000,lastShot=-10000,travel=0,lastX=0,lastY=0,previousTime=0,segments=0,segmentTravel=0,previousAngle=0
  const move=(event:PointerEvent)=>{
   if(event.pointerType!=='mouse')return
   const now=performance.now(),dx=event.clientX-lastX,dy=event.clientY-lastY,distance=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)
   if(previousTime&&distance>2){
    travel+=distance;segmentTravel+=distance
    const turn=Math.abs(Math.atan2(Math.sin(angle-previousAngle),Math.cos(angle-previousAngle)))
    if(segmentTravel>90||(turn>1.1&&segmentTravel>25)||now-previousTime>180){segments++;segmentTravel=0}
    previousAngle=angle
   }
   lastX=event.clientX;lastY=event.clientY;previousTime=now
   if(now-lastShot<4500||segments<3||travel<260)return
   const r=root.getBoundingClientRect(),planet=root.querySelector(root.dataset.mood==='observatory'?'.retro-orb':'.planet-edge') as HTMLElement|null
   if(!planet)return
   // Fixed positions on the actual rotated ellipse, not the pointer position.
   const parent=planet.offsetParent as HTMLElement|null
   const pr=parent?.getBoundingClientRect()??r,style=getComputedStyle(planet),rotation=parseFloat(style.rotate)||0,a=rotation*Math.PI/180
   const rx=planet.offsetWidth/2,ry=planet.offsetHeight/2,cx=pr.left+planet.offsetLeft+rx,cy=pr.top+planet.offsetTop+ry
   for(const fraction of [.57,.64,.71,.78,.85,.92]){
    const theta=fraction*Math.PI*2,lx=Math.cos(theta)*rx,ly=Math.sin(theta)*ry
    const x=cx+lx*Math.cos(a)-ly*Math.sin(a),y=cy+lx*Math.sin(a)+ly*Math.cos(a)
    if(x<r.left+30||x>r.right-30||y<r.top+90||y>r.bottom-40)continue
    if(Math.hypot(event.clientX-x,event.clientY-y)>95)continue
    el.style.transform=`translate3d(${x-r.left}px,${y-r.top}px,0)`
    started=lastShot=now;segments=0;travel=0;segmentTravel=0;break
   }
  }
  const draw=(now:number)=>{const t=(now-started)/1000;el.style.opacity=String(t>=0&&t<2.2?.85*(1-Math.exp(-t*14))*Math.exp(-t*2.4):0);frame=requestAnimationFrame(draw)}
  root.addEventListener('pointermove',move);frame=requestAnimationFrame(draw)
  return()=>{root.removeEventListener('pointermove',move);cancelAnimationFrame(frame)}
 },[])
 return <div ref={ref} className="prism-flare" aria-hidden="true"><div className="prism-halo"/><div className="prism-streak"/><div className="prism-core"/></div>
}
