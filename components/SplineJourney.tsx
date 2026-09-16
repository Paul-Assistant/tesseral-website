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
    const slide = section.querySelector<HTMLElement>('.spline-slide')!
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
      let tail: gsap.core.Tween | undefined
      let refreshFrame = 0
      const overflow = () => Math.max(0, slide.scrollHeight - viewport.clientHeight)
      const controller = new AbortController()
      const updatePlayback = () => {
        const time = timeline?.time() ?? 0
        const nextCovered = inView && time >= .8
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
        section.style.setProperty('--slide-overflow', `${overflow()}px`)
        tail?.duration(Math.max(.001, overflow() / viewport.clientHeight))
        timeline?.invalidate()
        cancelAnimationFrame(refreshFrame)
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh())
      })
      resize.observe(viewport)
      resize.observe(slide)
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
          gsap.set(slide, { clearProps: 'all' })
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
      // A single document scroll drives tall/mobile content. No nested scroll
      // container can consume wheel/touch input or prevent reversing the scene.
      tail = gsap.fromTo(slide, { y: 0 }, { y: () => -overflow(), duration: Math.max(.001, overflow() / viewport.clientHeight), ease: 'none', paused: true })
      timeline.add(tail, 3.4)
      tail.paused(false)

      return () => {
        disposed = true
        controller.abort()
        preload.disconnect()
        visibility.disconnect()
        resize.disconnect()
        cancelAnimationFrame(refreshFrame)
        document.removeEventListener('visibilitychange', updatePlayback)
        app?.dispose()
        delete section.dataset.animated
        delete section.dataset.scene
        section.style.removeProperty('--slide-overflow')
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
      <div className="spline-slide"><HowItWorksSlide /></div>
    </div>
  </section>
}
