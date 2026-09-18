import Image from 'next/image'

const STEPS = [
  { title: 'Feed your team', paragraphs: [
    'Onboarding is customized to you. Tell Tesseral how your studio works, what you value, how you think. It learns your process, your voice, your standards.',
    'It adapts to you — not the other way around.',
  ] },
  { title: 'Add a project. Know everything from day one.', paragraphs: [
    'Upload every document or link you have. Tesseral automatically researches the client so you walk in informed — brand history, market position, competitors, brand assets — without spending a day on prep.',
    'Need more? Send your questionnaire directly through the platform. The client answers in one place. No emails. No chasing PDFs. No checking your inbox.',
    'When they reply, Tesseral already knows — and updates everything automatically.',
    'One platform. Every question answered. Zero back-and-forth.',
  ] },
  { title: 'One source of truth.', paragraphs: [
    'Ask anything. Update a brief automatically. Get feedback at 2am. Brief a new project in minutes. Onboard a hire without a handover meeting.',
    'Connect your agent to an MCP server and have a single source of an up-to-date knowledge base.',
    'Tesseral works like having the most experienced person in your studio — available to everyone, all the time.',
    'The more your team uses it, the smarter it gets.',
    'No more scattered emails. No more lost knowledge. No more starting from scratch. Just a studio that runs like it should — from day one.',
  ] },
]

export default function HowItWorksSlide({ step = 0 }: { step?: number }) {
  const content = STEPS[step]
  const number = `0${step + 1}`
  return <div className={`how-slide how-slide--${step + 1}`} aria-labelledby={`how-slide-title-${number}`}>
    <aside className="how-step">
      <div className="how-step-top"><span className="how-step-number">{number}</span><span className="how-step-meta">Step<br />[ {number} / 03 ]</span></div>
      <div className="how-step-copy">
        <h2 id={`how-slide-title-${number}`}>{step === 1 ? <>Add a project.<br />Know everything<br />from day one.</> : content.title}</h2>
        {content.paragraphs.map((paragraph, index) => <p key={paragraph}>{step === 0 && index === 1 ? <strong>{paragraph}</strong> : paragraph}</p>)}
      </div>
    </aside>
    <div className="how-preview">
      <Image className="how-monitor" src={`/how-it-works/step-${step + 1}${step < 2 ? '-background' : ''}.png`} width={step === 2 ? 3700 : 4094} height={[2406, 2417, 2160][step]} sizes="(max-width: 767px) 100vw, 114vw" loading="eager" alt={[
        'Tesseral on a studio display, with document upload and stored studio knowledge.',
        'Tesseral connects project research, Figma, Notion and documents around the client.',
        'The Tesseral knowledge base connects the client brief, research and meeting room.',
      ][step]} />
    </div>
  </div>
}
