'use client'
import { useState } from 'react'
import './rendered-aluminium.css'

/** Offline Cycles benchmark, deliberately separate from the real-time control studies. */
export default function RenderedAluminiumStudy() {
 const [on,setOn]=useState(true)
 return <article className="rendered-aluminium-study" id="rendered-aluminium">
  <header className="material-caption"><span>11 / PATH-TRACED ALUMINIUM</span><p>A rendered material reference. Same metal, same lights, physical contact shadows.</p></header>
  <div className="aluminium-render-frame">
   {/* Both frames stay decoded so switching poses does not flash an empty image. */}
   {(['on','off'] as const).map(state=><img key={state} src={`/lab/aluminium-render/${state}.webp`} width="1400" height="850" loading="lazy" alt={state===(on?'on':'off')?`Brushed aluminium knob and switch in the ${state} position`:''} aria-hidden={state!==(on?'on':'off')} style={{opacity:state===(on?'on':'off')?1:0}}/>)}
  </div>
  <button type="button" role="switch" aria-checked={on} onClick={()=>setOn(v=>!v)}>Switch {on?'on':'off'} <span aria-hidden="true">↔</span></button>
  <p className="rendered-study-note">Two rendered poses for comparing the material and lighting. The interactive studies remain above.</p>
 </article>
}
