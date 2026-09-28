import { CookieSettingsButton } from './SiteAnalytics'
import { legalReviewPending, legalVersion, type LegalSection } from '@/lib/legal'
import '@/app/privacy/privacy.css'

export default function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return <main className="privacy-page">
    <a href="/" className="privacy-back">← Back to Tesseral</a>
    <h1>{title}</h1>
    <p>Effective: {legalVersion}. Website and Tesseral application.</p>
    {legalReviewPending && <aside className="legal-review"><strong>Review draft — not yet effective.</strong> Provider data-use terms, backup retention and the app’s export/deletion workflow must be verified before publication.</aside>}
    <nav className="legal-nav" aria-label="Legal documents"><a href="/terms">Terms of Service</a><a href="/privacy">Privacy Policy</a><CookieSettingsButton /></nav>
    {sections.map((section, i) => <section key={section.title} aria-labelledby={`legal-section-${i}`}><h2 id={`legal-section-${i}`}>{section.title}</h2>{section.paragraphs.map(p => <p key={p}>{p.split(/(https:\/\/[^\s,]+|loren@garcy\.studio)/g).map((part, index) => part.startsWith('https://') ? <a key={index} href={part.replace(/\.$/, '')}>{part}</a> : part === 'loren@garcy.studio' ? <a key={index} href="mailto:loren@garcy.studio">{part}</a> : part)}</p>)}</section>)}
    <p>Contact: <a href="mailto:loren@garcy.studio">loren@garcy.studio</a></p>
  </main>
}
