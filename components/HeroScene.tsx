'use client'

import { useRef } from 'react'
import Spline from '@splinetool/react-spline'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Application } from '@splinetool/runtime'

gsap.registerPlugin(ScrollTrigger)

const SCENE_URL = 'https://prod.spline.design/QAlR1Wa5GlWwyKQs/scene.splinecode'

// End position — captured manually from the live tracker
const END = {
  pos: { x: -6,  y: 80,  z: 107 },
  rot: { x: -6.9 * (Math.PI / 180), y: 0.6 * (Math.PI / 180), z: 0.1 * (Math.PI / 180) },
}

export default function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null)

  function onLoad(spline: Application) {
    const app = spline as any

    // Find the Three.js camera
    let cam: any = null
    if (app._camera) cam = app._camera
    if (!cam) {
      const scene = app._scene || app.scene
      if (scene) {
        scene.traverse((obj: any) => {
          if (!cam && (obj.isPerspectiveCamera || obj.isCamera)) cam = obj
        })
      }
    }
    if (!cam) { console.warn('Camera not found'); return }

    // Capture start position (Spline's default)
    const START = {
      pos: { x: cam.position.x, y: cam.position.y, z: cam.position.z },
      rot: { x: cam.rotation.x, y: cam.rotation.y, z: cam.rotation.z },
    }

    console.log('Start pos:', START)

    // Proxy object GSAP will tween
    const t = { value: 0 }

    gsap.to(t, {
      value: 1,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=200%',
        scrub: 2,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress
          cam.position.x = gsap.utils.interpolate(START.pos.x, END.pos.x, p)
          cam.position.y = gsap.utils.interpolate(START.pos.y, END.pos.y, p)
          cam.position.z = gsap.utils.interpolate(START.pos.z, END.pos.z, p)
          cam.rotation.x = gsap.utils.interpolate(START.rot.x, END.rot.x, p)
          cam.rotation.y = gsap.utils.interpolate(START.rot.y, END.rot.y, p)
          cam.rotation.z = gsap.utils.interpolate(START.rot.z, END.rot.z, p)
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
