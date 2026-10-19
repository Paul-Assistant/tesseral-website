'use client'
import { useEffect, useRef, useState } from 'react'
import { MaterialButton } from './ButtonStudies'
import { WaitlistDialog } from '@/components/WaitlistButton'

export function DigitalText({text,delay=0}:{text:string;delay?:number}){
 const [display,setDisplay]=useState(text)
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return
  let frame=0,start=0;const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const tick=(now:number)=>{if(!start)start=now;const progress=(now-start-delay)/1100;setDisplay(Array.from(text).map((c,i)=>c===' '||c==='\n'?c:progress>i/text.length?c:progress+.18>i/text.length?chars[Math.floor(now/65+i*7)%chars.length]:'\u00a0').join(''));if(progress<1)frame=requestAnimationFrame(tick)}
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)
 },[text,delay])
 return <span className="digital-text" aria-label={text}><span aria-hidden="true">{display}</span></span>
}
export function ParticleLogo(){
 const ref=useRef<HTMLCanvasElement>(null)
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!;let frame=0,cancelled=false
  const source=new Image();source.src='/hero-study/figma.svg'
  source.onload=()=>{if(cancelled)return;const sample=document.createElement('canvas');sample.width=62;sample.height=94;const s=sample.getContext('2d')!;s.drawImage(source,0,0,62,94);const data=s.getImageData(0,0,62,94).data;const dots:{x:number;y:number;color:string;seed:number}[]=[]
   for(let y=0;y<94;y+=2)for(let x=0;x<62;x+=2){const i=(y*62+x)*4;if(data[i+3]>128)dots.push({x,y,color:`rgb(${data[i]},${data[i+1]},${data[i+2]})`,seed:Math.random()*6.28})}
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
   const draw=(now:number)=>{ctx.clearRect(0,0,128,128);const t=reduced?0:now*.0007;for(const d of dots){const breath=1+Math.sin(t)*.035;const x=64+(d.x-31)*breath+Math.sin(d.y*.1+t+d.seed)*1.2,y=64+(d.y-47)*breath+Math.cos(d.x*.12+t+d.seed)*1.2;ctx.fillStyle=d.color;ctx.globalAlpha=.7+Math.sin(t+d.seed)*.25;ctx.beginPath();ctx.arc(x,y,.85,0,Math.PI*2);ctx.fill()}if(!reduced)frame=requestAnimationFrame(draw)};frame=requestAnimationFrame(draw)
  };return()=>{cancelled=true;cancelAnimationFrame(frame)}
 },[])
 return <canvas className="tile-particle-logo" ref={ref} width="128" height="128" aria-label="Breathing Figma particle logo" role="img"/>
}
const items=[['Overview','home','globe'],['The problem','problem','nav-2'],['How it works','how-it-works','nav-3'],['Pricing','pricing','nav-4']]
export default function HeroComposition({show}:{show:boolean}){
 const [open,setOpen]=useState(false)
 return <><div className="hero-composition" hidden={!show}>
  <nav className="study-nav" aria-label="Main navigation">{items.map(([label,id,icon])=><MaterialButton key={id} kind="icon" label={label} selected={id==='home'} onSelect={()=>{if(id==='home')window.scrollTo({top:0});else window.location.assign('/#'+id)}}><img src={`/header/${icon}.svg`} width="43" height="43" alt=""/><span className="nav-tooltip">{label}</span></MaterialButton>)}</nav>
  <div className="study-brand"><p><DigitalText text={'YOUR       CREATIVE\nINTELLIGENCE'} delay={100}/></p><img src="/hero-study/wordmark.svg" width="308" height="74" alt="Tesseral"/></div>
  <div className="study-invitation"><p><DigitalText text={'GIVE IT   SOMETHING\nTO THINK ABOUT.'} delay={450}/></p><p><DigitalText text={'DRAG A SAMPLE FILE\n   INTO YOUR   TESSERAL.\nSEE WHAT   CONNECTS.'} delay={750}/></p></div>
  <div className="study-promise"><h1><DigitalText text={'Give your next big idea\na mind to work with.'} delay={350}/></h1><p><DigitalText text={'17 years of agency experience.\nA starting point that’s already informed.'} delay={650}/></p></div>
  <div className="study-cta"><MaterialButton kind="frost" label="Create your Tesseral" selected={false} onSelect={()=>setOpen(true)}><DigitalText text="Create your Tesseral" delay={300}/><span aria-hidden="true">↗</span></MaterialButton></div>
 </div>{open&&<WaitlistDialog source="hero-study" close={()=>setOpen(false)}/>}</>
}
