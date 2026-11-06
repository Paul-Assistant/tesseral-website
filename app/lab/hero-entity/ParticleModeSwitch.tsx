'use client'

import { useEffect, useRef, useState } from 'react'
import './particle-mode-switch.css'

const clamp = (n: number) => Math.max(0, Math.min(1, n))
const ease = (n: number) => n * n * (3 - 2 * n)

/** A small, independent particle surface: no additional WebGL context. */
export default function ParticleModeSwitch({ variant = 'mercury', navigation = false, surface = 'recesses', particleLabels = false }: { particleLabels?: boolean; surface?: 'recesses' | 'individual' | 'engraved'; variant?: 'mercury' | 'glass' | 'living'; navigation?: boolean }) {
  const width = navigation ? 524 : 300
  const labels = navigation ? ['Overview', 'The problem', 'How it works', 'Pricing'] : ['Voice', 'Type']
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState(0)
  const motion = useRef({ from: 0, to: 0, start: -10000, ripple: -10000, x: -1000, y: -1000 })

  function choose(next: number) {
    const m = motion.current
    if (variant === 'living' && performance.now() - m.start < 1450) return
    if (next === m.to) { m.ripple = performance.now(); return }
    // Finish the current gesture before beginning another; never teleport particles.
    if (performance.now() - m.start < 1450) return
    m.from = m.to; m.to = next; m.start = performance.now()
    if (variant === 'living') m.ripple = m.start + 250
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
    let cancelled = false
    const glyphs: {x:number;y:number;alpha:number}[][] = []
    if (particleLabels) void document.fonts.ready.then(async () => {
      const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.particle-mode-options button'))
      for (const button of buttons) {
        const sample=document.createElement('canvas'); sample.width=156; sample.height=156
        const pen=sample.getContext('2d')!; pen.scale(2,2)
        const svg=button.querySelector('svg'), img=button.querySelector('img')
        const src=img?.getAttribute('src') || (svg ? 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg).replace('currentColor','#172021')) : '')
        const picture=new Image(); picture.src=src
        try { await picture.decode() } catch { continue }
        if(cancelled)return
        const size=navigation ? (buttons.indexOf(button)===0 ? 19 : 43) : 23
        pen.drawImage(picture,39-size/2,navigation ? 39-size/2 : 16,size,size)
        if(!navigation){pen.font=`11px ${getComputedStyle(button).fontFamily}`;pen.textAlign='center';pen.fillStyle='#172021';pen.fillText(button.getAttribute('aria-label')||'',39,55)}
        const pixels=pen.getImageData(0,0,156,156).data, points=[]
        for(let y=0;y<156;y+=2)for(let x=0;x<156;x+=2){const a=pixels[(y*156+x)*4+3]/255;if(a>.12)points.push({x:x/2-39,y:y/2-39,alpha:a})}
        glyphs.push(points)
      }
      if(!cancelled && glyphs.length===buttons.length)root.dataset.glyphs='ready'
    })
    const count = variant === 'glass' ? (mobile ? 1400 : 3000) : (mobile ? 2600 : 6500)
    // Uniform surface samples retain their identity throughout a transfer.
    const dots = Array.from({ length: count }, (_, i) => {
      const random = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v) }
      const r = Math.sqrt(random(i + 1)), a = random(i + 9001) * Math.PI * 2
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, r, a, delay: (Math.sin(i * 12.9898) * 43758.5453) % 1 }
    })
    const colors = Array.from({ length: 128 }, (_, i) => `rgb(${Math.round(40+i*1.68)},${Math.round(44+i*1.65)},${Math.round(45+i*1.60)})`)
    let frame = 0, last = 0, visible = true, hover = 0, scatter = 0, directionX = 1, directionY = 0
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    observer.observe(root)
    function draw(now: number) {
      frame = requestAnimationFrame(draw)
      if (!ctx || !visible || document.hidden || now-last < (mobile ? 33 : 22)) return
      const dt = Math.min((now-last)/1000,.05)
      last = now
      const living = variant === 'living'
      const t = reduced ? 0 : now*.00035
      const m = motion.current, progress = reduced ? 1 : clamp((now-m.start)/1450)
      if (living) {
        for (let i=0; i<(navigation ? 4 : 2); i++) {
          const depth = m.from===m.to ? (i===m.to ? 0 : 1)
            : i===m.to ? 1-ease(clamp((progress-.35)/.65))
            : i===m.from ? ease(clamp(progress/.8)) : 1
          root.style.setProperty(`--seat-${i}`,String(depth))
          const lift = i===m.to ? (reduced ? 1 : ease(clamp((now-m.start-1650)/650))) : 0
          root.style.setProperty(`--lift-${i}`,String(lift))
        }
      }
      const rippleAge = (now-m.ripple)/(living ? 2400 : 1600)
      const ripple = reduced || rippleAge < 0 || rippleAge > 1 ? 0 : living ? Math.pow(Math.sin(rippleAge*Math.PI),2) : Math.sin(rippleAge*Math.PI)*Math.exp(-rippleAge*1.4)
      const lens = living ? ripple : 0
      root.style.setProperty('--lens-scale',String(1+lens*.09))
      const center = 94 + m.to*112
      const distance = Math.hypot(m.x-center,m.y-68)
      const targetHover = reduced ? 0 : living ? ease(clamp((distance-30)/24))*ease(clamp(1-(distance-40)/100)) : distance > 40 ? clamp(1-(distance-40)/90) : 0
      hover += (targetHover-hover)*(living ? 1-Math.exp(-dt*5) : .09)
      scatter += ((!reduced ? ease(clamp(1-distance/80)) : 0)-scatter)*(living ? 1-Math.exp(-dt*4) : .08)
      if (m.x > -500 && distance > 1) {
        directionX += ((m.x-center)/distance-directionX)*(1-Math.exp(-dt*6))
        directionY += ((m.y-68)/distance-directionY)*(1-Math.exp(-dt*6))
      }
      const angle = living ? Math.atan2(directionY,directionX) : Math.atan2(m.y-68,m.x-center)
      ctx.clearRect(0,0,width,144)
      // The glass material is entirely granular, with no filled silhouette or outline.
      for (const d of dots) {
        const delay = Math.abs(d.delay)*.42
        const p = ease(clamp((progress-delay)/.58))
        const flowing = Math.sin(p*Math.PI)
        const cx = 94 + (m.from+(m.to-m.from)*p)*112
        const z = Math.sqrt(1-d.r*d.r)
        const breathing = reduced ? 0 : living ? Math.sin(t*1.5+d.a*2)*.75+Math.sin(t*.7-d.a*3)*.4 : Math.sin(now*.0008+d.a*.3)*.6
        const lobe = Math.pow(Math.max(0,Math.cos(d.a-angle)),10)*hover*13*Math.pow(d.r,3)
        const wave = living
          ? lens*Math.exp(-Math.pow((d.r-rippleAge*1.25)/.2,2))*7 + (1-d.r*d.r)*lens*5 - lens*d.r*1.6
          : Math.sin(d.r*12-rippleAge*13)*ripple*5
        const arrivalSwell = living ? lens*6*ease(clamp((p-.35)/.65)) : 0
        const radius = 39+breathing+lobe+wave+arrivalSwell
        let x = cx+d.x*radius*(1-flowing*.35)
        let y = 68+d.y*radius*(1-flowing*.58)+Math.sin(p*Math.PI*2+d.a)*flowing*10
        if (living && !reduced) {
          x += Math.sin(t*2+d.a*3+d.r*7)*(.35+d.r*.65)
          y += Math.cos(t*1.6+d.a*2-d.r*5)*(.35+d.r*.65)
        }
        // Only the outer grains loosen into shallow-depth motes near the pointer.
        const loose = Math.pow(d.r,12)*hover + scatter*Math.pow(d.r,3)*(.35+.65*Math.abs(d.delay))
        x += Math.cos(d.a)*loose*(8+Math.sin(now*.001+d.a)*5)
        y += Math.sin(d.a)*loose*12
        let light: number, reflection: number, rim: number
        if (living) {
          // Reflect the view ray about the curved hemisphere normal. Broad environment
          // lights compress at grazing angles instead of sliding across a flat disc.
          const bend = lens*Math.sin(d.r*9-rippleAge*7)*.12
          let nx = d.x*(1+bend), ny = d.y*(1+bend), nz = z
          const length = Math.hypot(nx,ny,nz)
          nx/=length; ny/=length; nz/=length
          const rx=2*nz*nx, ry=2*nz*ny, rz=2*nz*nz-1
          let lx=-.45+Math.sin(t*.5)*.22, ly=-.65+Math.cos(t*.37)*.1, lz=.7
          const ll=Math.hypot(lx,ly,lz); lx/=ll; ly/=ll; lz/=ll
          const key=Math.max(0,rx*lx+ry*ly+rz*lz)
          const fill=Math.max(0,rx*.78+ry*.15+rz*.6)
          const fresnel=Math.pow(1-nz,3)
          light=.38+nz*.34-ny*.18
          reflection=Math.pow(key,7)*.26+Math.pow(key,30)*.23+Math.pow(fill,12)*.12
          rim=fresnel*(.25+.38*Math.max(0,-nx-ny))
        } else {
          light=clamp(.38+z*.34-d.y*.18+Math.pow(Math.max(0,-d.x*.38-d.y*.62+z*.6),18)*.65)
          reflection=Math.exp(-Math.pow((d.y+.43+d.x*.18)/.11,2))*.35
          rim=Math.pow(d.r,18)*(.25+Math.max(0,-d.x-d.y)*.38)
        }
        // A travelling crest and trough make the center-out pulse readable on silver.
        const lensReflection = lens * Math.cos(d.r*16-rippleAge*9) * .2
        const tone = Math.floor(clamp(light+reflection+rim+lensReflection)*127)
        ctx.fillStyle = colors[tone]
        ctx.globalAlpha = (variant === 'glass' ? (.38 + reflection*.45) * (1-ease(clamp((d.r-.78)/.22))) : .64 + z*.3) * (1-loose*.38)
        const size = (mobile ? 1.15 : .8) + loose*.7
        ctx.beginPath(); ctx.arc(x,y,size*.53,0,Math.PI*2); ctx.fill()
        if (loose > .3 && d.delay > .7) {
          ctx.globalAlpha *= .15
          ctx.beginPath(); ctx.arc(x,y,size*2.8,0,Math.PI*2); ctx.fill()
        }
      }
      if(particleLabels && root.dataset.glyphs==='ready') {
        const lift=reduced ? 1 : ease(clamp((now-m.start-1650)/650))
        ctx.fillStyle='#172021'
        for(const [i,d] of (glyphs[m.to]||[]).entries()){
          const drift=reduced ? 0 : Math.sin(t*2+i*.7)*.22
          ctx.globalAlpha=d.alpha*lift*.95
          ctx.beginPath();ctx.arc(94+m.to*112+d.x+drift,68+d.y-6*lift+drift,.48,0,Math.PI*2);ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }
    frame = requestAnimationFrame(draw)
    return () => { cancelled=true; cancelAnimationFrame(frame); observer.disconnect(); delete root.dataset.glyphs }
  }, [variant, width, navigation, particleLabels])

  return <div ref={rootRef} className="particle-mode" data-variant={variant} data-surface={surface} data-particle-labels={particleLabels} data-mode={mode} style={{width, aspectRatio:`${width} / 144`}}
    onPointerMove={e => { if(e.pointerType==='touch') return; const r=e.currentTarget.getBoundingClientRect(); motion.current.x=(e.clientX-r.left)*width/r.width; motion.current.y=(e.clientY-r.top)*144/r.height }}
    onPointerLeave={() => { motion.current.x=-1000; motion.current.y=-1000 }}>
    <div className="particle-mode-well" style={{left:`${39/width*100}%`,right:`${39/width*100}%`}} aria-hidden="true" />
    {variant==='living' && surface!=='engraved' && <div className="particle-mode-seats" aria-hidden="true" style={{left:`${55/width*100}%`,right:`${55/width*100}%`}}>
      {labels.map((label,index)=><span key={label} style={{width:`${78/(width-110)*100}%`,opacity:`var(--seat-${index},${index===mode?0:1})`}}/>)}
    </div>}
    <canvas ref={canvasRef} aria-hidden="true" />
    <div className="particle-mode-options" style={{left:`${55/width*100}%`,right:`${55/width*100}%`}} role="group" aria-label={navigation ? 'Particle navigation preview' : 'Interaction mode preview'}>
      {labels.map((label,index)=><button key={label} type="button" aria-pressed={mode===index} onClick={()=>choose(index)} aria-label={label} style={{width:`${78/(width-110)*100}%`, ...({'--label-lift':`var(--lift-${index},${index===mode?1:0})`} as React.CSSProperties)}}>
        {navigation ? <img src={`/header/${['globe','nav-2','nav-3','nav-4'][index]}.svg`} alt="" width="24" height="24"/> : index===0 ?
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3m-4 0h8"/></svg> :
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M6 9h2m3 0h2m3 0h2M6 12h2m3 0h2m3 0h2M7 16h10"/></svg>}
        {!navigation && <span>{label}</span>}
      </button>)}
    </div>
  </div>
}
