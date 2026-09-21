'use client'

import { useEffect, useRef, useState } from 'react'
import './hero-orbit.css'

const QUESTIONS = ['What makes our brand different?', 'What should our next campaign say?', 'Can you help me shape this pitch?', 'How would our brand say this?']

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
    const ring = element.querySelector<SVGEllipseElement>('.orbit-ring')!
    const bubble = element.querySelector<HTMLElement>('.orbit-question')!
    let questionIndex = -1
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let width = element.clientWidth, height = element.clientHeight
    let elapsed = 0, frame = 0, last = 0, visible = false
    const draw = () => {
      const mobile = width < 768, count = mobile ? 4 : SOURCES.length
      const cx = width / 2, cy = height * .48
      const hubY = height * (mobile ? .19 : .20)
      const rx = width * (mobile ? .47 : .43), ry = height * .34
      // Continuous eased steps: accelerate, glide, then linger at each position.
      const beat = elapsed / 4400
      const progress = beat % 1
      const eased = progress - .9 * Math.sin(progress * Math.PI * 2) / (Math.PI * 2)
      const phase = (Math.floor(beat) + eased) / count * Math.PI * 2
      ring.setAttribute('cx', String(cx)); ring.setAttribute('cy', String(cy))
      ring.setAttribute('rx', String(rx)); ring.setAttribute('ry', String(ry))
      cards.forEach((card, i) => {
        if (i >= count) { card.hidden = true; lines[i].style.display = 'none'; return }
        card.hidden = false; card.style.left = '0'; card.style.top = '0'; lines[i].style.display = ''
        const angle = i / count * Math.PI * 2 + phase - .7
        const depth = (Math.sin(angle) + 1) / 2
        const x = cx + Math.cos(angle) * rx, y = cy + Math.sin(angle) * ry
        card.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${(mobile ? .42 : .38) + depth * (mobile ? .88 : 1.35)})`
        card.style.zIndex = String(Math.round(depth * 10) + 1)
        const blur = `${Math.round((1-depth) ** 2 * (mobile ? 10 : 14)) / 2}px`
        if (card.dataset.blur !== blur) { card.style.filter = `blur(${blur})`; card.dataset.blur = blur }
        card.style.opacity = String(.35 + depth * .65)
        lines[i].setAttribute('x1', String(x)); lines[i].setAttribute('y1', String(y))
        lines[i].setAttribute('x2', String(cx)); lines[i].setAttribute('y2', String(hubY))
        // One source at a time sends a signal inward; no flashing or lightning.
        const signal = (elapsed / 1900 - i + count * 1000) % count
        const travel = Math.min(1, signal / .65)
        lines[i].style.strokeDashoffset = String(-travel * .86)
        lines[i].style.opacity = !motion.matches && signal < .65 ? String(Math.sin(travel * Math.PI) * .8) : '0'
      })
      const questionBeat = elapsed / 6200
      const nextQuestion = Math.floor(questionBeat) % QUESTIONS.length
      if (nextQuestion !== questionIndex) { bubble.textContent = QUESTIONS[nextQuestion]; questionIndex = nextQuestion }
      const moment = questionBeat % 1
      const entrance = Math.min(1, Math.max(0, (moment - .12) / .12))
      const exit = Math.min(1, Math.max(0, (.83 - moment) / .12))
      const reveal = motion.matches ? 1 : Math.min(entrance, exit)
      bubble.style.opacity = String(reveal)
      bubble.style.transform = `translateY(${(1 - reveal) * 9}px) scale(${.92 + reveal * .08})`
    }
    const tick = (now: number) => {
      frame = 0
      if (!visible || document.hidden || motion.matches) return
      if (!pauseRef.current) { elapsed += Math.min(now - last, 50); draw() }
      last = now
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
    <div className="hero-orbit" ref={root} data-paused={paused} role="img" aria-label="Files, Figma designs, Google Docs and Notion pages connect to one Tesseral brain. Example questions appear from the Tesseral node, inviting you to explore your brand knowledge.">
      <div className="orbit-visuals" aria-hidden="true">
        <svg className="orbit-connections"><ellipse className="orbit-ring" />{SOURCES.map(source => <g key={source.title}><line className="orbit-line" pathLength="1" /></g>)}</svg>
        {SOURCES.map((source, index) => <div className="orbit-source" key={source.title} style={{ left: `${50 + Math.cos(index / SOURCES.length * Math.PI * 2 - .7) * 34}%`, top: `${37 + Math.sin(index / SOURCES.length * Math.PI * 2 - .7) * 23}%`, transform: 'translate(-50%, -50%) scale(.85)' }}>
          <div className="orbit-source-top"><img src={source.icon} width="24" height="24" alt="" /><span>↗</span></div>
          <strong>{source.title}</strong><span className="orbit-source-detail">{source.detail}</span>
          {source.image && <img className="orbit-thumbnail" src="/hero-orbit/mood.webp" width="138" height="54" alt="" />}
          <span className="orbit-source-type">{source.type}<span className="orbit-status" /></span>
        </div>)}
        <div className="orbit-core"><div className="orbit-core-glow" /><img src="/hero-orbit/brain.svg" width="64" height="64" alt="" /><span>Tesseral</span><div className="orbit-question">{QUESTIONS[0]}</div></div>
      </div>
    </div>
    <button className="orbit-motion" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume orbit' : 'Pause orbit'}</button>
  </div>
}
