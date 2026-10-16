import type { Metadata } from 'next'
import HeroStudy from './HeroStudy'
export const metadata: Metadata = { title: 'Tesseral — Living hero study', robots: { index: false, follow: false } }
export default function Page() { return <HeroStudy /> }
