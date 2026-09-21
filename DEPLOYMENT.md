# Tesseral deployment and launch

Repository branch: `codex/figma-header`. Vercel project: `tesseral-website`, team
`paul-assistant-5795s-projects`.

## Preview

`npm run deploy:staging` builds a preview, then updates
https://tesseral-website-staging.vercel.app only after a successful build.
It does not promote production or move the public domain.

## Required environments

| Variable | Production | Branch preview |
| --- | --- | --- |
| `SUPABASE_URL` | Existing dashboard project | Same project |
| `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) | Server secret | Server secret |
| `RESEND_API_KEY` | Server secret | Server secret |
| `INTEGRATION_REQUEST_TO` | `tom@garcy.studio` | `tom@garcy.studio` |
| `NEXT_PUBLIC_SITE_URL` | `https://tesseral.design` | Unset (staging default) |

Credentials must never have a `NEXT_PUBLIC_` prefix or appear in source control.
An optional `INTEGRATION_REQUEST_WEBHOOK_URL` overrides Resend delivery.

## Forms

Every signup CTA opens the email-only launch modal. `/api/waitlist` normalizes
email addresses and writes to the existing `public.waitlist` Supabase table.
The database supplies `id` and `subscribed_at`; its unique email constraint and
`resolution=ignore-duplicates` prevent duplicate entries. Success appears only
when the database accepts the request. This does not send a welcome email.

Integration requests are delivered through Resend from `hello@tesseral.design`
to `tom@garcy.studio`, with the submitter as reply-to. This sending address does
not establish an inbox. At the launch audit, the root domain had no MX records;
forwarding or a mailbox must be configured separately before advertising
`hello@tesseral.design` as a contact address. Privacy contact currently uses Tom.

Both routes validate input, reject mismatched Origin headers, and use honeypots.
Provider failures return an error instead of a false success. No form values are
sent in the custom analytics events. Do not log request bodies or credentials.

## Analytics

GA4 Measurement ID: `G-JNT8NMXQZB` (`lib/analytics.ts`). Google loads only after
opt-in, and only on `tesseral.design` or `www.tesseral.design`. Localhost and
Vercel previews never load the tag. The visitor can revise the choice through
footer Cookie settings. The choice expires after 180 days. Advertising storage,
ad personalization, and Google signals are disabled.

Tracked events: `waitlist_open`, `generate_lead` (successful waitlist response),
`waitlist_error`, `section_view`, `navigation_click`, `billing_change`,
`integration_open`, `integration_request`, `integration_error`, and `web_vital`.
Only fixed UI labels and numeric measurements are supplied. Web vitals recorded
before consent are intentionally not sent. Duplicate waitlist submissions can
still produce a successful lead event, so the database remains authoritative
for unique signups.

After public launch, confirm a consenting visit in GA Realtime, mark
`generate_lead` as a key event, and add event-scoped custom dimensions for
`section`, `source`, `billing`, `metric`, and `rating` as needed. Review GA data
retention and enhanced measurement settings; avoid collecting form contents or
personal data through additional tags. Analytics cannot count visitors who opt
out or block tracking. Use Vercel runtime logs for server errors.

## Search and AI discovery

Production is indexable only when `VERCEL_ENV=production` and the configured
canonical URL is a custom domain. Preview metadata is noindex and robots.txt
blocks crawling. Production robots allow public pages and exclude `/api/`;
the sitemap contains `/` and `/privacy`, not fragment URLs.

Homepage HTML contains the product text, headings, prices, and integration
information before JavaScript runs. Organization, WebSite, WebPage and
SoftwareApplication JSON-LD describe visible content without invented ratings
or reviews. The privacy page has its own canonical and metadata and does not
reuse homepage structured data. Social previews and the supplied favicon remain
in place. `/llms.txt` is a supplementary product guide, not a ranking guarantee;
Google says it does not use these files for Search.

After domain cutover, verify `tesseral.design` in Google Search Console, submit
`https://tesseral.design/sitemap.xml`, inspect the homepage live URL, and request
indexing. Add Bing Webmaster Tools if desired. Confirm HTTP and www redirect to
https://tesseral.design, and that no production response contains noindex.
Search rankings, indexing and real-user Core Web Vitals cannot be established
from a staging Lighthouse score. Real-user data needs sufficient traffic.

## Verification and release

- `node scripts/check-launch.mjs`: indexing rules, sitemap, consent, input
  validation, delivery routing and upstream error handling, using mocked providers.
- `npm run build`: optimized build and TypeScript checks.
- `NEXT_PUBLIC_SITE_URL=https://tesseral.design VERCEL_ENV=production npm run build`:
  validates public metadata locally without publishing.
- On staging: verify mobile/desktop layout, pricing buttons, billing switch,
  signup and integration modals, consent controls, navigation and reverse scroll.
- Verify a synthetic signup in Supabase and remove only that exact test record.
- Run PageSpeed Insights on desktop and mobile after deployment.

The current public root domain belongs to the older `landing` Vercel project.
Moving it to this project is a distinct release step after review. Preserve
`app.tesseral.design` on the existing dashboard project.

## Performance and motion

Fonts are losslessly compressed WOFF2; original OTF sources are retained.
Orbit cards start transparent at their final layout origin, then use transforms,
avoiding the old hydration layout jump. Animation pauses offscreen and in hidden
tabs and respects reduced motion. Heavy Spline content loads near its section.
Mobile scroll dimensions are recalculated only on width changes, avoiding browser
toolbar resize jumps. Keep these behaviors when modifying the scroll story.
