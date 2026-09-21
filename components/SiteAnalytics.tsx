'use client'

import { useCallback, useEffect, useState } from 'react'
import { useReportWebVitals } from 'next/web-vitals'
import { CONSENT_KEY, GA_ID, readAnalyticsConsent, trackEvent } from '@/lib/analytics'
import './site-analytics.css'

export default function SiteAnalytics() {
  const [choice, setChoice] = useState<boolean | null>(null)
  const [ready, setReady] = useState(false)
  const [settings, setSettings] = useState(false)
  useEffect(() => {
    setChoice(readAnalyticsConsent()); setReady(true)
    const open = () => setSettings(true)
    const sync = () => setChoice(readAnalyticsConsent())
    window.addEventListener('tesseral-cookie-settings', open)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener('tesseral-cookie-settings', open); window.removeEventListener('storage', sync) }
  }, [])
  useEffect(() => {
    if (!ready) return
    const productionHost = ['tesseral.design', 'www.tesseral.design'].includes(location.hostname)
    const allowed = choice === true && productionHost
    window.tesseralAnalyticsAllowed = allowed
    Object.assign(window, { [`ga-disable-${GA_ID}`]: !allowed })
    if (!allowed) return
    // Basic consent: no Google script or requests until the visitor opts in.
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || []
      window.gtag = function () { window.dataLayer!.push(arguments) }
      window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
      window.gtag('js', new Date())
      window.gtag('consent', 'update', { analytics_storage: 'granted' })
      let referrer = ''
      try { referrer = document.referrer ? new URL(document.referrer).origin : '' } catch { /* omit malformed referrer */ }
      window.gtag('config', GA_ID, { page_location: `${location.origin}${location.pathname}`, page_referrer: referrer, allow_google_signals: false, allow_ad_personalization_signals: false })
      const script = document.createElement('script')
      script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      script.id = 'tesseral-google-analytics'; document.head.append(script)
    } else window.gtag('consent', 'update', { analytics_storage: 'granted' })

    const seen = new Set<string>()
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && !seen.has(entry.target.id)) {
        seen.add(entry.target.id); trackEvent('section_view', { section: entry.target.id })
      }
    }), { rootMargin: '-20% 0px -55% 0px' })
    document.querySelectorAll('main section[id], main footer[id]').forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [choice, ready])
  const report = useCallback((metric: { name: string; value: number; rating: string }) => {
    trackEvent('web_vital', { metric: metric.name, value: Math.round(metric.value * 1000) / 1000, rating: metric.rating })
  }, [])
  useReportWebVitals(report)
  const choose = (allowed: boolean) => {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ allowed, savedAt: Date.now() })) } catch { /* session choice still works */ }
    if (!allowed) {
      window.tesseralAnalyticsAllowed = false
      Object.assign(window, { [`ga-disable-${GA_ID}`]: true })
      window.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.trim().split('=')[0]
        if (/^_ga(?:_|$)/.test(name)) ['', location.hostname, '.tesseral.design'].forEach(domain => {
          document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''} SameSite=Lax`
        })
      })
    }
    setChoice(allowed); setSettings(false)
  }
  if (!ready || (choice !== null && !settings)) return null
  return <aside className="analytics-consent" aria-label="Analytics preferences">
    <p>Help us make Tesseral better.</p>
    <span>With your permission, we use Google Analytics to understand visits and improve this website. Your waitlist email isn’t shared with analytics. <a href="/privacy">Privacy</a></span>
    <div><button type="button" onClick={() => choose(false)}>No thanks</button><button type="button" onClick={() => choose(true)}>Allow analytics</button></div>
  </aside>
}

export function CookieSettingsButton() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event('tesseral-cookie-settings'))}>Cookie settings</button>
}
