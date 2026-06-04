'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        scale: 3.2,
        ease: 'power2.inOut',
        transformOrigin: '50% 33.5%',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=150%',
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#EFEFED]"
    >
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src="/images/hero-monitor.jpg"
          alt="Tesseral"
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  )
}
