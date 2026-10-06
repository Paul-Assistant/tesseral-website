import { siteUrl, siteDescription } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return new Response(`# Tesseral

> ${siteDescription}

Tesseral is a shared knowledge workspace for studios, freelancers, agencies, and brands. Accounts are available at https://app.tesseral.design. New workspaces require email verification and checkout; invited users join their shared workspace or project without buying a plan.

## Product

- [How Tesseral works](${siteUrl}/#how-it-works): Bring files, brand assets, and external links together; connect their knowledge; ask questions, brainstorm, and develop pitches and presentations.
- [Who Tesseral is for](${siteUrl}/#tesseral-for): Studios, freelancers, agencies, and brands working with shared client or brand context.
- [Integrations](${siteUrl}/#integrations): Figma, Notion, Google documents, slides, and sheets. Sources sync and can be refreshed manually. Notion supports reading, updates, and task creation.
- [Plans](${siteUrl}/#pricing): Starter, Studio, and Agency. Consult the page for current prices and allowances.

## Shared context

The prompt library gives teams a shared starting point for images, video, and copy. MCP connects AI agents to current project knowledge, reducing repeated briefing and manual context copying.

## Get started

[Open Tesseral](https://app.tesseral.design): Sign in or create an account. Website Get started, Create your Tesseral, and plan selection buttons open the app.
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
