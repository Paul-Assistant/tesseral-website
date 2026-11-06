'use client'

import { useEffect, useRef, useState } from 'react'
import './particle-mode-switch.css'

const clamp = (n: number) => Math.max(0, Math.min(1, n))
const ease = (n: number) => n * n * (3 - 2 * n)

/** A small, independent particle surface: no additional WebGL context. */
export default function ParticleModeSwitch({ variant = 'mercury', navigation = false }: { variant?: 'mercury' | 'glass'; navigation?: boolean }) {
  const width = navigation ? 524 : 300
  const labels = navigation ? ['Overview', 'The problem', 'How it works', 'Pricing'] : ['Voice', 'Type']
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
    canvas.width = width * dpr; canvas.height = 144 * dpr
    ctx.scale(dpr, dpr)
    const count = variant === 'glass' ? (mobile ? 1400 : 3000) : (mobile ? 2600 : 6500)
    // Uniform surface samples retain their identity throughout a transfer.
    const dots = Array.from({ length: count }, (_, i) => {
      const random = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v) }
      const r = Math.sqrt(random(i + 1)), a = random(i + 9001) * Math.PI * 2
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, r, a, delay: (Math.sin(i * 12.9898) * 43758.5453) % 1 }
    })
    const colors = Array.from({ length: 128 }, (_, i) => `rgb(${Math.round(40+i*1.68)},${Math.round(44+i*1.65)},${Math.round(45+i*1.60)})`)
    let frame = 0, last = 0, visible = true, hover = 0, scatter = 0
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
      scatter += ((!reduced ? clamp(1-distance/72) : 0)-scatter)*.08
      const angle = Math.atan2(m.y-68,m.x-center)
      ctx.clearRect(0,0,width,144)
      // The glass material is entirely granular, with no filled silhouette or outline.
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
        const loose = Math.pow(d.r,12)*hover + scatter*Math.pow(d.r,3)*(.35+.65*Math.abs(d.delay))
        x += Math.cos(d.a)*loose*(8+Math.sin(now*.001+d.a)*5)
        y += Math.sin(d.a)*loose*12
        const light = clamp(.38+z*.34-d.y*.18+Math.pow(Math.max(0,-d.x*.38-d.y*.62+z*.6),18)*.65)
        const reflection = Math.exp(-Math.pow((d.y+.43+d.x*.18)/.11,2))*.35
        const rim = Math.pow(d.r,18)*(.25+Math.max(0,-d.x-d.y)*.38)
        const tone = Math.floor(clamp(light+reflection+rim)*127)
        ctx.fillStyle = colors[tone]
        ctx.globalAlpha = (variant === 'glass' ? (.38 + reflection*.45) * (1-ease(clamp((d.r-.78)/.22))) : .64 + z*.3) * (1-loose*.38)
        const size = (mobile ? 1.15 : .8) + loose*.7
        ctx.beginPath(); ctx.arc(x,y,size*.53,0,Math.PI*2); ctx.fill()
        if (loose > .3 && d.delay > .7) {
          ctx.globalAlpha *= .15
          ctx.beginPath(); ctx.arc(x,y,size*2.8,0,Math.PI*2); ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }
    frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); observer.disconnect() }
  }, [variant, width])

  return <div ref={rootRef} className="particle-mode" data-variant={variant} data-mode={mode} style={{width, aspectRatio:`${width} / 144`}}
    onPointerMove={e => { if(e.pointerType==='touch') return; const r=e.currentTarget.getBoundingClientRect(); motion.current.x=(e.clientX-r.left)*width/r.width; motion.current.y=(e.clientY-r.top)*144/r.height }}
    onPointerLeave={() => { motion.current.x=-1000; motion.current.y=-1000 }}>
    <div className="particle-mode-well" style={{left:`${39/width*100}%`,right:`${39/width*100}%`}} aria-hidden="true" />
    <canvas ref={canvasRef} aria-hidden="true" />
    <div className="particle-mode-options" style={{left:`${55/width*100}%`,right:`${55/width*100}%`}} role="group" aria-label={navigation ? 'Particle navigation preview' : 'Interaction mode preview'}>
      {labels.map((label,index)=><button key={label} type="button" aria-pressed={mode===index} onClick={()=>choose(index)} aria-label={label} style={{width:`${78/(width-110)*100}%`}}>
        {navigation ? <img src={`/header/${['globe','nav-2','nav-3','nav-4'][index]}.svg`} alt="" width="24" height="24"/> : index===0 ?
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3m-4 0h8"/></svg> :
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M6 9h2m3 0h2m3 0h2M6 12h2m3 0h2m3 0h2M7 16h10"/></svg>}
        {!navigation && <span>{label}</span>}
      </button>)}
    </div>
  </div>
}
