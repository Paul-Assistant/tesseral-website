'use client'

import dynamic from 'next/dynamic'
import HeroHeader from '@/components/HeroHeader'
import ProblemSection from '@/components/ProblemSection'

const ShaderBackground = dynamic(() => import('@/components/ShaderBackground'), { ssr: false })

export default function Home() {
  return (
    <>
      <ShaderBackground />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <HeroHeader />
        <ProblemSection />
      </main>
    </>
  )
}
