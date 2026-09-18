# Staging

Use `npm run deploy:staging` for preview deployments. It builds on Vercel and then
points https://tesseral-website-staging.vercel.app at the successful deployment.
Keep sharing that URL; individual deployment URLs are historical snapshots.

Run from this repository with the Vercel CLI signed in to the
`paul-assistant-5795s-projects` team and linked to `tesseral-website`.
The command deploys a preview and does not promote production.

The homepage entrance fills at least one dynamic viewport. Its headline arrives
first, the spray follows, then navigation and calls to action. The rotating phrase
pauses for 1.4 seconds between transitions. The problem heading scrambles once as
it enters the viewport; reduced-motion visitors see static text.

The pinned story reveals five problem cards, then paints over them with three
alternating sweeps of the exported Figma spray. A brief horizontal shake accompanies
the paint. The title changes and five solution cards enter above the paint with
Figma's stronger 30px glass blur. Scrolling back reverses the sequence. Reduced
motion shows both sets as readable static lists, with no spray or shake.

The logo, four-icon glass menu and Signup remain fixed at the top. The pinned
story reserves space beneath that navigation on desktop and mobile.

## Launch waitlist

Signup CTAs open the shared email-only modal. `/api/waitlist` writes normalized
emails to the existing `public.waitlist` table in Tesseral's Supabase project.
The database supplies `id` and `subscribed_at`. Configure `SUPABASE_URL` and
`SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) in Vercel Preview.
Never use a `NEXT_PUBLIC_` prefix for the secret. Duplicate emails are ignored.
The form reports success only after Supabase accepts the write.

## Search and AI discovery

Set `NEXT_PUBLIC_SITE_URL` to the canonical public homepage origin before a
production deployment. Only `VERCEL_ENV=production` on a configured custom domain
is indexable; previews are noindex and disallow crawling. The production sitemap
contains the homepage URL, not fragment anchors or private API routes.
Organization, WebSite, WebPage, and SoftwareApplication JSON-LD describes existing
page content without invented reviews, ratings, or availability claims. `/llms.txt`
is an optional plain-text product guide, not a ranking guarantee or substitute
for HTML. Keep it synchronized with product changes.

After the public domain goes live, verify it in Google Search Console and Bing
Webmaster Tools, submit `/sitemap.xml`, inspect the live URL, and monitor Core Web
Vitals and indexing. Verify CDN/bot protection permits legitimate search crawlers,
including OAI-SearchBot. Robots rules are not access controls for API routes.
