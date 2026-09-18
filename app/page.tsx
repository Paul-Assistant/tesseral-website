'use client'

import dynamic from 'next/dynamic'
import { useEffect, useLayoutEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroHeader from '@/components/HeroHeader'
import ProblemSection from '@/components/ProblemSection'
import SplineJourney from '@/components/SplineJourney'
import TesseralFor from '@/components/TesseralFor'
import Integrations from '@/components/Integrations'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'
import KnowledgeTools from '@/components/KnowledgeTools'

const ShaderBackground = dynamic(() => import('@/components/ShaderBackground'), { ssr: false })

export default function Home() {
  useLayoutEffect(() => {
    let measuredWidth = -1
    const measure = () => {
      const width = window.innerWidth
      // Mobile browser toolbars resize the viewport during a swipe. Recomputing
      // thousands of pixels of scroll story on that resize fights the gesture.
      // Only a width change (rotation/resizing) should establish a new height.
      if (width === measuredWidth) return
      measuredWidth = width
      const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
      if (mobile) document.documentElement.style.setProperty('--story-vh', `${window.innerHeight / 100}px`)
      else document.documentElement.style.removeProperty('--story-vh')
    }
    measure()
    ScrollTrigger.config({ ignoreMobileResize: true })
    window.addEventListener('resize', measure, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      document.documentElement.style.removeProperty('--story-vh')
    }
  }, [])
  useEffect(() => {
    let cancelled = false
    let frame = 0
    const cancel = () => { cancelled = true }
    window.addEventListener('wheel', cancel, { passive: true })
    window.addEventListener('touchstart', cancel, { passive: true })
    window.addEventListener('pointerdown', cancel, { passive: true })
    // Animated sections establish their height after hydration. Resolve a
    // direct hash only once those heights and the local font metrics are ready.
    void document.fonts.ready.then(() => {
      frame = requestAnimationFrame(() => {
        if (cancelled) return
        ScrollTrigger.refresh()
        const id = window.location.hash.slice(1)
        if (id) document.getElementById(id)?.scrollIntoView()
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('pointerdown', cancel)
    }
  }, [])
  return (
    <>
      <ShaderBackground />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <HeroHeader />
        <ProblemSection />
        <SplineJourney />
        <KnowledgeTools />
        <TesseralFor />
        <Integrations />
        <Pricing />
        <Footer />
      </main>
    </>
  )
}
