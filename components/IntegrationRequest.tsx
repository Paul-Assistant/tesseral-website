'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import './integration-request.css'
import { trackEvent } from '@/lib/analytics'

function RequestDialog({ close }: { close: () => void }) {
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
      const response = await fetch('/api/integration-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(data)), signal: AbortSignal.timeout(15000) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Your request could not be sent. Please try again.')
      setState('sent')
      trackEvent('integration_request')
    } catch (cause) {
      trackEvent('integration_error')
      setError(cause instanceof Error && cause.name !== 'TimeoutError' ? cause.message : 'The request timed out. Please try again.')
      setState('error')
    }
  }
  return createPortal(<dialog ref={dialog} className="request-dialog" aria-labelledby="request-title" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close() } }}>
    <button type="button" className="request-close" aria-label="Close integration request" onClick={close}>×</button>
    <h2 id="request-title">What would you like to connect?</h2>
    {state === 'sent' ? <div role="status"><p>Thanks for sharing your idea. We’ve received your request.</p><button type="button" className="request-submit" onClick={close}>Done</button></div> : <>
      <p>Tell us which tool would make your work easier. We’ll use your email to follow up on your request.</p>
      <form onSubmit={submit}>
        <label htmlFor="request-name">Name</label><input id="request-name" name="name" autoComplete="name" required maxLength={100} />
        <label htmlFor="request-email">Email</label><input id="request-email" name="email" type="email" autoComplete="email" required maxLength={254} />
        <label htmlFor="request-message">Message</label><textarea id="request-message" name="message" required maxLength={4000} rows={5} placeholder="Which integration would you like, and how would you use it?" />
        <div className="request-honeypot" aria-hidden="true"><label htmlFor="request-website">Website</label><input id="request-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        {state === 'error' && <p className="request-error" role="alert">{error} You can also <a href="mailto:tom@garcy.studio?subject=Tesseral%20integration%20request" style={{ textDecoration: 'underline' }}>email us directly</a>.</p>}
        <button type="submit" className="request-submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send request'}</button>
      </form>
    </>}
  </dialog>, document.body)
}

export default function IntegrationRequest() {
  const [open, setOpen] = useState(false)
  return <><button type="button" className="integration-request" onClick={() => { trackEvent('integration_open'); setOpen(true) }} aria-haspopup="dialog"><span>Request an integration</span><img src="/problem/card-icon.svg" width="40" height="40" alt="" /></button>{open && <RequestDialog close={() => setOpen(false)} />}</>
}
