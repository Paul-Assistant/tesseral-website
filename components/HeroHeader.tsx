'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { navigateToSection } from './section-navigation'
import './hero-header.css'

const WORDS = ['your clients', 'your brand']
const SECTIONS = [
  { id: 'home', label: 'Overview' },
  { id: 'problem', label: 'The problem' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'pricing', label: 'Pricing' },
]

function ActionButton({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return <a href="https://app.tesseral.design" className={`hero-button${compact ? ' hero-button--compact' : ''}`}>
    <span className="hero-button__fill" aria-hidden="true" />
    <span className="hero-button__label">{children}</span>
    <img className="hero-button__icon" src="/header/button.svg" width="40" height="40" alt="" />
  </a>
}

export default function HeroHeader() {
  const root = useRef<HTMLElement>(null)
  const navigationFrame = useRef<{ cancel?: () => void }>({})
  const [active, setActive] = useState('home')

  useEffect(() => {
    const cancel = () => navigationFrame.current.cancel?.()
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancel()
    }
    window.addEventListener('wheel', cancel, { passive: true })
    window.addEventListener('touchstart', cancel, { passive: true })
    window.addEventListener('pointerdown', cancel, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      cancel()
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('pointerdown', cancel)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    const update = () => {
      const section = SECTIONS.filter(({ id }) => {
        const element = document.getElementById(id)
        return element && element.getBoundingClientRect().top <= window.innerHeight * .35
      }).at(-1)
      const next = section?.id ?? 'home'
      setActive(current => current === next ? current : next)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scope = root.current!
      const rows = Array.from(scope.querySelectorAll<HTMLElement>('.rotating-word'))
      const slot = scope.querySelector<HTMLElement>('.rotating-slot')!
      const heading = scope.querySelector<HTMLElement>('.hero-heading')!
      const spray = scope.querySelector<HTMLElement>('.hero-spray')!
      let alive = true
      let current = 0
      let timer: gsap.core.Tween | undefined
      let transition: gsap.core.Timeline | undefined

      const rotate = () => {
        const next = (current + 1) % rows.length
        const outgoing = rows[current].querySelectorAll('.rotating-char')
        const incoming = rows[next].querySelectorAll('.rotating-char')
        transition = gsap.timeline({ onComplete: () => {
          current = next
          timer = gsap.delayedCall(1.4, rotate)
        } })
        transition.set(rows[next], { visibility: 'visible' })
          .set(incoming, { yPercent: 110, rotateX: -70, opacity: 0 })
          .to(outgoing, { yPercent: -110, rotateX: 70, opacity: 0, duration: .55, stagger: .025, ease: 'power3.inOut' }, 0)
          .to(slot, { width: rows[next].scrollWidth, duration: .7, ease: 'power3.inOut' }, .08)
          .to(incoming, { yPercent: 0, rotateX: 0, opacity: 1, duration: .65, stagger: .035, ease: 'power3.out' }, .18)
          .set(rows[current], { visibility: 'hidden' })
      }

      // Wait for actual type metrics so the changing phrase never clips.
      document.fonts.ready.then(() => {
        if (!alive) return
        slot.style.width = `${rows[0].scrollWidth}px`
        timer = gsap.delayedCall(2.4, rotate)
      })
      let headingWidth = heading.clientWidth
      const resize = () => {
        // Phrase wrapping changes height during the animation. Only a real
        // available-width change should finish and remeasure that animation.
        if (heading.clientWidth === headingWidth) return
        headingWidth = heading.clientWidth
        transition?.progress(1)
        gsap.set(slot, { width: rows[current].scrollWidth })
      }
      const observer = new ResizeObserver(resize)
      observer.observe(heading)

      // The exported spray includes Figma's exact noise and blur. A feathered
      // mask sweeps across it, revealing pigment without stretching the texture.
      const reveal = gsap.fromTo('.hero-spray__paint', { '--spray-reveal': '-18%' }, {
        '--spray-reveal': '118%', duration: 1.05, delay: .65, ease: 'power2.inOut',
      })
      let frame = 0
      const scroll = () => {
        if (frame) return
        frame = requestAnimationFrame(() => {
          const y = Math.max(0, Math.min(window.scrollY, scope.offsetHeight))
          heading.style.transform = `translate3d(0,${y * .12}px,0)`
          spray.style.transform = `translate3d(0,${-y * .08}px,0)`
          frame = 0
        })
      }
      window.addEventListener('scroll', scroll, { passive: true })
      scroll()
      const visibility = () => {
        const paused = document.hidden
        timer?.paused(paused)
        transition?.paused(paused)
      }
      document.addEventListener('visibilitychange', visibility)
      return () => {
        alive = false
        observer.disconnect()
        timer?.kill()
        transition?.kill()
        reveal.kill()
        cancelAnimationFrame(frame)
        window.removeEventListener('scroll', scroll)
        document.removeEventListener('visibilitychange', visibility)
        heading.style.transform = ''
        spray.style.transform = ''
        slot.style.width = ''
        rows.forEach(row => { row.style.visibility = ''; row.querySelectorAll<HTMLElement>('.rotating-char').forEach(c => c.removeAttribute('style')) })
      }
    }, root)
    return () => mm.revert()
  }, [])

  return <>
    <header className="hero-nav">
      <a className="hero-logo" href="#home" onClick={event => navigateToSection(event, 'home', navigationFrame)} aria-label="Tesseral home">
        <img src="/header/logo.png" width="29" height="29" alt="" />
        <img src="/header/wordmark.svg" width="54" height="13" alt="Tesseral" />
      </a>
      <nav className="hero-menu" aria-label="Main navigation">
        {SECTIONS.map(({ id, label }, i) =>
          <a href={`#${id}`} onClick={event => navigateToSection(event, id, navigationFrame)} key={id} className="hero-menu__item" aria-label={label} aria-current={active === id ? 'location' : undefined} title={label}>
            <img src={i === 0 ? "/header/globe.svg" : `/header/nav-${i + 1}.svg`} className={i === 0 ? "hero-menu__globe" : undefined} width="43.2" height="43.2" alt="" />
          </a>)}
      </nav>
      <ActionButton compact>Get started</ActionButton>
    </header>
    <section className="hero" ref={root} id="home" aria-label="Tesseral introduction">
    <div className="hero-content">
      <div className="hero-title-area">
        <h1 className="hero-heading" aria-label="Everything you know about your clients. Ready to work with.">
          <span className="hero-heading-reveal" aria-hidden="true">
            <span className="hero-first-line">Everything you know about<br /><span className="rotating-slot">
              {WORDS.map((word, i) => <span className={`rotating-word rotating-word--${i}`} key={word}>
                {Array.from(word).map((char, j) => <span className="rotating-char" key={j}>{char === ' ' ? '\u00a0' : char}</span>)}
              </span>)}
            </span>.</span>
            <span className="hero-second-line">Ready to work with.</span>
          </span>
        </h1>
        <div className="hero-spray" aria-hidden="true"><img className="hero-spray__paint" src="/header/spray.svg" width="590" height="163" alt="" /></div>
      </div>
      <p className="hero-description">Bring your files, links, and brand assets into one shared brain that stays up to date. Ask questions, explore ideas, and create with the context your team needs—already there.</p>
      <div className="hero-actions"><ActionButton>Create your Tesseral</ActionButton><a className="hero-secondary" href="#how-it-works" onClick={event => navigateToSection(event, 'how-it-works', navigationFrame)}><span className="hero-secondary__fill" aria-hidden="true" /><span className="hero-secondary__label">How it works</span><span className="hero-secondary__icon"><img src="/header/question.svg" width="16" height="15" alt="" /></span></a></div>
    </div>
  </section>
  </>
}
