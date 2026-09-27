import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import { terms, legalReviewPending } from '@/lib/legal'
const title = 'Terms of Service — Tesseral'
const description = 'Terms for the Tesseral website and application, including subscriptions, refunds, customer content and account cancellation.'
export const metadata: Metadata = {
  title, description, alternates: { canonical: '/terms' },
  ...(legalReviewPending ? { robots: { index: false, follow: true } } : {}),
  openGraph: { title, description, url: '/terms', type: 'website' },
  twitter: { title, description, card: 'summary_large_image' },
}
export default function Terms() { return <LegalPage title="Terms of Service." sections={terms} /> }
