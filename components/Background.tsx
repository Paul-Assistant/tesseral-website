'use client'

import UnicornScene from 'unicornstudio-react'

export default function Background() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <UnicornScene
        projectId="S5dK6MGREBhKqK4ecpOQ"
        width="100%"
        height="100%"
        scale={1}
        dpi={1.5}
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js"
      />
    </div>
  )
}
