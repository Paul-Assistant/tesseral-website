'use client'

import { useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

// ─── Camera positions ────────────────────────────────────────────────────────
// Tune these once you see the model. Start = angled, End = front-facing zoomed in.
const CAM_START = { x: 800,  y: 300,  z: 1200 }  // angled view from right/above
const CAM_END   = { x: 0,    y: 0,    z: 900  }  // dead front, close to screen

const TARGET    = { x: 0,    y: 0,    z: 0    }  // model sits at origin

// ─── Model ───────────────────────────────────────────────────────────────────
function Monitor() {
  const { scene } = useGLTF('/model.gltf')
  return <primitive object={scene} />
}

// ─── Camera animator — driven by GSAP progress ref ───────────────────────────
function CameraRig({ progress }: { progress: React.MutableRefObject<number> }) {
  const { camera } = useThree()

  // Set initial camera position
  useEffect(() => {
    camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z)
    camera.lookAt(TARGET.x, TARGET.y, TARGET.z)
  }, [camera])

  useFrame(() => {
    const t = progress.current

    // Interpolate position
    camera.position.x = THREE.MathUtils.lerp(CAM_START.x, CAM_END.x, t)
    camera.position.y = THREE.MathUtils.lerp(CAM_START.y, CAM_END.y, t)
    camera.position.z = THREE.MathUtils.lerp(CAM_START.z, CAM_END.z, t)
    camera.lookAt(TARGET.x, TARGET.y, TARGET.z)
  })

  return null
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HeroScene() {
  const sectionRef  = useRef<HTMLElement>(null)
  const progress    = useRef(0)   // 0 = start angle, 1 = front-facing

  useEffect(() => {
    const ctx = gsap.context(() => {
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
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative h-screen w-full bg-[#EFEFED]">
      <Canvas
        camera={{ fov: 45, near: 10, far: 200000 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[1000, 1000, 1000]} intensity={1.2} />
        <directionalLight position={[-500, 500, -500]} intensity={0.4} />

        <Suspense fallback={null}>
          <Monitor />
        </Suspense>

        <CameraRig progress={progress} />

        {/* Remove this once camera positions are dialled in */}
        <OrbitControls makeDefault={false} />
        <axesHelper args={[500]} />
      </Canvas>
    </section>
  )
}

useGLTF.preload('/model.gltf')
