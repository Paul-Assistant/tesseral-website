import type { MouseEvent } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Navigation = { current: { cancel?: () => void } }

/** Close the current viewport, change sections under the mask, then reveal. */
export function navigateToSection(event: MouseEvent<HTMLAnchorElement>, id: string, navigation: Navigation) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  navigation.current.cancel?.()
  const destination = () => Math.max(0, window.scrollY + target.getBoundingClientRect().top - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0))
  const jump = () => {
    window.scrollTo(0, destination())
    ScrollTrigger.update()
    // Settle scrubbed content while it is covered, so the reveal shows the
    // destination rather than animating through every intermediate section.
    ScrollTrigger.getAll().forEach(trigger => trigger.getTween()?.progress(1))
    history.replaceState(null, '', `#${id}`)
    target.focus({ preventScroll: true })
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(destination() - window.scrollY) < 2) {
    jump()
    return
  }

  const ns = 'http://www.w3.org/2000/svg'
  const overlay = document.createElementNS(ns, 'svg')
  const mask = document.createElementNS(ns, 'path')
  overlay.classList.add('section-transition')
  overlay.setAttribute('aria-hidden', 'true')
  overlay.setAttribute('focusable', 'false')
  mask.setAttribute('fill-rule', 'evenodd')
  overlay.append(mask)
  const host = document.querySelector('main') ?? document.body
  host.append(overlay)
  const width = window.innerWidth
  const height = window.innerHeight
  overlay.setAttribute('viewBox', `0 0 ${width} ${height}`)
  const draw = (amount: number) => {
    const w = width * amount
    const h = height * amount
    const x = (width - w) / 2
    const y = (height - h) / 2
    const r = Math.min(24 * (1 - amount), w / 2, h / 2)
    mask.setAttribute('d', `M0 0H${width}V${height}H0Z M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`)
  }
  let frame = 0
  let switched = false
  const start = performance.now()
  const cleanup = () => {
    cancelAnimationFrame(frame)
    overlay.remove()
    window.removeEventListener('resize', cleanup)
    navigation.current.cancel = undefined
  }
  navigation.current.cancel = cleanup
  window.addEventListener('resize', cleanup, { once: true })
  const ease = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  draw(1)
  const animate = (now: number) => {
    const elapsed = now - start
    if (elapsed < 420) draw(1 - ease(elapsed / 420))
    else {
      if (!switched) { draw(0); jump(); switched = true }
      const progress = Math.min(1, Math.max(0, (elapsed - 480) / 620))
      draw(ease(progress))
      if (progress === 1) { cleanup(); return }
    }
    frame = requestAnimationFrame(animate)
  }
  frame = requestAnimationFrame(animate)
}
