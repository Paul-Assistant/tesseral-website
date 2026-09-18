'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './integrations.css'
import IntegrationRequest from './IntegrationRequest'

const INTEGRATIONS = [
  { name: 'Figma', images: [1], copy: 'Bring your colors, typography, and design principles into your brand’s shared knowledge.' },
  { name: 'Notion', images: [2], copy: 'Read and update your Notion pages and databases. Create tasks directly from Tesseral, without switching tools.' },
  { name: 'Docs, Slides & Sheets', images: [3, 4, 5], copy: 'Bring briefs, presentations, and spreadsheets into the same shared context.' },
  { name: 'Claude, Cursor & Agents', images: [6, 7], copy: 'Give your AI tools current project context through MCP.' },
]

export default function Integrations() {
  const root = useRef<HTMLElement>(null)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => {
    const section = root.current!
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = Array.from(section.querySelectorAll<HTMLElement>('.integration-card'))
      const stage = section.querySelector<HTMLElement>('.integration-stage')!
      section.dataset.animated = 'true'
      let visible = false
      let phase = 0
      const draw = () => {
        cards.forEach((card, index) => {
          const angle = (index / cards.length - phase) * Math.PI * 2
          const front = (Math.cos(angle) + 1) / 2
          const radius = Math.min(235, stage.clientWidth * .29)
          gsap.set(card, { x: Math.sin(angle) * radius, z: -190 * (1 - front), rotationY: -Math.sin(angle) * 18, scale: .72 + .28 * front, opacity: .32 + .68 * front, zIndex: Math.round(front * 100) })
        })
      }
      const tick = (_time: number, delta: number) => {
        if (!visible || pausedRef.current || document.hidden) return
        phase = (phase + Math.min(delta, 50) / 24000) % 1
        draw()
      }
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: .1 })
      const resize = new ResizeObserver(draw)
      observer.observe(section)
      resize.observe(stage)
      draw()
      gsap.ticker.add(tick)
      return () => { observer.disconnect(); resize.disconnect(); gsap.ticker.remove(tick); delete section.dataset.animated; gsap.set(cards, { clearProps: 'all' }) }
    })
    return () => mm.revert()
  }, [])
  return <section id="integrations" className="integrations" ref={root} aria-labelledby="integrations-title">
    <div className="integrations-copy">
      <h2 id="integrations-title">The tools you use.<br />The knowledge you need.</h2>
      <p>Connect your documents, design files, and links to your Tesseral. All sources sync automatically, and you can refresh them manually whenever you need.</p>
      <IntegrationRequest />
      <button className="integration-pause" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume rotation' : 'Pause rotation'}</button>
    </div>
    <ul className="integration-stage" aria-label="Supported integrations">{INTEGRATIONS.map(item => <li className="integration-card" key={item.name}>
      <div className={`integration-icons integration-icons--${item.images.length}`}>{item.images.map(number => <img key={number} src={`/integrations/${number}.webp`} width="119" height="119" alt="" loading="lazy" decoding="async" />)}</div>
      <h3>{item.name}</h3><p>{item.copy}</p>
    </li>)}</ul>
  </section>
}
