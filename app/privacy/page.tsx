import type { Metadata } from 'next'
import { CookieSettingsButton } from '@/components/SiteAnalytics'
import './privacy.css'

const title = 'Privacy — Tesseral'
const description = 'How Tesseral handles launch signup emails, integration requests, and optional website analytics.'
export const metadata: Metadata = {
  title, description, alternates: { canonical: '/privacy' },
  openGraph: { title, description, url: '/privacy', type: 'website' },
  twitter: { title, description, card: 'summary_large_image' },
}

export default function Privacy() {
  return <main className="privacy-page">
    <a href="/" className="privacy-back">← Back to Tesseral</a>
    <h1>Your privacy at Tesseral.</h1>
    <p>This notice covers the Tesseral marketing website and launch waitlist. Last updated: 21 September 2026.</p>
    <h2>Who is responsible</h2>
    <p>Tesseral is operated by Garcy s.r.o., Czech Republic, which is responsible for the personal information collected through this website. You can contact us at <a href="mailto:tom@garcy.studio">tom@garcy.studio</a>.</p>
    <h2>Launch notifications</h2>
    <p>When you join the waitlist, we save your email address and signup date in Supabase so we can let you know when Tesseral launches. Joining the waitlist does not create a product account. To leave the list or request deletion, email <a href="mailto:tom@garcy.studio">tom@garcy.studio</a>.</p>
    <h2>Integration requests</h2>
    <p>When you request an integration, we use your name, email address, and message to review and respond to your request. Resend delivers the request to our team at tom@garcy.studio. Please do not include passwords or confidential client files.</p>
    <h2>Optional analytics</h2>
    <p>Google Analytics loads only if you choose “Allow analytics.” It helps us understand page visits, section views, navigation, plan switches, form outcomes, and website performance. We do not include your name, email address, or message in the analytics events we send.</p>
    <p>Analytics may process browser and device information and use cookies to distinguish visits. Our tag disables Google signals and advertising personalization. You can decline analytics and still use every website feature.</p>
    <p>We save your analytics choice in your browser for up to 180 days. You can change it below; declining stops our analytics tracking and removes this website’s Google Analytics cookies.</p>
    <CookieSettingsButton />
    <h2>Hosting and service providers</h2>
    <p>Vercel hosts the website. Requests to our hosting and other service providers may include technical information, such as IP addresses, needed to deliver and protect their services. Our website uses Supabase for the waitlist, Resend for integration request delivery, and Google Analytics when you opt in.</p>
    <h2>Questions and requests</h2>
    <p>For questions about your information, to request access or correction, or to ask us to remove your waitlist signup or integration request, contact <a href="mailto:tom@garcy.studio">tom@garcy.studio</a>.</p>
  </main>
}
