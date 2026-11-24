'use client'

import { useEffect, useRef, useState } from 'react'
import './machined-controls.css'

export default function MachinedControls({ light }: { light: boolean }) {
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
        const scene = createMachinedScene(host.current, current.current, () => setOn(v => !v), setValue)
        api.current = scene
        cleanup = scene.dispose
      } catch { if (!disposed) setError(true) }
    }, { rootMargin: '160px' })
    observer.observe(host.current!)
    return () => { disposed = true; observer.disconnect(); cleanup?.(); api.current = null }
  }, [])
  return <article className="machined-study" id="machined-controls">
    <div className="material-caption"><span>07 / MACHINED ALUMINIUM</span><h3>A little more tangible.</h3><p>Solid metal. A quiet click. Something to hold.</p></div>
    <div ref={host} className="machined-viewport" aria-hidden="true">{error && <p className="machined-error">The 3D preview needs WebGL. Try refreshing this page.</p>}</div>
    <div className="machined-controls">
      <div><span className="machined-number">01 / TOGGLE</span><button type="button" role="switch" aria-checked={on} onClick={() => setOn(v => !v)} className="machined-power"><i data-on={on}/>{on ? 'Power on' : 'Power off'}</button><p>Flip the lever up or down.</p></div>
      <div><label htmlFor="machined-level" className="machined-number">02 / ROTATE <output>{String(value).padStart(2, '0')}</output></label><input id="machined-level" aria-label="Rotary dial level" type="range" min="0" max="100" value={value} onChange={e => setValue(Number(e.target.value))}/><p>Drag the dial sideways or use the slider.</p></div>
    </div>
  </article>
}
