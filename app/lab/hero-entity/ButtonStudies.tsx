'use client'
import { useRef, useEffect, useState, type ReactNode } from 'react'
import './button-studies.css'

function MaterialButton({kind,children,label,selected,onSelect}:{kind:string;children:ReactNode;label:string;selected:boolean;onSelect:()=>void}){
 const ref=useRef<HTMLButtonElement>(null)
 const lens=useRef<HTMLCanvasElement>(null)
 const outline=useRef<SVGPathElement>(null)
 const tip=useRef<SVGCircleElement>(null)
 const interiorClip=useRef<SVGPathElement>(null)
 useEffect(()=>{
  if(kind!=='edge')return
  const paint=(event:Event)=>{
   const source=(event as CustomEvent<HTMLCanvasElement>).detail,canvas=lens.current,button=ref.current
   if(!canvas||!button)return
   const b=button.getBoundingClientRect(),r=source.getBoundingClientRect(),ctx=canvas.getContext('2d')
   if(!ctx||!r.width)return
   const w=Math.round(b.width*2),h=Math.round(b.height*2)
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
   const zoom=1.9,sx=source.width/r.width,sy=source.height/r.height
   const sw=b.width/zoom,sh=b.height/zoom
   ctx.clearRect(0,0,w,h);ctx.fillStyle='#b9beb7';ctx.fillRect(0,0,w,h)
   ctx.filter='blur(5px) saturate(.4)';ctx.globalAlpha=.9
   ctx.drawImage(source,(b.left+b.width/2-sw/2-r.left)*sx,(b.top+b.height/2-sh/2-r.top)*sy,sw*sx,sh*sy,0,0,w,h)
   ctx.filter='blur(3px) hue-rotate(25deg) saturate(.55)';ctx.globalCompositeOperation='screen';ctx.globalAlpha=.16
   ctx.drawImage(source,(b.left+b.width/2-sw/2-r.left)*sx,(b.top+b.height/2-sh/2-r.top)*sy,sw*sx,sh*sy,5,0,w,h)
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.filter='none'
  }
  window.addEventListener('tesseral-render',paint);return()=>window.removeEventListener('tesseral-render',paint)
 },[kind])
 useEffect(()=>{
  const el=ref.current!,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  let tx=.5,ty=.5,x=.5,y=.5,frame=0,last=0,mx=0,my=0,g=0,px=-9999,py=-9999
  const move=(e:PointerEvent)=>{const b=el.getBoundingClientRect();tx=(e.clientX-b.left)/b.width;ty=(e.clientY-b.top)/b.height}
  const leave=()=>{tx=ty=.5}
  const nearby=(e:PointerEvent)=>{if(e.pointerType==='mouse'){px=e.clientX;py=e.clientY}}
  const away=()=>{px=py=-9999}
  if(kind==='icon'){window.addEventListener('pointermove',nearby);document.documentElement.addEventListener('pointerleave',away)}
  const draw=(now:number)=>{const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden){const ease=reduced?1:1-Math.exp(-dt*5);if(kind==='icon'){const b=el.getBoundingClientRect(),dx=px-(b.left+b.width/2),dy=py-(b.top+b.height/2),distance=Math.hypot(dx,dy),strength=reduced||el.matches(':hover')?0:Math.pow(Math.max(0,1-distance/150),2)*Math.min(1,Math.max(0,(distance-b.width/2)/14));mx+=(dx*strength*.65-mx)*ease;my+=(dy*strength*.65-my)*ease;g+=(strength-g)*ease;const angle=Math.atan2(my,mx),pull=Math.min(17,Math.hypot(mx,my)*1.6),points=Array.from({length:64},(_,i)=>{const a=i/64*Math.PI*2,lobe=Math.pow(Math.max(0,Math.cos(a-angle)),6),radius=31+pull*lobe;return `${50+Math.cos(a)*radius},${50+Math.sin(a)*radius}`});outline.current?.setAttribute('d','M'+points.join(' L')+' Z');interiorClip.current?.setAttribute('d','M'+points.join(' L')+' Z');tip.current?.setAttribute('cx',`${50+Math.cos(angle)*(31+pull)}`);tip.current?.setAttribute('cy',`${50+Math.sin(angle)*(31+pull)}`);el.style.setProperty('--proximity',`${g}`);el.style.setProperty('--magnet-angle',`${Math.atan2(dy,dx)}rad`)}x+=(tx-x)*ease;y+=(ty-y)*ease;el.style.setProperty('--light-x',`${x*100}%`);el.style.setProperty('--light-y',`${y*100}%`);el.style.setProperty('--tilt-x',`${reduced?0:(.5-y)*6}deg`);el.style.setProperty('--tilt-y',`${reduced?0:(x-.5)*7}deg`)}frame=requestAnimationFrame(draw)}
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);frame=requestAnimationFrame(draw)
  return()=>{cancelAnimationFrame(frame);el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);window.removeEventListener('pointermove',nearby);document.documentElement.removeEventListener('pointerleave',away)}
 },[kind])
 return <button ref={ref} type="button" className={`material-button material-${kind}`} aria-label={label} aria-pressed={selected} onClick={onSelect}>{kind==='icon'&&<svg className="organic-shell" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="organic-fill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f1f3f1" stopOpacity=".93"/><stop offset="1" stopColor="#cfd3d6" stopOpacity=".83"/></linearGradient><radialGradient id="organic-cloud"><stop stopColor="#9aaeba" stopOpacity=".9"/><stop offset=".6" stopColor="#c6ff1b" stopOpacity=".35"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></radialGradient><clipPath id="organic-clip"><path ref={interiorClip} d="M81 50 A31 31 0 1 1 19 50 A31 31 0 1 1 81 50"/></clipPath><linearGradient id="organic-rim" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset=".4" stopColor="#859ca8"/><stop offset=".7" stopColor="#fff"/><stop offset="1" stopColor="#d3c9f6"/></linearGradient></defs><path className="organic-body" ref={outline} d="M81 50 A31 31 0 1 1 19 50 A31 31 0 1 1 81 50" fill="#aebbc044" stroke="url(#organic-rim)" strokeWidth="2" strokeLinejoin="round"/><g className="organic-interior" clipPath="url(#organic-clip)"><g className="organic-current"><ellipse cx="42" cy="40" rx="40" ry="28" fill="url(#organic-cloud)"/><ellipse cx="75" cy="72" rx="30" ry="24" fill="url(#organic-cloud)"/></g></g><circle ref={tip} className="organic-tip" cx="81" cy="50" r="5" fill="#e5e1ff"/></svg>}{kind==='edge'&&<canvas ref={lens} className="glass-lens" aria-hidden="true"/>}<span className="material-backdrop" aria-hidden="true"/><span className="material-cloud" aria-hidden="true"/><span className="material-rim" aria-hidden="true"/><span className="material-reflection" aria-hidden="true"/><span className="material-label">{children}</span></button>
}
export default function ButtonStudies(){
 const [selected,setSelected]=useState('')
 return <aside className="button-studies" aria-label="Interactive button material studies"><div className="button-study"><span className="button-study-name">01 / FROSTED FLOW</span><MaterialButton kind="frost" label="Try frosted glass button" selected={selected==='frost'} onSelect={()=>setSelected(selected==='frost'?'':'frost')}>Create your Tesseral <span aria-hidden="true">↗</span></MaterialButton></div><div className="button-study"><span className="button-study-name">02 / LIVING EDGE</span><MaterialButton kind="edge" label="Try reflective edge button" selected={selected==='edge'} onSelect={()=>setSelected(selected==='edge'?'':'edge')}>Create your Tesseral <span aria-hidden="true">↗</span></MaterialButton></div><div className="button-study button-study-small"><span className="button-study-name">03 / ICON</span><MaterialButton kind="icon" label="Try reflective arrow button" selected={selected==='icon'} onSelect={()=>setSelected(selected==='icon'?'':'icon')}><svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></MaterialButton></div><p className="button-study-feedback" role="status">{selected?`${selected==='frost'?'Frosted flow':selected==='edge'?'Living edge':'Reflective icon'} selected · click again to release`:'Hover to explore the light · click to feel the pressed state'}</p></aside>
}
