'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Mini dashboard UI — rendered as real code, not a screenshot ─────────────
function DashboardUI() {
  return (
    <div className="w-full h-full bg-[#F2F2F0] flex overflow-hidden font-sans select-none">

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#C8F135] flex items-center justify-center">
            <span className="text-[10px] font-black text-neutral-900">T</span>
          </div>
          <span className="text-sm font-semibold text-neutral-800">Tesseral</span>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5 text-[12px]">
          {[
            { label: 'Dashboard', active: true },
            { label: 'Clients' },
            { label: 'Briefs' },
            { label: 'Knowledge Base' },
            { label: 'Skills' },
            { label: 'Team' },
          ].map(({ label, active }) => (
            <div
              key={label}
              className={`px-3 py-2 rounded-lg cursor-pointer font-medium transition-colors ${
                active
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-12 bg-white border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-sm font-semibold text-neutral-800">Brain Control Center</h1>
          <div className="flex items-center gap-2">
            <div className="text-[11px] text-neutral-400">Single source of truth</div>
            <div className="w-7 h-7 rounded-full bg-neutral-200" />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">

          {/* Mind map area */}
          <div className="flex-1 relative flex items-center justify-center">

            {/* Center node */}
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-2xl bg-[#C8F135] flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-neutral-800 text-center leading-tight px-2">
                  Client Brief
                </span>
                <span className="text-[8px] text-neutral-600 mt-0.5">Active</span>
              </div>
            </div>

            {/* Connector lines + satellite nodes */}
            {[
              { label: 'Online Research', angle: -130, color: 'bg-blue-100 text-blue-700' },
              { label: 'Questionnaire',   angle: -50,  color: 'bg-purple-100 text-purple-700' },
              { label: 'Mood Board',      angle: 0,    color: 'bg-orange-100 text-orange-700' },
              { label: 'Documents',       angle: 50,   color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Meeting Notes',   angle: 130,  color: 'bg-pink-100 text-pink-700' },
            ].map(({ label, angle, color }) => {
              const rad = (angle * Math.PI) / 180
              const dist = 130
              const x = Math.cos(rad) * dist
              const y = Math.sin(rad) * dist
              return (
                <div
                  key={label}
                  className="absolute"
                  style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                >
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-medium ${color} whitespace-nowrap shadow-sm`}>
                    {label}
                  </div>
                </div>
              )
            })}

            {/* Subtle grid */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
          </div>

          {/* Right panel — chat */}
          <aside className="w-72 flex-shrink-0 border-l border-neutral-200 bg-white flex flex-col">
            <div className="px-4 py-3 border-b border-neutral-100">
              <p className="text-[12px] font-semibold text-neutral-800">Ask about the client</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Trained on everything you've uploaded</p>
            </div>

            <div className="flex-1 px-4 py-3 space-y-3 overflow-hidden">
              {/* AI message */}
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-[#C8F135] flex-shrink-0 mt-0.5 flex items-center justify-center">
                  <span className="text-[8px] font-black">T</span>
                </div>
                <div className="bg-neutral-100 rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-neutral-700 leading-relaxed max-w-[200px]">
                  I've researched the client. They're a mid-size retail brand targeting 25–40. Biggest gap is brand consistency across channels.
                </div>
              </div>
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-neutral-900 rounded-xl rounded-tr-sm px-3 py-2 text-[10px] text-white leading-relaxed max-w-[180px]">
                  What tone should we use for the brief?
                </div>
              </div>
              {/* AI reply */}
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-[#C8F135] flex-shrink-0 mt-0.5 flex items-center justify-center">
                  <span className="text-[8px] font-black">T</span>
                </div>
                <div className="bg-neutral-100 rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-neutral-700 leading-relaxed max-w-[200px]">
                  Confident but approachable. Think premium without being cold. Their competitors are all formal — this is a differentiator.
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="px-3 pb-3">
              <div className="bg-neutral-100 rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 flex-1">Ask anything…</span>
                <div className="w-5 h-5 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[8px]">↑</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}

// ─── Main hero component ──────────────────────────────────────────────────────
export default function HeroScene() {
  const sectionRef    = useRef<HTMLElement>(null)
  const perspRef      = useRef<HTMLDivElement>(null)   // perspective wrapper
  const imageRef      = useRef<HTMLDivElement>(null)   // the angled render
  const dashboardRef  = useRef<HTMLDivElement>(null)   // coded dashboard

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=250%',
          scrub: 2,
          pin: true,
          anticipatePin: 1,
        },
      })

      // ── Phase 1 (0 → 0.45): rotate from angled to front-facing ──────────
      // The image has ~20deg baked-in Y tilt. We start the CSS wrapper at
      // an additional -15deg, making it look more angled, then animate both
      // to 0 so the combined effect reads as the camera rotating to face-on.
      tl.fromTo(
        imageRef.current,
        { rotateY: -15, rotateX: 3 },
        { rotateY: 0, rotateX: 0, ease: 'power2.inOut', duration: 0.45 },
        0
      )

      // ── Phase 2 (0.2 → 0.7): zoom into screen center ────────────────────
      // Overlaps with phase 1 so rotation + zoom happen together
      tl.to(
        imageRef.current,
        { scale: 3.4, ease: 'power2.inOut', duration: 0.5 },
        0.2
      )

      // ── Phase 3 (0.68 → 0.85): crossfade to coded dashboard UI ──────────
      tl.to(
        dashboardRef.current,
        { opacity: 1, ease: 'power1.inOut', duration: 0.17 },
        0.68
      )

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#EFEFED]"
    >
      {/* Perspective wrapper — gives depth to the CSS rotation */}
      <div
        ref={perspRef}
        className="absolute inset-0"
        style={{ perspective: '1400px', perspectiveOrigin: '50% 33.5%' }}
      >
        {/* Angled monitor render */}
        <div
          ref={imageRef}
          className="absolute inset-0 will-change-transform"
          style={{ transformOrigin: '50% 33.5%' }}
        >
          <Image
            src="/images/hero-monitor.jpg"
            alt="Tesseral"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Coded dashboard — fades in as zoom lands on the screen ─────────── */}
      <div
        ref={dashboardRef}
        className="absolute inset-0 opacity-0 will-change-[opacity]"
      >
        <DashboardUI />
      </div>
    </section>
  )
}
