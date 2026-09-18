import Image from 'next/image'

const STEPS = [
  { title: 'Bring everything together.', paragraphs: [
    'Add your client’s files, brand assets, and links to the tools you already use. Your team gets one place to find what matters, with every source connected to the same Tesseral.',
    'Start with what you already have.',
  ] },
  { title: 'Give your team the whole picture.', paragraphs: [
    'Tesseral connects the knowledge across your sources into one shared brain for your client or brand. All sources sync automatically, and you can refresh them manually whenever you need.',
    'Everyone works from the same current context.',
  ] },
  { title: 'Turn that knowledge into your next idea.', paragraphs: [
    'Ask a question, brainstorm a direction, or develop a pitch or presentation. Your Tesseral brings the client’s knowledge into the conversation, whenever you need it.',
    'Keep moving without waiting for a teammate to fill in the gaps.',
  ] },
]

export default function HowItWorksSlide({ step = 0 }: { step?: number }) {
  const content = STEPS[step]
  const number = `0${step + 1}`
  return <div className={`how-slide how-slide--${step + 1}`} aria-labelledby={`how-slide-title-${number}`}>
    <aside className="how-step">
      <div className="how-step-top"><span className="how-step-number">{number}</span><span className="how-step-meta">Step<br />[ {number} / 03 ]</span></div>
      <div className="how-step-copy">
        <h2 id={`how-slide-title-${number}`}>{content.title}</h2>
        {content.paragraphs.map((paragraph, index) => <p key={paragraph}>{index === 1 ? <strong>{paragraph}</strong> : paragraph}</p>)}
      </div>
    </aside>
    <div className="how-preview">
      <Image className="how-monitor" src={`/how-it-works/step-${step + 1}${step < 2 ? '-background' : ''}.png`} width={step === 2 ? 3700 : 4094} height={[2406, 2417, 2160][step]} sizes="(max-width: 767px) 100vw, 114vw" loading="lazy" alt={[
        'Tesseral on a studio display, with document upload and stored studio knowledge.',
        'Tesseral connects project research, Figma, Notion and documents around the client.',
        'The Tesseral knowledge base connects the client brief, research and meeting room.',
      ][step]} />
    </div>
  </div>
}
