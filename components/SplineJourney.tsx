'use client'

import { useEffect, useRef, useState } from 'react'
import type { Application } from '@splinetool/runtime'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HowItWorksSlide from './HowItWorksSlide'
import { createCameraDriver } from './spline-camera'
import './spline-journey.css'

const SCENE_URL = 'https://prod.spline.design/QAlR1Wa5GlWwyKQs/scene.splinecode'

export default function SplineJourney() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle')

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const section = root.current!
    const viewport = section.querySelector<HTMLElement>('.spline-viewport')!
    const portal = section.querySelector<HTMLElement>('.spline-portal')!
    const slides = Array.from(section.querySelectorAll<HTMLElement>('.spline-slide'))
    const slide = slides[0]
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      let disposed = false
      let loading = false
      let app: Application | undefined
      let driver: ReturnType<typeof createCameraDriver> | undefined
      let ready = false
      let inView = false
      let timeline: gsap.core.Timeline | undefined
      const pose = { progress: 0, push: 0 }
      let playing = false
      let lastPose = ''
      let covered = false
      let refreshFrame = 0
      let sizeKey = ''
      let stepStarts: number[] = []
      const overflow = (element: HTMLElement) => Math.max(0, element.scrollHeight - viewport.clientHeight)
      const controller = new AbortController()
      const updatePlayback = () => {
        const time = timeline?.time() ?? 0
        const activeStep = stepStarts.reduce((active, start, index) => time >= start ? index : active, -1)
        slides.forEach((element, index) => {
          const inactive = !!section.dataset.animated && index !== activeStep
          element.inert = inactive
          element.setAttribute('aria-hidden', String(inactive))
        })
        const nextCovered = !!section.dataset.animated && inView && time >= .8
        if (covered !== nextCovered) {
          covered = nextCovered
          document.documentElement.dataset.journeyCovered = String(covered)
          window.dispatchEvent(new Event('journey-visibility'))
        }
        if (!app || !ready) return
        const visible = inView && !document.hidden && time < 3.12
        if (visible) {
          if (!playing) { app.play(); driver?.disableControls(); lastPose = '' }
          const nextPose = `${pose.progress}:${pose.push}`
          if (nextPose !== lastPose) { driver?.update(pose.progress, pose.push); lastPose = nextPose }
        } else if (playing) app.stop()
        playing = visible
      }
      const resize = new ResizeObserver(() => {
        if (ready) {
          driver?.resize(viewport.clientWidth, viewport.clientHeight)
          driver?.update(pose.progress, pose.push)
        }
        const nextKey = [viewport.clientWidth, viewport.clientHeight, ...slides.map(element => element.scrollHeight)].join(':')
        if (nextKey === sizeKey || section.dataset.scene === 'fallback') return
        sizeKey = nextKey
        cancelAnimationFrame(refreshFrame)
        refreshFrame = requestAnimationFrame(() => { buildTimeline(); ScrollTrigger.refresh() })
      })
      resize.observe(viewport)
      slides.forEach(element => resize.observe(element))
      const activate = async () => {
        if (loading || disposed) return
        loading = true
        setStatus('loading')
        try {
          // Load only near this part of the story. A stable URL preserves HTTP caching.
          const { Application } = await import('@splinetool/runtime/build/runtime.standalone.webgl.js')
          if (disposed) return
          app = new Application(canvas.current!, { renderMode: 'manual', renderer: 'webgl' })
          await app.load(SCENE_URL, undefined, { signal: controller.signal })
          if (disposed) { app.dispose(); return }
          driver = createCameraDriver(app)
          driver.resize(viewport.clientWidth, viewport.clientHeight)
          driver.update(pose.progress, pose.push)
          // Reveal only after the first requested frame has painted the CURRENT
          // camera pose, including when loading finishes after a fast scroll.
          await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
          if (disposed) return
          ready = true
          playing = !app.isStopped
          section.dataset.scene = 'ready'
          setStatus('ready')
          updatePlayback()
        } catch (error) {
          if (disposed) return
          app?.dispose()
          app = undefined
          const wasInSection = section.getBoundingClientRect().top < 0 && section.getBoundingClientRect().bottom > 0
          timeline?.scrollTrigger?.kill()
          timeline?.kill()
          gsap.set(slides, { clearProps: 'all' })
          slides.forEach(element => { element.inert = false; element.removeAttribute('aria-hidden') })
          delete section.dataset.animated
          section.dataset.scene = 'fallback'
          setStatus('fallback')
          ScrollTrigger.refresh()
          if (wasInSection) section.scrollIntoView()
          console.warn('Spline scene unavailable; showing the product walkthrough.', error)
        }
      }
      const preload = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { void activate(); preload.disconnect() }
      }, { rootMargin: '180% 0px' })
      preload.observe(section)
      const visibility = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting
        updatePlayback()
      })
      visibility.observe(viewport)
      document.addEventListener('visibilitychange', updatePlayback)

      section.dataset.animated = 'true'
      const buildTimeline = () => {
        timeline?.scrollTrigger?.kill()
        timeline?.kill()
        gsap.set(slides, { clearProps: 'all' })
        gsap.set(slides.slice(1), { autoAlpha: 0 })
        pose.progress = 0
        pose.push = 0
        const desktop = viewport.clientWidth >= 768
        stepStarts = [3.06]
        timeline = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true },
          onUpdate: updatePlayback,
        })
        timeline.fromTo(portal, { scale: .08, borderRadius: 80 }, { scale: 1, borderRadius: 0, duration: .8, ease: 'power2.inOut' }, 0)
        timeline.fromTo(portal, { autoAlpha: 0 }, { autoAlpha: 1, duration: .12, ease: 'none' }, 0)
        // The tweened value, not raw ScrollTrigger.progress, drives the camera.
        timeline.to(pose, { progress: 1, duration: 1.85, ease: 'power2.inOut' }, .8)
        timeline.to(pose, { push: 1, duration: .35, ease: 'power2.in' }, 2.65)
        timeline.fromTo(slide, { autoAlpha: 0, scale: .98 }, { autoAlpha: 1, scale: 1, duration: .12, ease: 'none' }, 3)
        timeline.to(portal, { autoAlpha: 0, duration: .01 }, 3.12)
        timeline.to({}, { duration: .27 }, 3.13)
        // Read each full step before moving on. The same document scroll controls
        // both directions, including content taller than a short/mobile viewport.
        let cursor = 3.4
        const sequence = timeline
        slides.forEach((element, index) => {
          if (index > 0) {
            const transition = desktop ? .85 : .65
            const previous = slides[index - 1]
            sequence.fromTo(element, { autoAlpha: 1, xPercent: desktop ? 100 : 0, y: desktop ? 0 : viewport.clientHeight }, { xPercent: 0, y: 0, duration: transition, ease: 'power2.inOut', immediateRender: false }, cursor)
            sequence.to(previous, desktop ? { xPercent: -100, duration: transition, ease: 'power2.inOut' } : { y: -overflow(previous) - viewport.clientHeight, duration: transition, ease: 'power2.inOut' }, cursor)
            // Keep upcoming slides out of the paint and accessibility trees until
            // their entrance; explicit sets also restore correctly in reverse.
            sequence.set(element, { autoAlpha: 0 }, 0)
            sequence.set(element, { autoAlpha: 1 }, cursor)
            stepStarts[index] = cursor + transition / 2
            cursor += transition
          }
          sequence.to({}, { duration: .6 }, cursor)
          cursor += .6
          const distance = overflow(element)
          if (distance > 0) {
            const duration = distance / viewport.clientHeight
            sequence.fromTo(element, { y: 0 }, { y: -distance, duration, ease: 'none', immediateRender: false }, cursor)
            cursor += duration
          }
          sequence.to({}, { duration: .4 }, cursor)
          cursor += .4
        })
        section.style.setProperty('--journey-height', `${(cursor + 1) * viewport.clientHeight}px`)
      }
      buildTimeline()

      return () => {
        disposed = true
        controller.abort()
        preload.disconnect()
        visibility.disconnect()
        resize.disconnect()
        cancelAnimationFrame(refreshFrame)
        timeline?.scrollTrigger?.kill()
        timeline?.kill()
        gsap.set(slides, { clearProps: 'all' })
        slides.forEach(element => { element.inert = false; element.removeAttribute('aria-hidden') })
        document.removeEventListener('visibilitychange', updatePlayback)
        app?.dispose()
        delete section.dataset.animated
        delete section.dataset.scene
        section.style.removeProperty('--journey-height')
        delete document.documentElement.dataset.journeyCovered
        window.dispatchEvent(new Event('journey-visibility'))
      }
    })
    return () => mm.revert()
  }, [])

  return <section ref={root} className="spline-journey" id="how-it-works" aria-label="How Tesseral works">
    <div className="spline-viewport">
      <div className="spline-portal" aria-hidden="true">
        <canvas ref={canvas} className="spline-canvas" />
        {status === 'loading' && <span className="spline-loading">Loading your studio…</span>}
      </div>
      {[0, 1, 2].map(step => <div className="spline-slide" key={step}><HowItWorksSlide step={step} /></div>)}
    </div>
  </section>
}
