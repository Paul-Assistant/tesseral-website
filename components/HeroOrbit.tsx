'use client'

import { useEffect, useRef, useState } from 'react'
import './hero-orbit.css'

const SOURCES = [
  { title: 'Brand guidelines', detail: 'Colors, type & character', type: 'FIGMA', icon: '/integrations/1.webp' },
  { title: 'Client brief', detail: 'The big picture', type: 'GOOGLE DOCS', icon: '/integrations/3.webp' },
  { title: 'Brand strategy', detail: 'A shared direction', type: 'NOTION', icon: '/integrations/2.webp' },
  { title: 'Visual references', detail: 'A world to build on', type: 'IMAGE', icon: '/hero-orbit/mood.webp', image: true },
  { title: 'Tone of voice', detail: 'Every word on brand', type: 'DOCUMENT', icon: '/how-it-works/brief.svg' },
  { title: 'Brand website', detail: 'Always in the picture', type: 'LINK', icon: '/header/globe.svg' },
]

export default function HeroOrbit() {
  const root = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const pauseRef = useRef(false)
  useEffect(() => { pauseRef.current = paused }, [paused])
  useEffect(() => {
    const element = root.current!
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.orbit-source'))
    const lines = Array.from(element.querySelectorAll<SVGLineElement>('.orbit-line'))
    const pulses = Array.from(element.querySelectorAll<SVGCircleElement>('.orbit-pulse'))
    const ring = element.querySelector<SVGEllipseElement>('.orbit-ring')!
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let width = element.clientWidth, height = element.clientHeight
    let elapsed = 0, frame = 0, last = 0, visible = false
    const draw = () => {
      const mobile = width < 450, count = mobile ? 4 : SOURCES.length
      const cx = width / 2, cy = height * .37
      const rx = width * (mobile ? .32 : .34), ry = height * .23
      ring.setAttribute('cx', String(cx)); ring.setAttribute('cy', String(cy))
      ring.setAttribute('rx', String(rx)); ring.setAttribute('ry', String(ry))
      cards.forEach((card, i) => {
        if (i >= count) { card.hidden = true; lines[i].style.display = 'none'; pulses[i].style.display = 'none'; return }
        card.hidden = false; card.style.left = '0'; card.style.top = '0'; lines[i].style.display = ''; pulses[i].style.display = ''
        const angle = i / count * Math.PI * 2 + elapsed / 48000 * Math.PI * 2 - .7
        const depth = (Math.sin(angle) + 1) / 2
        const x = cx + Math.cos(angle) * rx, y = cy + Math.sin(angle) * ry
        card.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${.72 + depth * .28})`
        card.style.zIndex = String(depth > .45 ? 3 : 1)
        card.style.filter = `blur(${(1-depth) * (mobile ? .65 : 1.3)}px)`
        lines[i].setAttribute('x1', String(x)); lines[i].setAttribute('y1', String(y))
        lines[i].setAttribute('x2', String(cx)); lines[i].setAttribute('y2', String(cy))
        // One source at a time sends a signal inward; no flashing or lightning.
        const signal = (elapsed / 1900 - i + count * 1000) % count
        const travel = Math.min(1, signal / .65)
        pulses[i].setAttribute('cx', String(x + (cx - x) * travel))
        pulses[i].setAttribute('cy', String(y + (cy - y) * travel))
        pulses[i].style.opacity = !motion.matches && signal < .65 ? String(Math.sin(travel * Math.PI)) : '0'
      })
    }
    const tick = (now: number) => {
      frame = 0
      if (!visible || document.hidden || motion.matches) return
      if (now - last >= 40) {
        if (!pauseRef.current) { elapsed += Math.min(now - last, 64); draw() }
        last = now
      }
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      element.dataset.running = String(visible && !document.hidden && !motion.matches)
      cancelAnimationFrame(frame); frame = 0; last = performance.now()
      if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick)
      else draw()
    }
    const resize = new ResizeObserver(() => { width = element.clientWidth; height = element.clientHeight; draw() })
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    resize.observe(element); observer.observe(element)
    document.addEventListener('visibilitychange', sync); motion.addEventListener('change', sync)
    draw()
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync) }
  }, [])

  return <div className="hero-orbit-wrap">
    <div className="hero-orbit" ref={root} data-paused={paused} role="img" aria-label="Files, Figma designs, Google Docs and Notion pages connect to one Tesseral brain. Example: ask about your brand’s voice and get an answer grounded in your sources.">
      <div className="orbit-visuals" aria-hidden="true">
        <svg className="orbit-connections"><ellipse className="orbit-ring" />{SOURCES.map(source => <g key={source.title}><line className="orbit-line" /><circle className="orbit-pulse" r="3" /></g>)}</svg>
        {SOURCES.map((source, index) => <div className="orbit-source" key={source.title} style={{ left: `${50 + Math.cos(index / SOURCES.length * Math.PI * 2 - .7) * 34}%`, top: `${37 + Math.sin(index / SOURCES.length * Math.PI * 2 - .7) * 23}%`, transform: 'translate(-50%, -50%) scale(.85)' }}>
          <div className="orbit-source-top"><img src={source.icon} width="24" height="24" alt="" /><span>↗</span></div>
          <strong>{source.title}</strong><span className="orbit-source-detail">{source.detail}</span>
          {source.image && <img className="orbit-thumbnail" src="/hero-orbit/mood.webp" width="138" height="54" alt="" />}
          <span className="orbit-source-type">{source.type}<span className="orbit-status" /></span>
        </div>)}
        <div className="orbit-core"><div className="orbit-core-glow" /><img src="/hero-orbit/brain.svg" width="64" height="64" alt="" /><span>Tesseral</span><small>One living brain.</small></div>
        <div className="orbit-answer"><span className="orbit-answer-label">ASK YOUR TESSERAL</span><p>What’s our brand’s voice?</p><div><span className="orbit-answer-spark">✦</span><span>Confident. Warm. A little unexpected.<small>Grounded in your brand guidelines & brief.</small></span></div></div>
      </div>
    </div>
    <button className="orbit-motion" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume orbit' : 'Pause orbit'}</button>
  </div>
}
