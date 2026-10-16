'use client'
import {useEffect,useRef} from 'react'
export default function PhotographicSky(){
 const ref=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d');if(!ctx)return
  const paint=()=>{
   const w=canvas.width=Math.min(3200,window.innerWidth*1.8),h=canvas.height=Math.min(2200,window.innerHeight*1.8)
   let seed=1851;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
   ctx.clearRect(0,0,w,h)
   // Soft, overlapping exposures create uneven photographic density.
   for(let i=0;i<40;i++){const x=random()*w,y=random()*h,r=(.1+random()*.4)*w,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(210,213,209,${.012+random()*.018})`);g.addColorStop(1,'rgba(210,213,209,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
   for(let i=0;i<1900;i++){
    const x=random()*w,y=random()*h,size=.5+Math.pow(random(),6)*3,a=.22+random()*.58
    ctx.save();ctx.translate(x,y);ctx.rotate(random()*Math.PI);ctx.fillStyle=`rgba(231,231,225,${a})`;ctx.shadowColor='#e4e5de';ctx.shadowBlur=size>1?3:0
    ctx.fillRect(-size/2,-size/3,size*(.7+random()),size*.55);ctx.restore()
   }
   // Scanned film grain is static: it does not sparkle like digital noise.
   const grain=ctx.getImageData(0,0,w,h)
   for(let i=0;i<grain.data.length;i+=4){const v=random();if(v>.7 && grain.data[i+3]<45){const light=v>.82;grain.data[i]=grain.data[i+1]=grain.data[i+2]=light?218:15;grain.data[i+3]=Math.max(grain.data[i+3],Math.round(random()*(light?12:16)))}}
   ctx.putImageData(grain,0,0)
  }
  paint();window.addEventListener('resize',paint);return()=>window.removeEventListener('resize',paint)
 },[])
 return <canvas ref={ref} className="photographic-sky" aria-hidden="true"/>
}
