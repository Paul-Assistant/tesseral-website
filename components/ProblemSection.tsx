'use client'

import { useEffect, useId, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import './problem-section.css'

const CARDS = [
  {
    x: 0, y: 174.301, rotation: -.4095,
    title: 'Document everything.',
    copy: ["Create a brand guidelines doc.", "Name it brand_guidelines_FINAL.pdf.", "Update it.", "Name the new one brand_guidelines_FINAL_v2.pdf.", "Repeat until no one knows which is real."],
  },
  {
    x: 197, y: 215.778, rotation: -3.1651,
    title: 'Build a knowledge base.',
    copy: ["Put Marcus in charge of everything.", "He knows every client, every unwritten rule.", "Don’t document any of it.", "He’ll never leave."],
  },
  {
    x: 456.396, y: 251, rotation: .9162,
    title: 'Never reinvent the wheel.',
    copy: ["Somewhere you have a brief from a similar client.", "Could be in Drive. Could be Notion. Could be that Slack thread from April.", "Don’t worry about it."],
  },
  {
    x: 702, y: 162.305, rotation: -2.012,
    title: 'Always have an answer for the client.',
    copy: ["When client ask a question, say “I’ll check with Sarah.”", "Sarah is the only one who knows.", "Sarah is on holiday."],
  },
  {
    x: 940.475, y: 225, rotation: 1.7871,
    title: 'Invest in your people.',
    copy: ["Onboard your new hire.", "Tell them to “just ask around.”", "Give it two weeks."],
  },
]

const TITLE_LINES = ["How the world's top creative", 'studios operate.']
const SOLUTIONS = [
  {
    x: -12, y: 207.301, rotation: -.4095,
    title: 'One source of truth. Always current.',
    copy: ["Your brand guidelines live in Tesseral.", "One version. Always right. Real-time.", "Everyone knows where to look.", "Agents & AI reach a single MCP Server"],
  },
  {
    x: 271, y: 231.301, rotation: -.4095,
    title: "Your studio's knowledge stays — even when people don't.",
    copy: ["Everything Marcus knew is in Tesseral.", "Every client preference, every unwritten rule, every lesson learned.", "It stays when he does not."],
  },
  {
    x: 510, y: 183, rotation: 1.2,
    title: 'Every project builds on everything before it.',
    copy: ["Tesseral remembers it all.", "Past briefs, client preferences, what worked, what didn’t", "Nothing starts from scratch."],
  },
  {
    x: 744, y: 246, rotation: -1.6,
    title: 'The answer is always there. Sarah or no Sarah.',
    copy: ["Every client question gets answered instantly.", "Tesseral works 24/7, no waiting, no bottlenecks", "Feed whatever agent you’re using with a built-in MCP/API server."],
  },
  {
    x: 932, y: 213, rotation: 1.1,
    title: 'New hire. Day one. Ready.',
    copy: ["Tesseral knows how your studio works.", "Your new team member asks it, it answers.", "No shadowing. No two-week lag."],
  },
]

function GlassCard({ card, index, solution = false }: { card: typeof CARDS[number] | typeof SOLUTIONS[number]; index: number; solution?: boolean }) {
  const id = `${solution ? 'solution' : 'problem'}-card-${index}`
  return <li className={`problem-card-position${solution ? ' solution-card-position' : ''}`} style={{
    '--card-x': `${card.x}px`, '--card-y': `${card.y}px`, '--card-rotation': `${card.rotation}deg`, '--card-index': index,
  } as CSSProperties}>
    <article className="problem-card" aria-labelledby={id}>
      <div className="problem-card-top" aria-hidden="true">
        <img src={`/${solution ? 'solution' : 'problem'}/card-icon.svg`} width="39.514" height="39.322" alt="" />
        <div className="problem-card-meta">
          <span>Step<br /><span>[ 0{index + 1} / 05 ]</span></span>
        </div>
      </div>
      <h3 id={id}>{card.title}</h3>
      <ul className="problem-card-copy">{card.copy.map(line => <li key={line}><img src="/problem/check.svg" width="10" height="7" alt="" /><span>{line.split(/(brand_guidelines_FINAL(?:_v2)?\.pdf|MCP Server)/g).map((part, i) => /^(brand_guidelines_|MCP Server)/.test(part) ? <strong key={i}>{part}</strong> : part)}</span></li>)}</ul>
    </article>
  </li>
}

export default function ProblemSection() {
  const root = useRef<HTMLElement>(null)
  const sprayId = useId().replace(/:/g, '')

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin)
    const section = root.current!
    const stage = section.querySelector<HTMLElement>('.problem-stage')!
    const board = section.querySelector<HTMLElement>('.problem-board')!
    const fit = () => {
      const narrow = window.matchMedia('(max-width: 767px)').matches
      const scale = Math.min(1, (stage.clientWidth - (narrow ? 32 : 80)) / (narrow ? 354 : 1262.318), (stage.clientHeight - (narrow ? 208 : 144)) / (narrow ? 650 : 656.098))
      board.style.setProperty('--board-scale', String(Math.max(.35, scale)))
    }
    const observer = new ResizeObserver(fit)
    observer.observe(stage)
    fit()

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.problem-cards--past .problem-card-position', section)
      const solutions = gsap.utils.toArray<HTMLElement>('.solution-card-position', section)
      const floats = [...cards, ...solutions].map((card, i) => gsap.to(card.querySelector('.problem-card'), {
        y: -5 - i % 3, duration: 2.5 + i * .23, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true,
      }))
      section.dataset.animated = 'true'
      const title = section.querySelector<HTMLElement>('#problem-title')!
      const words = gsap.utils.toArray<HTMLElement>('.problem-scramble-text', title)
      const titleReveal = gsap.timeline({
        scrollTrigger: { trigger: title, start: 'top 90%', once: true },
      })
      titleReveal.fromTo(title, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .45, ease: 'power2.out' })
      words.forEach((word, i) => titleReveal.to(word, {
        duration: .75, scrambleText: { text: word.dataset.text!, chars: 'abcdefghijklmnopqrstuvwxyz', speed: .65, revealDelay: .1, tweenLength: false },
      }, i * .045))
      const sequence = gsap.timeline({
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => `+=${section.offsetHeight - stage.clientHeight}`, scrub: .55,
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
      // Three feathered passes reveal the original Figma pigment, left/right/left.
      // The cards stay under the paint; solution cards occupy a higher layer.
      const passes = gsap.utils.toArray<SVGPathElement>('.solution-spray-pass', section)
      gsap.set(document.documentElement, { '--spray-shake-x': '0px', '--spray-shake-y': '0px' })
      passes.forEach((pass, i) => sequence.fromTo(pass, { strokeDashoffset: 1 }, {
        strokeDashoffset: 0, autoRound: false, duration: .7, ease: 'power1.inOut',
      }, 5.2 + i * .48))
      // Dim the old copy, keeping the glass ancestors at full opacity. Crossing
      // opacity=1 on their container changes the backdrop root abruptly.
      sequence.to('.problem-cards--past :is(.problem-card-copy, h3)', { opacity: .5, duration: .45, ease: 'power1.inOut' }, 6.45)
      sequence.to(document.documentElement, {
        keyframes: [
          { '--spray-shake-x': '-5px', '--spray-shake-y': '1px' },
          { '--spray-shake-x': '7px', '--spray-shake-y': '-2px' },
          { '--spray-shake-x': '-8px', '--spray-shake-y': '2px' },
          { '--spray-shake-x': '6px', '--spray-shake-y': '-1px' },
          { '--spray-shake-x': '-5px', '--spray-shake-y': '1px' },
          { '--spray-shake-x': '4px', '--spray-shake-y': '-1px' },
          { '--spray-shake-x': '-2px', '--spray-shake-y': '0px' },
          { '--spray-shake-x': '0px', '--spray-shake-y': '0px' },
        ], duration: 1.4, ease: 'none',
      }, 5.25)
      // Animate the heading wrapper so the independent scramble reveal can finish.
      sequence.to('.problem-title-wrap', { autoAlpha: 0, y: -15, duration: .35 }, 6.4)
      sequence.fromTo('#solution-title', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .45 }, 6.75)
      solutions.forEach((card, i) => sequence.fromTo(card, {
        y: () => stage.clientHeight / Number(board.style.getPropertyValue('--board-scale')),
      }, { y: 0, duration: .7, ease: 'power2.out' }, 7.2 + i))
      sequence.to({}, { duration: .7 })
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
        words.forEach(word => { word.textContent = word.dataset.text! })
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
      <div className="problem-scene">
      <div className="problem-board">
        <div className="problem-title-wrap">
        <h2 id="problem-title" aria-label={TITLE_LINES.join(' ')}>
          {TITLE_LINES.map((line, lineIndex) => <span key={line} aria-hidden="true">
            {lineIndex > 0 && <><br className="problem-desktop-break" /> </>}
            {line.split(' ').map((word, i) => <span key={i}>
              {i > 0 && ' '}<span className="problem-scramble-word"><span className="problem-scramble-size">{word}</span><span className="problem-scramble-text" data-text={word}>{word}</span></span>
            </span>)}
          </span>)}
        </h2>
        </div>
        <ol className="problem-cards problem-cards--past" aria-label="How studios operate today">
          {CARDS.map((card, i) => <GlassCard key={card.title} card={card} index={i} />)}
        </ol>
        <svg className="solution-spray" viewBox="0 0 1442.01 453.996" aria-hidden="true">
          <defs>
            <filter id={`${sprayId}-soft`} x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
            <mask id={`${sprayId}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1442.01" height="453.996">
              <g fill="none" stroke="white" strokeWidth="210" strokeLinecap="round" filter={`url(#${sprayId}-soft)`}>
                <path className="solution-spray-pass" pathLength="1" strokeDasharray="1" d="M-90 130 C340 165 760 55 1530 160" />
                <path className="solution-spray-pass" pathLength="1" strokeDasharray="1" d="M1530 250 C950 190 510 290 -90 230" />
                <path className="solution-spray-pass" pathLength="1" strokeDasharray="1" d="M-90 345 C410 420 1000 280 1530 365" />
              </g>
            </mask>
          </defs>
          <image href="/solution/spray.svg" width="1442.01" height="453.996" mask={`url(#${sprayId}-mask)`} />
        </svg>
        <h2 id="solution-title">How studios &amp; brands that run<br className="problem-desktop-break" /> on Tesseral operate.</h2>
        <ol className="problem-cards solution-cards" aria-labelledby="solution-title">
          {SOLUTIONS.map((card, i) => <GlassCard key={card.title} card={card} index={i} solution />)}
        </ol>
      </div>
      </div>
    </div>
  </section>
}
