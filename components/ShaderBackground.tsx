'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  // Simplex noise helpers
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
    );
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
    );
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m * m * m;
    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x   + h.x  * x0.y;
    g.yz = a0.yz * x12.xz  + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractional Brownian Motion
  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 5; i++) {
      val  += amp * snoise(p * freq);
      amp  *= 0.5;
      freq *= 2.1;
    }
    return val;
  }

  void main() {
    vec2 uv = vUv;

    // Cursor pulls the noise field
    vec2 pull = uMouse * 0.18;

    float t = uTime * 0.07;

    // Two layered FBM passes — second warped by the first
    vec2 p = (uv + pull) * 1.6;
    float n1 = fbm(p + vec2(t * 0.28, t * 0.19));
    float n2 = fbm(p * 1.3 + vec2(-t * 0.13, t * 0.22) + n1 * 0.45);

    float noise = n2 * 0.5 + 0.5;

    // Warm off-white palette matching Figma (#EBEAE7 base)
    vec3 base  = vec3(0.922, 0.918, 0.906); // #EBEAE7
    vec3 warm  = vec3(0.952, 0.941, 0.918); // #F2EFE9 — warmer blob
    vec3 cool  = vec3(0.898, 0.898, 0.910); // #E5E5E8 — slightly cooler

    vec3 col = mix(base, warm, smoothstep(0.30, 0.68, noise));
    col = mix(col, cool, smoothstep(0.65, 0.92, n1 * 0.5 + 0.5));

    gl_FragColor = vec4(col, 1.0);
  }
`

function ShaderPlane() {
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseSmooth = useRef({ x: 0, y: 0 })

  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth)  * 2 - 1
      mouseTarget.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()

    // Smooth follow — lazy easing gives the organic feel
    mouseSmooth.current.x += (mouseTarget.current.x - mouseSmooth.current.x) * 0.035
    mouseSmooth.current.y += (mouseTarget.current.y - mouseSmooth.current.y) * 0.035

    uniforms.uMouse.value.set(mouseSmooth.current.x, mouseSmooth.current.y)
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export default function ShaderBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        orthographic
        camera={{ near: -1, far: 1, zoom: 1 }}
        gl={{ antialias: false, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  )
}
