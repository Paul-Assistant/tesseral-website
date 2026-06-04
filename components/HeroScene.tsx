'use client'

import { useEffect, useRef } from 'react'
import Spline from '@splinetool/react-spline'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Application } from '@splinetool/runtime'

gsap.registerPlugin(ScrollTrigger)

const SCENE_URL = 'https://prod.spline.design/QAlR1Wa5GlWwyKQs/scene.splinecode'

export default function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const appRef     = useRef<Application | null>(null)
  const progress   = useRef(0)

  function onLoad(spline: Application) {
    appRef.current = spline

    const camera = spline.findObjectByName('Camera')
    if (!camera) {
      console.warn('Camera object not found — check name in Spline')
      return
    }

    // Capture start position from whatever angle Spline has the camera at
    const startPos = { ...camera.position }
    const startRot = { ...camera.rotation }

    // End position: directly front-facing, closer to screen
    // Tweak these values once you see the scene
    const endPos = { x: 0,   y: camera.position.y * 0.5, z: camera.position.z * 0.4 }
    const endRot = { x: 0,   y: 0,                        z: 0 }

    gsap.to(progress, {
      current: 1,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=200%',
        scrub: 2,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const t = self.progress
          camera.position.x = gsap.utils.interpolate(startPos.x, endPos.x, t)
          camera.position.y = gsap.utils.interpolate(startPos.y, endPos.y, t)
          camera.position.z = gsap.utils.interpolate(startPos.z, endPos.z, t)
          camera.rotation.x = gsap.utils.interpolate(startRot.x, endRot.x, t)
          camera.rotation.y = gsap.utils.interpolate(startRot.y, endRot.y, t)
          camera.rotation.z = gsap.utils.interpolate(startRot.z, endRot.z, t)
        },
      },
    })
  }

  return (
    <section ref={sectionRef} className="relative h-screen w-full">
      <Spline
        scene={SCENE_URL}
        onLoad={onLoad}
        style={{ width: '100%', height: '100%' }}
      />
    </section>
  )
}
