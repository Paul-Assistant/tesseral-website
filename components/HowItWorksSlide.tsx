const KNOWLEDGE = [
  { title: 'Brief Template', detail: 'Our typical brief', count: '3,500', icon: 'brief' },
  { title: 'Studio SOPs', detail: 'Our process', count: '13,500', icon: 'process' },
  { title: 'Tone-of-voice', detail: 'How and what we do', count: '2,300', icon: 'voice' },
]

const STEPS = [
  { title: 'Feed your project', paragraphs: [
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

function KnowledgePreview() {
  const nodes = [
    { key: 'questionnaire', title: 'Questionnaire', detail: 'Client brand answers', count: '13,500 characters' },
    { key: 'guidelines', title: 'Brand Guidelines', detail: 'Visual Identity Book', count: '5,800 characters' },
    { key: 'mood', title: 'Mood Image', detail: 'Description of the document', count: 'JPEG, 2.3 MB' },
    { key: 'research', title: 'Online research', detail: 'Competitors, Key Stakeholders', count: '13,500 characters' },
  ]
  return <div className="how-network" role="img" aria-label="A connected client knowledge base with research, questionnaires, brand guidelines, mood imagery and a meeting room assistant">
    <div className="how-network-lines" aria-hidden="true">{nodes.map(node => <span key={node.key} className={`how-line how-line--${node.key}`} />)}<span className="how-line how-line--plus" /></div>
    <div className="how-client"><img src="/how-it-works/client.svg" alt="" /><div>Client Tesseral<small>Approved 30/4/2026</small></div></div>
    {nodes.map(node => <div key={node.key} className={`how-node how-node--${node.key}`}>
      <div className="how-node-icons"><img src={`/how-it-works/${node.key}.svg`} alt="" /><img src="/how-it-works/chevron.svg" alt="" /></div>
      <h3>{node.title}</h3><p>{node.detail}</p>
      {node.key === 'mood' && <img className="how-mood" src="/how-it-works/mood.png" alt="" />}
      <div className="how-node-meta"><span>30/4/2026</span><span>{node.count}</span></div>
    </div>)}
    <img className="how-network-plus" src="/how-it-works/plus.svg" alt="" />
    <div className="how-meeting"><h3>Meeting room</h3><p>Ask anything about this client — the assistant has access to the Brain and brief.</p><div className="how-meeting-input"><span>Ask about the client</span><img src="/how-it-works/send.svg" alt="" /></div></div>
  </div>
}

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
    {step === 1 ? <img className="how-research-preview" src="/how-it-works/project-research.png" width="834" height="825" alt="Tesseral automatically connects client research, competitors, key people, questionnaires and market knowledge around your project." /> : step === 2 ? <KnowledgePreview /> : <div className="how-demo" aria-label="A preview of adding and organizing knowledge in Tesseral">
      <div className="how-upload how-panel">
        <div className="how-field"><h3>Upload a document</h3>
          <a className="how-dropzone" href="https://app.tesseral.design" aria-label="Open Tesseral to upload a document">
            <img src="/how-it-works/upload.svg" width="40" height="40" alt="" />
            <span>Drag &amp; drop or click to browse</span>
          </a>
          <p className="how-file-types">Accepted file type: PDF, DOCX, TXT, MD</p>
        </div>
        <div className="how-field"><h3>Add manually</h3>
          <div className="how-input">Brand Guide<img src="/how-it-works/chevron.svg" width="14" height="14" alt="" /></div>
          <div className="how-textarea">Paste or type client information...</div>
          <a href="https://app.tesseral.design" className="how-add"><span>Add to brain</span><img src="/header/button.svg" width="40" height="40" alt="" /></a>
        </div>
      </div>
      <div className="how-stored how-panel"><h3>Stored knowledge</h3>
        {KNOWLEDGE.map(item => <div className="how-knowledge" key={item.title}>
          <img src={`/how-it-works/${item.icon}.svg`} width="24" height="24" alt="" />
          <div><h4>{item.title}</h4><p>{item.detail}</p><div className="how-knowledge-meta"><span>30/4/2026</span><span>{item.count} characters</span></div></div>
          <img className="how-chevron" src="/how-it-works/chevron.svg" width="14" height="14" alt="" />
        </div>)}
      </div>
    </div>}
    </div>
  </div>
}
