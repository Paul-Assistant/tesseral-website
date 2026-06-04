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

  function onLoad(spline: Application) {
    // ── Log everything available on the spline app object ──
    console.log('Spline app keys:', Object.keys(spline))

    // Try to find camera-like objects
    const names = ['Camera', 'camera', 'Camera 2', 'cam', 'Cam']
    names.forEach(n => {
      const obj = spline.findObjectByName(n)
      console.log(`findObjectByName("${n}"):`, obj)
    })

    // Try accessing the internal Three.js scene
    const internalKeys = ['_scene', 'scene', '_camera', 'camera', '_renderer', 'renderer']
    internalKeys.forEach(k => {
      const val = (spline as any)[k]
      if (val) console.log(`spline.${k}:`, val?.type || typeof val)
    })

    // Traverse the internal scene if accessible
    const scene = (spline as any)._scene || (spline as any).scene
    if (scene) {
      console.log('Scene found, traversing...')
      scene.traverse((obj: any) => {
        if (obj.isCamera || obj.type?.toLowerCase().includes('camera')) {
          console.log('CAMERA FOUND:', obj.name, obj.type, 'pos:', obj.position)
        }
      })
    }
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
