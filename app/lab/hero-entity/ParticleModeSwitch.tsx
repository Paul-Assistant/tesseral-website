'use client'

import { useEffect, useRef, useState } from 'react'
import './particle-mode-switch.css'

const clamp = (n: number) => Math.max(0, Math.min(1, n))
const ease = (n: number) => n * n * (3 - 2 * n)

/** A small, independent particle surface: no additional WebGL context. */
export default function ParticleModeSwitch() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState(0)
  const motion = useRef({ from: 0, to: 0, start: -10000, ripple: -10000, x: -1000, y: -1000 })

  function choose(next: number) {
    const m = motion.current
    if (next === m.to) { m.ripple = performance.now(); return }
    // Finish the current gesture before beginning another; never teleport particles.
    if (performance.now() - m.start < 1450) return
    m.from = m.to; m.to = next; m.start = performance.now()
    setMode(next)
  }

  useEffect(() => {
    const canvas = canvasRef.current!, root = rootRef.current!
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const mobile = matchMedia('(pointer: coarse)').matches
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(devicePixelRatio, mobile ? 1.5 : 2)
    canvas.width = 300 * dpr; canvas.height = 144 * dpr
    ctx.scale(dpr, dpr)
    const count = mobile ? 2600 : 6500
    // Uniform surface samples retain their identity throughout a transfer.
    const dots = Array.from({ length: count }, (_, i) => {
      const r = Math.sqrt((i + .5) / count), a = i * 2.3999632297
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, r, a, delay: (Math.sin(i * 12.9898) * 43758.5453) % 1 }
    })
    const colors = Array.from({ length: 128 }, (_, i) => `rgb(${Math.round(40+i*1.68)},${Math.round(44+i*1.65)},${Math.round(45+i*1.60)})`)
    let frame = 0, last = 0, visible = true, hover = 0
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    observer.observe(root)
    function draw(now: number) {
      frame = requestAnimationFrame(draw)
      if (!ctx || !visible || document.hidden || now-last < (mobile ? 33 : 22)) return
      last = now
      const m = motion.current, progress = reduced ? 1 : clamp((now-m.start)/1450)
      const rippleAge = (now-m.ripple)/1600
      const ripple = reduced || rippleAge > 1 ? 0 : Math.sin(rippleAge*Math.PI)*Math.exp(-rippleAge*1.4)
      const center = 94 + m.to*112
      const distance = Math.hypot(m.x-center,m.y-68)
      const targetHover = !reduced && distance > 40 ? clamp(1-(distance-40)/90) : 0
      hover += (targetHover-hover)*.09
      const angle = Math.atan2(m.y-68,m.x-center)
      ctx.clearRect(0,0,300,144)
      for (const d of dots) {
        const delay = Math.abs(d.delay)*.42
        const p = ease(clamp((progress-delay)/.58))
        const flowing = Math.sin(p*Math.PI)
        const cx = 94 + (m.from+(m.to-m.from)*p)*112
        const z = Math.sqrt(1-d.r*d.r)
        const breathing = reduced ? 0 : Math.sin(now*.0008+d.a*.3)*.6
        const lobe = Math.pow(Math.max(0,Math.cos(d.a-angle)),10)*hover*13*Math.pow(d.r,3)
        const wave = Math.sin(d.r*12-rippleAge*13)*ripple*5
        const radius = 39+breathing+lobe+wave
        let x = cx+d.x*radius*(1-flowing*.35)
        let y = 68+d.y*radius*(1-flowing*.58)+Math.sin(p*Math.PI*2+d.a)*flowing*10
        // Only the outer grains loosen into shallow-depth motes near the pointer.
        const loose = Math.pow(d.r,12)*hover
        x += Math.cos(d.a)*loose*(4+Math.sin(now*.002+d.a)*3)
        y += Math.sin(d.a)*loose*7
        const light = clamp(.38+z*.34-d.y*.18+Math.pow(Math.max(0,-d.x*.38-d.y*.62+z*.6),18)*.65)
        const reflection = Math.exp(-Math.pow((d.y+.43+d.x*.18)/.11,2))*.35
        const rim = Math.pow(d.r,18)*(.25+Math.max(0,-d.x-d.y)*.38)
        const tone = Math.floor(clamp(light+reflection+rim)*127)
        ctx.fillStyle = colors[tone]
        ctx.globalAlpha = .64 + z*.3 - loose*.22
        const size = (mobile ? 1.15 : .8) + loose*.7
        ctx.fillRect(x,y,size,size)
        // Sparse lime/silver diffraction, rather than a cyan coating.
        if (d.r>.84 && d.r<.92 && Math.sin(d.a*2+now*.00025)>.92) {
          ctx.fillStyle = 'rgba(198,255,27,.42)'; ctx.fillRect(x,y,size,size)
        }
      }
      ctx.globalAlpha = 1
    }
    frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); observer.disconnect() }
  }, [])

  return <div ref={rootRef} className="particle-mode" data-mode={mode}
    onPointerMove={e => { if(e.pointerType==='touch') return; const r=e.currentTarget.getBoundingClientRect(); motion.current.x=(e.clientX-r.left)*300/r.width; motion.current.y=(e.clientY-r.top)*144/r.height }}
    onPointerLeave={() => { motion.current.x=-1000; motion.current.y=-1000 }}>
    <div className="particle-mode-well" aria-hidden="true" />
    <canvas ref={canvasRef} aria-hidden="true" />
    <div className="particle-mode-options" role="group" aria-label="Interaction mode preview">
      <button type="button" aria-pressed={mode===0} onClick={()=>choose(0)} aria-label="Voice mode">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3m-4 0h8"/></svg><span>Voice</span>
      </button>
      <button type="button" aria-pressed={mode===1} onClick={()=>choose(1)} aria-label="Type mode">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M6 9h2m3 0h2m3 0h2M6 12h2m3 0h2m3 0h2M7 16h10"/></svg><span>Type</span>
      </button>
    </div>
  </div>
}
