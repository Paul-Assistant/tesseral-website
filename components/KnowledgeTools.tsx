import './knowledge-tools.css'

const TOOLS = [
  { id: 'prompts', label: 'Shared prompt library', icon: '/problem/card-icon.svg', title: 'Your brand, in every prompt.', copy: 'Build a shared prompt library from your Tesseral. Give your team a consistent starting point for images, video, and copy—with your brand’s context built in.', examples: ['Images', 'Video', 'Copy'] },
  { id: 'agents', label: 'MCP connection', icon: '/pricing/studio.svg', title: 'Your agents, already briefed.', copy: 'Connect your project to an AI agent through MCP. Give it access to the same up-to-date knowledge your team uses, without copying the context into every conversation.', examples: ['Claude', 'Cursor', 'Your agents'] },
]

export default function KnowledgeTools() {
  return <section className="knowledge-tools" aria-label="Create with your brand knowledge">
    {TOOLS.map(tool => <article key={tool.id} className="knowledge-tool">
      <div className="knowledge-tool-top"><img src={tool.icon} width="40" height="40" alt="" /><span>{tool.label}</span></div>
      <h2>{tool.title}</h2><p>{tool.copy}</p>
      <ul aria-label={tool.id === 'prompts' ? 'Create consistent prompts for' : 'Connect your knowledge to'}>{tool.examples.map(example => <li key={example}>{example}</li>)}</ul>
    </article>)}
  </section>
}
