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

Signup CTAs open the shared email-only modal. The server route `/api/waitlist`
writes normalized emails to `public.launch_waitlist` in the existing Tesseral
Supabase project. Apply `supabase/migrations/20260918120000_launch_waitlist.sql`
to that project, then configure `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
(or the legacy `SUPABASE_SERVICE_ROLE_KEY`) in Vercel's Preview environment.
Never use a `NEXT_PUBLIC_` prefix for the secret. Duplicate emails are ignored.
The table has RLS enabled and no anonymous or authenticated client access.
The form reports success only after Supabase accepts the write; missing
configuration or delivery failures show a retry message.
