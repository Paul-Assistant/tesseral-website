const KNOWLEDGE = [
  { title: 'Brief Template', detail: 'Our typical brief', count: '3,500', icon: 'brief' },
  { title: 'Studio SOPs', detail: 'Our process', count: '13,500', icon: 'process' },
  { title: 'Tone-of-voice', detail: 'How and what we do', count: '2,300', icon: 'voice' },
]

export default function HowItWorksSlide() {
  return <div className="how-slide" aria-labelledby="how-slide-title">
    <aside className="how-step">
      <div className="how-step-top"><span className="how-step-number">01</span><span className="how-step-meta">Step<br />[ 01 / 03 ]</span></div>
      <div className="how-step-copy">
        <h2 id="how-slide-title">Feed your project</h2>
        <p>Onboarding is customized to you. Tell Tesseral how your studio works, what you value, how you think. It learns your process, your voice, your standards.</p>
        <p><strong>It adapts to you — not the other way around.</strong></p>
      </div>
    </aside>
    <div className="how-demo" aria-label="A preview of adding and organizing knowledge in Tesseral">
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
    </div>
  </div>
}
