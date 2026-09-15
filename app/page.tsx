'use client'

import dynamic from 'next/dynamic'
import HeroHeader from '@/components/HeroHeader'

const ShaderBackground = dynamic(() => import('@/components/ShaderBackground'), { ssr: false })

export default function Home() {
  return (
    <>
      <ShaderBackground />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <HeroHeader />
      </main>
    </>
  )
}
