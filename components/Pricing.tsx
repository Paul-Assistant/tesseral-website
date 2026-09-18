'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './pricing.css'

const PLANS = [
  { name: 'Starter', audience: 'For your brand or a few clients', monthly: 49, yearly: 39, features: [['Projects', '3 included'], ['Seats', '3 included'], ['Credits', '500'], ['Extra project', '+$9/mo'], ['Extra seat', '+$9/mo'], ['MCP/API', true], ['Client invite', false]] },
  { name: 'Studio', audience: 'For teams working across clients', monthly: 129, yearly: 103, features: [['Projects', '10 included'], ['Seats', '10 included'], ['Credits', '2000'], ['Extra project', '+$9/mo'], ['Extra seat', '+$9/mo'], ['MCP/API', true], ['Client invite', true]] },
  { name: 'Agency', audience: 'For more clients and bigger teams', monthly: 349, yearly: 279, features: [['Projects', 'Unlimited'], ['Seats', 'Unlimited'], ['Credits', '6000'], ['MCP/API', true], ['Client invite', true], ['Priority support', true], ['Demo call', true]] },
] as const

function CreditInfo({ credits, plan }: { credits: number; plan: string }) {
  const [open, setOpen] = useState(false)
  const id = `credits-${plan.toLowerCase()}`
  return <span className="credit-info" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
    <button type="button" className="credit-info-button" aria-label={`About ${plan} credits`} aria-expanded={open} aria-describedby={open ? id : undefined} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen(true)} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false) } }}>i</button>
    {open && <span id={id} className="credit-tooltip" role="tooltip">For example, {credits.toLocaleString('en-US')} credits is enough for {(credits / 2).toLocaleString('en-US')} chat messages and {credits / 20} Tesseral generations.</span>}
  </span>
}

function RollingPrice({ value, revision }: { value: number; revision: number }) {
  return <span className="price-digits" aria-hidden="true"><span>$</span>{String(value).split('').map((digit, index) => <span className="price-digit" key={index}>
    <span className="price-reel" key={`${revision}-${digit}`} style={{ '--digit': Number(digit), '--delay': `${index * 35}ms` } as CSSProperties}>{Array.from({ length: 20 }, (_, n) => <span key={n}>{n % 10}</span>)}</span>
  </span>)}</span>
}

export default function Pricing() {
  const root = useRef<HTMLElement>(null)
  const [billing, setBilling] = useState<'yearly' | 'monthly'>('yearly')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // One tween keeps all three cards in sync, including reverse scrolling.
      gsap.fromTo(root.current!.querySelectorAll('.pricing-card'), { y: 120, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: root.current!.querySelector('.pricing-cards'), start: 'top 95%', end: 'top 65%', scrub: .5 } })
    })
    return () => mm.revert()
  }, [])
  const selectBilling = (next: typeof billing) => { if (next !== billing) { setBilling(next); setRevision(value => value + 1) } }
  return <section id="pricing" className="pricing" ref={root} aria-labelledby="pricing-title">
    <h2 id="pricing-title">Choose the space your work needs.</h2>
    <p className="pricing-intro">Start with your projects and team. Choose the plan that fits how you work.</p>
    <div className="billing-switch" role="group" aria-label="Billing period">
      <button type="button" aria-pressed={billing === 'yearly'} onClick={() => selectBilling('yearly')}>Yearly</button>
      <button type="button" aria-pressed={billing === 'monthly'} onClick={() => selectBilling('monthly')}>Monthly</button>
    </div>
    <p className="billing-note">{billing === 'yearly' ? 'Save 20% with yearly billing' : 'Billed monthly'}</p>
    <div className="pricing-cards">{PLANS.map(plan => <article key={plan.name} className={`pricing-card pricing-card--${plan.name.toLowerCase()}`}>
      <img src={`/pricing/${plan.name.toLowerCase()}.svg`} width="40" height="40" alt="" />
      <p className="pricing-audience">{plan.audience}</p><h3>{plan.name}</h3>
      <ul className="pricing-features">{plan.features.map(([label, value]) => <li key={label}><span className="pricing-feature-label">{label}{label === 'Credits' && <CreditInfo credits={Number(value)} plan={plan.name} />}</span>{typeof value === 'boolean' ? <img src={`/pricing/${value ? 'included' : 'excluded'}.svg`} width="12" height="12" alt={value ? 'Included' : 'Not included'} /> : <strong>{value}</strong>}</li>)}</ul>
      <div className="pricing-amount" aria-live="polite" aria-atomic="true">
        <span className="pricing-discount">{billing === 'yearly' ? '20% OFF' : 'Monthly'}</span>
        <span className="pricing-value"><span className="pricing-sr">${plan[billing]} per month, billed {billing}</span><RollingPrice value={plan[billing]} revision={revision} /><span aria-hidden="true">/mo</span></span>
      </div>
      <p className="pricing-total">{billing === 'yearly' ? `$${(plan.yearly * 12).toLocaleString('en-US')} billed yearly` : `$${plan.monthly} billed monthly`}</p>
      <a className="pricing-subscribe" href="https://app.tesseral.design"><span>Choose {plan.name}</span><img src={`/pricing/${plan.name.toLowerCase()}.svg`} width="40" height="40" alt="" /></a>
    </article>)}</div>
  </section>
}
