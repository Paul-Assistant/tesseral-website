export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Please send your request from the Tesseral website.' }, { status: 403 })
  let data: Record<string, unknown>
  try {
    const body = await request.text()
    if (body.length > 12000) return Response.json({ error: 'Please keep your message under 4,000 characters.' }, { status: 413 })
    data = JSON.parse(body)
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid form')
  } catch { return Response.json({ error: 'Please check the form and try again.' }, { status: 400 }) }
  if (data.website) return Response.json({ ok: true })
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  const email = typeof data.email === 'string' ? data.email.trim() : ''
  const message = typeof data.message === 'string' ? data.message.trim() : ''
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !message || message.length > 4000) return Response.json({ error: 'Please enter your name, a valid email, and a message of up to 4,000 characters.' }, { status: 400 })
  const endpoint = process.env.INTEGRATION_REQUEST_WEBHOOK_URL
  const resendKey = process.env.RESEND_API_KEY
  const recipient = process.env.INTEGRATION_REQUEST_TO
  if (!endpoint && (!resendKey || !recipient)) return Response.json({ error: 'Requests are temporarily unavailable. Please try again later.' }, { status: 503 })
  try {
    const response = await fetch(endpoint || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(!endpoint ? { Authorization: `Bearer ${resendKey}` } : {}) },
      body: JSON.stringify(endpoint ? { name, email, message, source: 'tesseral-website', type: 'integration-request' } : {
        from: 'Tesseral <hello@tesseral.design>', to: [recipient], reply_to: email,
        subject: 'Tesseral integration request', text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error('Delivery failed')
    return Response.json({ ok: true })
  } catch { return Response.json({ error: 'Your request could not be sent. Please try again.' }, { status: 502 }) }
}
