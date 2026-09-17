'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroHeader from '@/components/HeroHeader'
import ProblemSection from '@/components/ProblemSection'
import SplineJourney from '@/components/SplineJourney'
import TesseralFor from '@/components/TesseralFor'

const ShaderBackground = dynamic(() => import('@/components/ShaderBackground'), { ssr: false })

export default function Home() {
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
        <TesseralFor />
      </main>
    </>
  )
}
