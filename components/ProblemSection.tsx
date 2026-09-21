'use client'

import { useEffect, useId, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './problem-section.css'

const CARDS = [
  { x: 470, y: 160, rotation: -1.2,
    title: 'Everything’s in one place. Somewhere.',
    copy: ['Could be in Drive. Could be Notion.', 'Could be that Slack thread from April.', 'Start with brand_guidelines_FINAL_v2.pdf.', 'It’s probably the right one.'],
  },
  { x: 470, y: 160, rotation: 1,
    title: 'Quick question. For the fifth time today.',
    copy: ['Ask Sarah. She knows the client.', 'Sarah is on holiday.', 'Try Marcus. He remembers the brief.', 'He’ll never leave.'],
  },
  { x: 470, y: 160, rotation: -1,
    title: 'Same brand. Five different interpretations.',
    copy: ['Give everyone a different brief.', 'Let every AI tool fill in the gaps.', 'Call it creative freedom.'],
  },
]
const TITLE_LINES = ['Keep the creative work.', 'Lose the rest.']
const SOLUTIONS = [
  { x: 470, y: 160, rotation: .7,
    title: 'Now it actually is.',
    copy: ['All your files, links and sources together in Tesseral.', 'One shared brain, updated as your sources change.', 'Everyone knows where to look.'],
  },
  { x: 470, y: 160, rotation: -.7,
    title: 'Your team’s knowledge. Without the interruption.',
    copy: ['Ask Tesseral about any client, any time.', 'Brainstorm, build pitches and create with the latest context.', 'Sarah can enjoy her holiday.'],
  },
  { x: 470, y: 160, rotation: .6,
    title: 'One brand. Everyone aligned.',
    copy: ['Give your team one living source of brand knowledge.', 'Create aligned images, video and copy with shared prompts.', 'Connect your AI agents through Tesseral’s MCP server.'],
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
          <span>{solution ? 'With Tesseral' : 'Sound familiar?'}<br /><span>[ 0{index + 1} / 03 ]</span></span>
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
    gsap.registerPlugin(ScrollTrigger)
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
      const pairs = gsap.utils.toArray<HTMLElement>('.problem-pair', section)
      section.dataset.animated = 'true'
      const title = section.querySelector<HTMLElement>('#problem-title')!
      gsap.fromTo(title, { opacity: 0, y: 18 }, {
        opacity: 1, y: 0, duration: .45,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      })
      const sequence = gsap.timeline({
        scrollTrigger: {
          trigger: section, start: 'top top',
          end: () => `+=${section.offsetHeight - stage.clientHeight}`,
          scrub: .25, invalidateOnRefresh: true,
        },
      })
      pairs.forEach((pair, i) => {
        const problem = pair.querySelector<HTMLElement>('.problem-card-position:not(.solution-card-position)')!
        const solution = pair.querySelector<HTMLElement>('.solution-card-position')!
        const spray = pair.querySelector<SVGElement>('.solution-spray')!
        const passes = pair.querySelectorAll('.solution-spray-pass')
        const at = i * 3
        gsap.set(pair, { autoAlpha: 0 })
        gsap.set(solution, { autoAlpha: 0 })
        sequence.set(pair, { autoAlpha: 1 }, at)
        sequence.fromTo(problem, { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .3, ease: 'power2.out' }, at)
        passes.forEach((pass, j) => sequence.fromTo(pass, { strokeDashoffset: 1 }, {
          strokeDashoffset: 0, autoRound: false, duration: .26, ease: 'power1.inOut',
        }, at + .85 + j * .13))
        sequence.to(problem, { keyframes: [
          { x: -5, rotation: -1 }, { x: 7, rotation: 1 },
          { x: -6, rotation: -1 }, { x: 4, rotation: .5 }, { x: 0, rotation: 0 },
        ], duration: .45, ease: 'none' }, at + .88)
        sequence.to(problem, { autoAlpha: 0, scale: .94, duration: .18 }, at + 1.2)
        sequence.fromTo(solution, { y: 24, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: .3, ease: 'power2.out',
        }, at + 1.35)
        sequence.to(spray, { autoAlpha: 0, duration: .3 }, at + 1.65)
        if (i < pairs.length - 1) {
          sequence.to(pair, { y: -55, autoAlpha: 0, duration: .28 }, at + 2.72)
        }
      })
      sequence.to({}, { duration: .7 })
      return () => { delete section.dataset.animated }
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
        {CARDS.map((card, i) => <div className="problem-pair" key={card.title}>
          <ol className="problem-cards problem-cards--past" aria-label={`Problem ${i + 1}`}>
            <GlassCard card={card} index={i} />
          </ol>
        <svg className="solution-spray" viewBox="0 0 1442.01 453.996" aria-hidden="true">
          <defs>
            <filter id={`${sprayId}-${i}-soft`} x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
            <mask id={`${sprayId}-${i}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1442.01" height="453.996">
              <g fill="none" stroke="white" strokeWidth="210" strokeLinecap="round" filter={`url(#${sprayId}-${i}-soft)`}>
                <path className="solution-spray-pass" pathLength="1" strokeDasharray="1" d="M-90 130 C340 165 760 55 1530 160" />
                <path className="solution-spray-pass" pathLength="1" strokeDasharray="1" d="M1530 250 C950 190 510 290 -90 230" />
                <path className="solution-spray-pass" pathLength="1" strokeDasharray="1" d="M-90 345 C410 420 1000 280 1530 365" />
              </g>
            </mask>
          </defs>
          <image href="/solution/spray.svg" width="1442.01" height="453.996" mask={`url(#${sprayId}-${i}-mask)`} />
        </svg>
          <ol className="problem-cards solution-cards" aria-label={`Solution ${i + 1}`}>
            <GlassCard card={SOLUTIONS[i]} index={i} solution />
          </ol>
        </div>)}
      </div>
      </div>
    </div>
  </section>
}
