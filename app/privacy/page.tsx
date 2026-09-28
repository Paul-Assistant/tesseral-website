import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import { privacy, legalReviewPending } from '@/lib/legal'
const title = 'Privacy Policy — Tesseral'
const description = 'How Tesseral handles personal data across its website, application, AI features, integrations and subscriptions.'
export const metadata: Metadata = {
  title, description, alternates: { canonical: '/privacy' },
  ...(legalReviewPending ? { robots: { index: false, follow: true } } : {}),
  openGraph: { title, description, url: '/privacy', type: 'website' },
  twitter: { title, description, card: 'summary_large_image' },
}
export default function Privacy() { return <LegalPage title="Privacy Policy." sections={privacy} /> }
