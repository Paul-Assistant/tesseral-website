'use client'

import { useEffect, useRef, useState } from 'react'
import './machined-controls.css'
import ParticleModeSwitch from './ParticleModeSwitch'

export default function MachinedControls({ light, unified = false }: { light: boolean; unified?: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ update: (on: boolean, value: number, light: boolean) => void } | null>(null)
  const [on, setOn] = useState(false)
  const [value, setValue] = useState(42)
  const [error, setError] = useState(false)
  const current = useRef({ on, value, light })
  current.current = { on, value, light }
  useEffect(() => { api.current?.update(on, value, light) }, [on, value, light])
  useEffect(() => {
    let disposed = false, cleanup: (() => void) | undefined
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      try {
        const { createMachinedScene } = await import('./machined-scene')
        if (disposed || !host.current) return
        const scene = createMachinedScene(host.current, current.current, () => setOn(v => !v), setValue, unified)
        api.current = scene
        cleanup = scene.dispose
      } catch { if (!disposed) setError(true) }
    }, { rootMargin: '160px' })
    observer.observe(host.current!)
    return () => { disposed = true; observer.disconnect(); cleanup?.(); api.current = null }
  }, [unified])
  return <article className={unified ? "machined-study unified-study" : "machined-study"} data-theme={unified ? "light" : undefined} id={unified ? "unified-controls" : "machined-controls"}>
    <div className="material-caption"><span>{unified ? "08 / ONE SURFACE" : "07 / MACHINED ALUMINIUM"}</span><h3>{unified ? "Matter. In every form." : "A little more tangible."}</h3><p>Solid metal. A quiet click. Something to hold.</p></div>
    <div className="machined-stage">{unified && <div className="unified-metal-seats" aria-hidden="true"><span/><span/></div>}<div ref={host} className="machined-viewport" aria-hidden="true">{error && <p className="machined-error">The 3D preview needs WebGL. Try refreshing this page.</p>}</div>{unified && <div className="unified-particles"><ParticleModeSwitch variant="living" surface="individual" particleLabels aluminium/></div>}</div>
    <div className="machined-controls">
      <div><span className="machined-number">01 / TOGGLE</span><button type="button" role="switch" aria-checked={on} onClick={() => setOn(v => !v)} className="machined-power"><i data-on={on}/>{on ? 'Power on' : 'Power off'}</button><p>Flip the lever up or down.</p></div>
      <div><label htmlFor={unified ? "unified-level" : "machined-level"} className="machined-number">02 / ROTATE <output>{String(value).padStart(2, '0')}</output></label><input id={unified ? "unified-level" : "machined-level"} aria-label="Rotary dial level" type="range" min="0" max="100" value={value} onChange={e => setValue(Number(e.target.value))}/><p>Drag the dial sideways or use the slider.</p></div>
    </div>
  </article>
}
