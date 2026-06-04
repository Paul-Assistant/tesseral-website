'use client'

import { useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Center, Box } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

const CAM_START = { x: 600,  y: 200,  z: 1800 }
const CAM_END   = { x: 0,    y: 50,   z: 650  }
const TARGET    = { x: 0,    y: 0,    z: 0    }

function Monitor() {
  const { scene } = useGLTF('/model.gltf')
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!ref.current) return

    // Override every material to solid white so geometry is visible
    ref.current.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshStandardMaterial({ color: '#cccccc', roughness: 0.4, metalness: 0.2 })
        obj.castShadow = true
      }
    })

    const box = new THREE.Box3().setFromObject(ref.current)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    console.log('Model size:', size)
    console.log('Model center:', center)
  }, [scene])

  return (
    <Center>
      <primitive ref={ref} object={scene} />
    </Center>
  )
}

function CameraRig({ progress }: { progress: React.MutableRefObject<number> }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(CAM_START.x, CAM_START.y, CAM_START.z)
    camera.lookAt(TARGET.x, TARGET.y, TARGET.z)
  }, [camera])

  useFrame(() => {
    const t = progress.current
    camera.position.x = THREE.MathUtils.lerp(CAM_START.x, CAM_END.x, t)
    camera.position.y = THREE.MathUtils.lerp(CAM_START.y, CAM_END.y, t)
    camera.position.z = THREE.MathUtils.lerp(CAM_START.z, CAM_END.z, t)
    camera.lookAt(TARGET.x, TARGET.y, TARGET.z)
  })

  return null
}

export default function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const progress   = useRef(0)

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
    <section ref={sectionRef} className="relative h-screen w-full">
      <Canvas
        camera={{ fov: 45, near: 1, far: 50000 }}
        style={{ width: '100%', height: '100%', background: '#EFEFED' }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#EFEFED']} />

        <ambientLight intensity={3} />
        <directionalLight position={[0, 1000, 1000]} intensity={3} />
        <directionalLight position={[0, -1000, 1000]} intensity={1} />
        <Environment preset="studio" />

        {/* Red test box at origin — if you see this, Three.js is working */}
        <Box args={[200, 200, 200]} position={[0, 0, 0]}>
          <meshStandardMaterial color="red" />
        </Box>

        <Suspense fallback={null}>
          <Monitor />
        </Suspense>

        {/* <CameraRig progress={progress} /> */}
        <OrbitControls makeDefault />
        <axesHelper args={[500]} />
      </Canvas>
    </section>
  )
}

useGLTF.preload('/model.gltf')
