'use client'

import WaitlistButton from './WaitlistButton'

import { useEffect, useRef, useState } from 'react'
import './footer.css'

export default function Footer() {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = root.current
    const media = video.current
    if (!element || !media) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        media.pause()
        return
      }
      if (reducedMotion.matches) return
      if (!media.getAttribute('src')) media.src = '/footer/scene-loop.mp4'
      void media.play().catch(() => setFailed(true))
    }, { threshold: 0.15 })
    observer.observe(element)
    return () => { observer.disconnect(); media.pause() }
  }, [])

  return <footer ref={root} className="site-footer" id="footer" aria-label="Tesseral">
    <img className="site-footer__background" src="/footer/poster.png" alt="" loading="lazy" />
    <video ref={video} className={`site-footer__background site-footer__video${ready ? ' site-footer__video--ready' : ''}${failed ? ' site-footer__video--failed' : ''}`}
      muted playsInline loop preload="none" poster="/footer/poster.png" aria-hidden="true"
      onError={() => setFailed(true)}
      onPlaying={() => setReady(true)} />
    <WaitlistButton className="footer-cta">
      <span>Create your Tesseral</span><img src="/footer/plus.svg" width="66" height="66" alt="" />
    </WaitlistButton>
    <div className="footer-credit">
      <a href="#home" aria-label="Tesseral — back to top"><img src="/header/logo.png" width="28" height="28" alt="" /><img src="/footer/wordmark.svg" width="54" height="13" alt="Tesseral" /></a>
      <span className="footer-credit__label">Made by</span>
      <a href="https://garcy.studio/" aria-label="Garcy Studio"><img src="/footer/garcy-studio.svg" width="89" height="16" alt="Garcy Studio" /></a>
    </div>
  </footer>
}
