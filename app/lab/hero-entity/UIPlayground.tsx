'use client'
import ParticleModeSwitch from './ParticleModeSwitch'
import { MaterialButton } from './ButtonStudies'
import './ui-playground.css'

export default function UIPlayground({light}:{light:boolean}) {
 return <section className="ui-material-playground" data-theme={light?'light':'dark'} aria-labelledby="materials-heading">
  <header><span className="material-eyebrow">TESSERAL / MATERIAL STUDIES</span><h2 id="materials-heading">An interface taking shape.</h2><p>Switch modes. Hover close. Press again to send a ripple.</p></header>
  <div className="material-comparisons">
   <article><div className="material-caption"><span>01 / PARTICLE MERCURY</span><p>A raised silver surface in a recessed well.</p></div><ParticleModeSwitch/><ParticleModeSwitch navigation/></article>
   <article><div className="material-caption"><span>02 / PARTICLE GLASS</span><p>A translucent surface, soft reflections, suspended grains.</p></div><ParticleModeSwitch variant="glass"/><ParticleModeSwitch variant="glass" navigation/></article>
   <article className="living-material-study"><div className="material-caption"><span>03 / LIVING MERCURY</span><p>Engraved at rest. Formed from particles when selected.</p></div><ParticleModeSwitch variant="living"/><ParticleModeSwitch variant="living" navigation/></article>
  </div>
  <div className="material-reference"><span className="material-eyebrow">FROSTED FLOW / REFERENCE</span><MaterialButton kind="frost" label="Feel the surface" selected={false} onSelect={()=>{}}>Feel the surface <span aria-hidden="true">↗</span></MaterialButton></div>
 </section>
}
