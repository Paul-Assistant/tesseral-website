'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import './integration-request.css'
import { trackEvent } from '@/lib/analytics'

function WaitlistDialog({ close, source }: { close: () => void; source: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal()
    return () => { document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }) }
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending') return
    const data = new FormData(event.currentTarget)
    setState('sending')
    try {
      const response = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(data)), signal: AbortSignal.timeout(15000) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'We couldn’t save your email. Please try again.')
      setState('sent')
      trackEvent('generate_lead', { method: 'waitlist', source })
    } catch (cause) {
      trackEvent('waitlist_error', { source })
      setError(cause instanceof Error && cause.name !== 'TimeoutError' ? cause.message : 'The request timed out. Please try again.')
      setState('error')
    }
  }
  return createPortal(<dialog ref={dialog} className="request-dialog" aria-labelledby="waitlist-title" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close() } }}>
    <button type="button" className="request-close" aria-label="Close launch signup" onClick={close}>×</button>
    <h2 id="waitlist-title">Be first to meet Tesseral.</h2>
    {state === 'sent' ? <div role="status"><p>You’re on the list. We’ll email you when Tesseral launches.</p><button type="button" className="request-submit" onClick={close}>Done</button></div> : <>
      <p>Leave your email and be the first to know when Tesseral is ready for you.</p>
      <form onSubmit={submit}>
        <label htmlFor="waitlist-email">Email</label><input id="waitlist-email" name="email" type="email" autoComplete="email" required maxLength={254} />
        <div className="request-honeypot" aria-hidden="true"><label htmlFor="waitlist-website">Website</label><input id="waitlist-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        {state === 'error' && <p className="request-error" role="alert">{error}</p>}
        <button type="submit" className="request-submit" disabled={state === 'sending'}>{state === 'sending' ? 'Joining…' : 'Notify me at launch'}</button>
      </form>
    </>}
  </dialog>, document.body)
}

export default function WaitlistButton({ children, className }: { children: React.ReactNode; className: string }) {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState('unknown')
  return <><button type="button" className={`${className} waitlist-trigger`} onClick={event => { const origin = event.currentTarget.closest('section,footer,header')?.id || 'header'; setSource(origin); trackEvent('waitlist_open', { source: origin }); setOpen(true) }} aria-haspopup="dialog">{children}</button>{open && <WaitlistDialog source={source} close={() => setOpen(false)} />}</>
}
