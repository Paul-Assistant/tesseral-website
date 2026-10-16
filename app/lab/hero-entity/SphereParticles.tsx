'use client'
import {useEffect,useRef} from 'react'
export default function SphereParticles(){
 const ref=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d');if(!ctx)return
  const root=canvas.closest('main')!,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  let seed=71;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
  const particles=Array.from({length:1100},()=>({angle:Math.PI*(1.02+random()*.85),phase:random(),speed:.025+random()*.025,size:.4+random()*.85,drift:(random()-.5)*18,alpha:.14+random()*.24}))
  let frame=0,last=0,time=0
  const draw=(now:number)=>{
   const dt=Math.min(.05,(now-last)/1000);last=now
   if(!document.hidden){
    if(!reduced)time+=dt
    const r=root.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr)
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,r.width,r.height)
    const planet=root.querySelector(root.dataset.mood==='observatory'?'.retro-orb':'.planet-edge') as HTMLElement|null
    if(planet){
     const parent=planet.offsetParent as HTMLElement|null,pr=parent?.getBoundingClientRect()??r,style=getComputedStyle(planet),a=(parseFloat(style.rotate)||0)*Math.PI/180
     const rx=planet.offsetWidth/2,ry=planet.offsetHeight/2,cx=pr.left-r.left+planet.offsetLeft+rx,cy=pr.top-r.top+planet.offsetTop+ry
     for(const p of particles){
      const life=(p.phase+time*p.speed)%1,out=life*145,lx=Math.cos(p.angle)*(rx+out),ly=Math.sin(p.angle)*(ry+out),x=cx+lx*Math.cos(a)-ly*Math.sin(a)+Math.sin(time*.25+p.phase*20)*p.drift*life,y=cy+lx*Math.sin(a)+ly*Math.cos(a)
      if(x<0||x>r.width||y<0||y>r.height)continue
      ctx.fillStyle=`rgba(220,226,215,${p.alpha*Math.sin(life*Math.PI)})`;ctx.beginPath();ctx.arc(x,y,p.size,0,Math.PI*2);ctx.fill()
     }
    }
   }
   frame=requestAnimationFrame(draw)
  }
  frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame)
 },[])
 return <canvas ref={ref} className="sphere-particles" aria-hidden="true"/>
}
