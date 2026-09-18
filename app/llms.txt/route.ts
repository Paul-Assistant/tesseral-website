import { siteUrl, siteDescription } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(`# Tesseral

> ${siteDescription}

Tesseral is a shared knowledge workspace for studios, freelancers, agencies, and brands. Public access is currently offered through a launch notification signup, not immediate account creation.

## Product

- [How Tesseral works](${siteUrl}/#how-it-works): Bring files, brand assets, and external links together; connect their knowledge; ask questions, brainstorm, and develop pitches and presentations.
- [Who Tesseral is for](${siteUrl}/#tesseral-for): Studios, freelancers, agencies, and brands working with shared client or brand context.
- [Integrations](${siteUrl}/#integrations): Figma, Notion, Google documents, slides, and sheets. Sources sync and can be refreshed manually. Notion supports reading, updates, and task creation.
- [Plans](${siteUrl}/#pricing): Starter, Studio, and Agency. Consult the page for current prices and allowances.

## Shared context

The prompt library gives teams a shared starting point for images, video, and copy. MCP connects AI agents to current project knowledge, reducing repeated briefing and manual context copying.

## Launch

[Join the launch notification list](${siteUrl}/): Use any Get started, Create your Tesseral, or plan selection button to open the email signup form.
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
