export const GA_ID = 'G-JNT8NMXQZB'
export const CONSENT_KEY = 'tesseral.analytics-consent.v1'
export type AnalyticsEvent = 'waitlist_open' | 'generate_lead' | 'waitlist_error' | 'section_view' | 'navigation_click' | 'billing_change' | 'integration_open' | 'integration_request' | 'integration_error' | 'web_vital'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    tesseralAnalyticsAllowed?: boolean
  }
}

export function trackEvent(name: AnalyticsEvent, properties: Record<string, string | number> = {}) {
  if (typeof window === 'undefined' || !window.tesseralAnalyticsAllowed || !window.gtag) return
  // Callers supply only fixed UI labels and numeric metrics, never form values.
  window.gtag('event', name, properties)
}

export function readAnalyticsConsent(): boolean | null {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null')
    return value && typeof value.allowed === 'boolean' && Date.now() - value.savedAt < 180 * 86400000 ? value.allowed : null
  } catch { return null }
}
