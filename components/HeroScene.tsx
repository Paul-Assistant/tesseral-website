'use client'

import { useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'
import type { Application } from '@splinetool/runtime'

const SCENE_URL = 'https://prod.spline.design/QAlR1Wa5GlWwyKQs/scene.splinecode'

export default function HeroScene() {
  const [pos, setPos] = useState({ x: 0, y: 0, z: 0 })
  const [rot, setRot] = useState({ x: 0, y: 0, z: 0 })
  const rafRef = useRef<number>(0)

  function onLoad(spline: Application) {
    // Try every known way to reach the Three.js camera
    const app = spline as any
    let cam: any = null

    // Method 1: direct _camera property
    if (app._camera) cam = app._camera

    // Method 2: traverse internal scene
    if (!cam) {
      const scene = app._scene || app.scene
      if (scene) {
        scene.traverse((obj: any) => {
          if (!cam && (obj.isCamera || obj.isOrthographicCamera || obj.isPerspectiveCamera)) {
            cam = obj
          }
        })
      }
    }

    // Method 3: named object
    if (!cam) cam = spline.findObjectByName('Camera')

    if (!cam) {
      console.warn('Camera not found — logging all spline keys:', Object.keys(app))
      return
    }

    console.log('Camera found:', cam.type, cam.name)

    // Poll camera position every frame and show it on screen
    const tick = () => {
      setPos({
        x: Math.round(cam.position.x),
        y: Math.round(cam.position.y),
        z: Math.round(cam.position.z),
      })
      setRot({
        x: parseFloat((cam.rotation.x * (180 / Math.PI)).toFixed(1)),
        y: parseFloat((cam.rotation.y * (180 / Math.PI)).toFixed(1)),
        z: parseFloat((cam.rotation.z * (180 / Math.PI)).toFixed(1)),
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  return (
    <section className="relative h-screen w-full">
      <Spline
        scene={SCENE_URL}
        onLoad={onLoad}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Live coordinate overlay */}
      <div className="absolute bottom-6 left-6 bg-black/80 text-white font-mono text-xs rounded-xl px-4 py-3 space-y-1 pointer-events-none">
        <div className="text-neutral-400 text-[10px] mb-1 uppercase tracking-widest">Camera position</div>
        <div>x: <span className="text-green-400">{pos.x}</span></div>
        <div>y: <span className="text-green-400">{pos.y}</span></div>
        <div>z: <span className="text-green-400">{pos.z}</span></div>
        <div className="text-neutral-400 text-[10px] mt-2 mb-1 uppercase tracking-widest">Rotation (deg)</div>
        <div>rx: <span className="text-blue-400">{rot.x}</span></div>
        <div>ry: <span className="text-blue-400">{rot.y}</span></div>
        <div>rz: <span className="text-blue-400">{rot.z}</span></div>
      </div>
    </section>
  )
}
