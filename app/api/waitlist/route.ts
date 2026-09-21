export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Please send your request from the Tesseral website.' }, { status: 403 })
  let data: Record<string, unknown>
  try {
    const body = await request.text()
    if (body.length > 2048) return Response.json({ error: 'Please enter a valid email address.' }, { status: 413 })
    data = JSON.parse(body)
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid form')
  } catch { return Response.json({ error: 'Please check the form and try again.' }, { status: 400 }) }
  if (data.website) return Response.json({ ok: true })
  const email = typeof data.email === 'string' ? data.email.trim() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return Response.json({ error: 'Launch signups are temporarily unavailable. Please try again later.' }, { status: 503 })
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/waitlist?on_conflict=email`, {
      method: 'POST',
      headers: {
        apikey: key,
        ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({ email: email.toLowerCase() }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error('Delivery failed')
    return Response.json({ ok: true })
  } catch { return Response.json({ error: 'We couldn’t save your email. Please try again.' }, { status: 502 }) }
}
