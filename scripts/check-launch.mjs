import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

function moduleFrom(file, mocks = {}) {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  new Function('exports', 'require', js)(exports, name => mocks[name])
  return exports
}

const oldEnv = { ...process.env }
for (const [environment, url, indexable] of [['preview', 'https://tesseral.design', false], ['production', 'https://tesseral.design', true], ['production', 'https://example.vercel.app', false]]) {
  process.env.VERCEL_ENV = environment; process.env.NEXT_PUBLIC_SITE_URL = url
  const site = moduleFrom('lib/site.ts')
  assert.equal(site.isIndexable, indexable)
  const robots = moduleFrom('app/robots.ts', { '@/lib/site': site }).default()
  const sitemap = moduleFrom('app/sitemap.ts', { '@/lib/site': site }).default()
  assert.deepEqual(robots.rules.disallow, indexable ? ['/api/'] : '/')
  assert.equal(sitemap.length, indexable ? 2 : 0)
  if (indexable) { assert.equal(robots.sitemap, `${url}/sitemap.xml`); assert.equal(robots.rules.allow, '/'); assert.deepEqual(sitemap.map(x => x.url), [`${url}/`, `${url}/privacy`]) }
}
process.env = oldEnv

const analytics = moduleFrom('lib/analytics.ts')
let saved = null; const events = []
globalThis.localStorage = { getItem: () => saved }
globalThis.window = { tesseralAnalyticsAllowed: false, gtag: (...args) => events.push(args) }
assert.equal(analytics.readAnalyticsConsent(), null)
saved = JSON.stringify({ allowed: true, savedAt: Date.now() }); assert.equal(analytics.readAnalyticsConsent(), true)
saved = JSON.stringify({ allowed: false, savedAt: Date.now() }); assert.equal(analytics.readAnalyticsConsent(), false)
saved = JSON.stringify({ allowed: true, savedAt: Date.now() - 181 * 86400000 }); assert.equal(analytics.readAnalyticsConsent(), null)
saved = '{bad'; assert.equal(analytics.readAnalyticsConsent(), null)
analytics.trackEvent('generate_lead', { source: 'pricing' }); assert.equal(events.length, 0)
window.tesseralAnalyticsAllowed = true
analytics.trackEvent('generate_lead', { source: 'pricing' }); assert.deepEqual(events, [['event', 'generate_lead', { source: 'pricing' }]])

// Exercise route behavior with a stubbed delivery provider; never sends mail.
const integration = moduleFrom('app/api/integration-request/route.ts').POST
const waitlist = moduleFrom('app/api/waitlist/route.ts').POST
let calls = []
globalThis.fetch = async (url, init) => { calls.push({ url, ...init }); return new Response(null, { status: 200 }) }
const request = (body, origin = 'https://tesseral.design') => new Request('https://tesseral.design/api/integration-request', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const valid = { name: 'Launch verification', email: 'test@example.com', message: 'Test request' }
assert.equal((await integration(request(valid, 'https://unrelated.example'))).status, 403)
assert.equal((await integration(request({ ...valid, email: 'invalid' }))).status, 400)
assert.equal((await integration(request({ ...valid, website: 'bot' }))).status, 200)
assert.equal(calls.length, 0)
delete process.env.INTEGRATION_REQUEST_WEBHOOK_URL
process.env.RESEND_API_KEY = 'test-only'; process.env.INTEGRATION_REQUEST_TO = 'tom@garcy.studio'
assert.equal((await integration(request(valid))).status, 200)
assert.equal(calls[0].url, 'https://api.resend.com/emails')
assert.deepEqual(JSON.parse(calls[0].body).to, ['tom@garcy.studio'])
assert.equal(JSON.parse(calls[0].body).reply_to, valid.email)
process.env.SUPABASE_URL = 'https://test-only.example'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only'
assert.equal((await waitlist(request({ email: 'TEST@EXAMPLE.COM' }))).status, 200)
assert.equal(JSON.parse(calls[1].body).email, 'test@example.com')
assert.equal(calls[1].headers.Prefer, 'resolution=ignore-duplicates,return=minimal')
globalThis.fetch = async () => new Response(null, { status: 500 })
assert.equal((await integration(request(valid))).status, 502)
assert.equal((await waitlist(request({ email: 'test@example.com' }))).status, 502)
console.log('Passed: production/preview SEO rules, sitemap, consent expiry and event gating, input validation, delivery routing, waitlist normalization, upstream failures.')
