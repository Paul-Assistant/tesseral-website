'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './tesseral-for.css'

const AUDIENCES = [
  { name: 'Studios', copy: 'Keep every client’s files, links, and knowledge together. Give your team the context to keep creating, with fewer questions and interruptions.' },
  { name: 'Freelancers', copy: 'Go from client knowledge to a stronger pitch, faster. Create presentations and explore ideas with the depth of a team—even when you’re working solo.' },
  { name: 'Agencies', copy: 'Give your clients more than a handover. Share their Tesseral so they can find answers, create prompts, and build on the brand knowledge you’ve developed together.' },
  { name: 'Brands', copy: 'Give your team and AI tools one place to understand your brand. Keep assets, answers, and creative direction connected as your brand evolves.' },
]

export default function TesseralFor() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const section = root.current!
    const rows = Array.from(section.querySelectorAll<HTMLElement>('.audience-row'))
    const wheel = section.querySelector<HTMLElement>('.audience-wheel')!
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      section.dataset.animated = 'true'
      const pose = { step: 0 }
      let pitch = 145
      const draw = () => {
        const active = Math.round(pose.step)
        rows.forEach((row, index) => {
          // Earlier audiences leave above the glass; Brands ends the sequence.
          const offset = index - pose.step
          const focus = Math.max(0, 1 - Math.abs(offset))
          const edge = Math.min(1, Math.max(0, (offset + .7) / .4), Math.max(0, (3.3 - offset) / .4))
          gsap.set(row, {
            y: offset * pitch,
            rotationX: -offset * 13,
            z: -Math.abs(offset) * 24,
            opacity: (.3 + .7 * focus * focus) * edge,
            filter: `blur(${5 * (1 - focus)}px)`,
          })
          row.dataset.active = String(index === active)
        })
      }
      const measure = () => {
        pitch = parseFloat(getComputedStyle(wheel).getPropertyValue('--audience-pitch'))
        draw()
      }
      const resize = new ResizeObserver(measure)
      resize.observe(wheel)
      measure()
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .8 },
        onUpdate: draw,
      })
      AUDIENCES.forEach((_, index) => {
        if (index) timeline.to(pose, { step: index, duration: .8, ease: 'power2.inOut' })
        timeline.to({}, { duration: .65 })
      })
      return () => {
        resize.disconnect()
        timeline.scrollTrigger?.kill()
        timeline.kill()
        gsap.set(rows, { clearProps: 'all' })
        rows.forEach(row => { delete row.dataset.active })
        delete section.dataset.animated
      }
    })
    return () => media.revert()
  }, [])

  return <section ref={root} className="tesseral-for" id="tesseral-for" aria-labelledby="tesseral-for-title">
    <div className="audience-stage">
      <div className="audience-layout">
        <h2 id="tesseral-for-title">Tesseral for</h2>
        <div className="audience-wheel">
          <div className="audience-glass" aria-hidden="true" />
          <ul className="audience-list">
            {AUDIENCES.map(audience => <li className="audience-row" key={audience.name}>
              <h3>{audience.name}</h3>
              <div className="audience-description"><span>what this means for you</span><p>{audience.copy}</p></div>
            </li>)}
          </ul>
        </div>
      </div>
    </div>
  </section>
}
