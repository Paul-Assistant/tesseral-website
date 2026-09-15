'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './problem-section.css'

const CARDS = [
  {
    x: 0, y: 174.301, rotation: -.4095,
    title: 'Document everything.',
    copy: <>Create a brand guidelines doc.<br />Name it <strong>brand_guidelines_FINAL.pdf</strong>.<br />Update it. Name the new one <strong>brand_guidelines_FINAL_v2.pdf</strong>.<br />Repeat until no one knows which is real.</>,
  },
  {
    x: 197, y: 215.778, rotation: -3.1651,
    title: 'Build a knowledge base.',
    copy: <>Put Marcus in charge of everything.<br />He knows every client, every preference, every unwritten rule.<br />Don&apos;t document any of it.<br />He&apos;ll never leave.</>,
  },
  {
    x: 456.396, y: 251, rotation: .9162,
    title: 'Never reinvent the wheel.',
    copy: <>Somewhere you have a brief from a similar client. Could be in Drive.<br />Could be Notion.<br />Could be that Slack thread from April.<br />Don&apos;t worry about it.</>,
  },
  {
    x: 702, y: 162.305, rotation: -2.012,
    title: 'Always have an answer for the client.',
    copy: <>When client ask a question, say<br />&quot;I&apos;ll check with Sarah.&quot;<br />Sarah is the only one who knows.<br />Sarah is on holiday.</>,
  },
  {
    x: 940.475, y: 225, rotation: 1.7871,
    title: 'Invest in your people.',
    copy: <>Onboard your new hire.<br />Tell them to &quot;just ask around.&quot;<br />Give it two weeks.</>,
  },
]

export default function ProblemSection() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const section = root.current!
    const stage = section.querySelector<HTMLElement>('.problem-stage')!
    const board = section.querySelector<HTMLElement>('.problem-board')!
    const fit = () => {
      const narrow = window.matchMedia('(max-width: 767px)').matches
      const scale = Math.min(1, (stage.clientWidth - (narrow ? 32 : 80)) / (narrow ? 354 : 1262.318), (stage.clientHeight - 64) / (narrow ? 650 : 656.098))
      board.style.setProperty('--board-scale', String(Math.max(.35, scale)))
    }
    const observer = new ResizeObserver(fit)
    observer.observe(stage)
    fit()

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.problem-card-position', section)
      const floats = cards.map((card, i) => gsap.to(card.querySelector('.problem-card'), {
        y: -5 - i % 3, duration: 2.5 + i * .23, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true,
      }))
      section.dataset.animated = 'true'
      const sequence = gsap.timeline({
        scrollTrigger: {
          trigger: section, start: 'top top', end: 'bottom bottom', scrub: .55,
          invalidateOnRefresh: true,
        },
      })
      cards.forEach((card, i) => {
        // Ancestor opacity creates a backdrop root and prevents the glass from
        // sampling earlier cards. Keep full opacity throughout the slide.
        sequence.fromTo(card, { y: () => stage.clientHeight / Number(board.style.getPropertyValue('--board-scale')) }, {
          y: 0, duration: .7, ease: 'power2.out',
        }, i)
      })
      // Leave time to see the complete arrangement before the next section.
      sequence.to({}, { duration: .5 })
      let onScreen = false
      const visibility = () => floats.forEach(float => float.paused(document.hidden || !onScreen))
      const stageObserver = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting
        visibility()
      })
      stageObserver.observe(stage)
      document.addEventListener('visibilitychange', visibility)
      return () => {
        document.removeEventListener('visibilitychange', visibility)
        stageObserver.disconnect()
        delete section.dataset.animated
      }
    }, root)
    return () => {
      mm.revert()
      observer.disconnect()
      board.style.removeProperty('--board-scale')
    }
  }, [])

  return <section ref={root} id="problem" className="problem" aria-labelledby="problem-title">
    <div className="problem-stage">
      <div className="problem-board">
        <h2 id="problem-title">How the world&apos;s top creative<br className="problem-desktop-break" /> studios operate.</h2>
        <ol className="problem-cards">
          {CARDS.map((card, i) => <li key={card.title} className="problem-card-position" style={{
            '--card-x': `${card.x}px`, '--card-y': `${card.y}px`, '--card-rotation': `${card.rotation}deg`, '--card-index': i,
          } as CSSProperties}>
            <article className="problem-card" aria-labelledby={`problem-card-${i}`}>
              <div className="problem-card-top" aria-hidden="true">
                <span className="problem-card-number">0{i + 1}</span>
                <div className="problem-card-meta">
                  <img src="/problem/card-icon.svg" width="39.514" height="39.322" alt="" />
                  <span>Step<br /><span>[ 0{i + 1} / 05 ]</span></span>
                </div>
              </div>
              <p className="problem-card-copy">{card.copy}</p>
              <h3 id={`problem-card-${i}`}>{card.title}</h3>
            </article>
          </li>)}
        </ol>
      </div>
    </div>
  </section>
}
