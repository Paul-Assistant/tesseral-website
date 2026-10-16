'use client'
import {useEffect,useRef} from 'react'
export default function PrismFlare(){
 const ref=useRef<SVGSVGElement>(null)
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
   if(now-lastShot<7000||segments<3||travel<260)return
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
    el.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`)
    const span=Math.min(.32,330/rx),points=Array.from({length:65},(_,i)=>{const t=theta-span+2*span*i/64,px=Math.cos(t)*rx,py=Math.sin(t)*ry;return `${cx+px*Math.cos(a)-py*Math.sin(a)-r.left},${cy+px*Math.sin(a)+py*Math.cos(a)-r.top}`})
    el.querySelectorAll('path').forEach(path=>path.setAttribute('d','M'+points.join(' L')))
    const ends=[points[0].split(','),points[64].split(',')],gradient=el.querySelector('linearGradient')!
    gradient.setAttribute('x1',ends[0][0]);gradient.setAttribute('y1',ends[0][1]);gradient.setAttribute('x2',ends[1][0]);gradient.setAttribute('y2',ends[1][1])
    started=lastShot=now;segments=0;travel=0;segmentTravel=0;break
   }
  }
  const draw=(now:number)=>{const t=(now-started)/1000,smooth=(v:number)=>v*v*(3-2*v);const glow=t<0?0:t<2?smooth(t/2):t<3?1:t<5.5?1-smooth((t-3)/2.5):0;el.style.opacity=String(.85*glow);frame=requestAnimationFrame(draw)}
  root.addEventListener('pointermove',move);frame=requestAnimationFrame(draw)
  return()=>{root.removeEventListener('pointermove',move);cancelAnimationFrame(frame)}
 },[])
 return <svg ref={ref} className="rim-prism" aria-hidden="true"><defs><linearGradient id="rim-prism-colour" gradientUnits="userSpaceOnUse"><stop stopColor="#b6b4db" stopOpacity="0"/><stop offset=".22" stopColor="#c5c8dc" stopOpacity=".3"/><stop offset=".43" stopColor="#e9eac3" stopOpacity=".8"/><stop offset=".5" stopColor="#fffdeb"/><stop offset=".6" stopColor="#e1efb8" stopOpacity=".8"/><stop offset=".8" stopColor="#d0c4df" stopOpacity=".25"/><stop offset="1" stopColor="#d0c4df" stopOpacity="0"/></linearGradient></defs><path className="rim-prism-halo"/><path className="rim-prism-light"/><path className="rim-prism-core"/></svg>
}
