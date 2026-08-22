import type { MailAdapter } from './index'

// ponytail: Gmail adapter via REST API. Stub — swap in real API calls when env vars are set.

const API_BASE = 'https://gmail.googleapis.com/gmail/v1'

async function gmailFetch(path: string, options?: RequestInit) {
  const apiKey = process.env.GMAIL_API_KEY
  if (!apiKey) throw new Error('GMAIL_API_KEY not set')
  return fetch(`${API_BASE}${path}?key=${apiKey}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
}

function buildRawMessage(to: string, subject: string, body: string): string {
  const sender = process.env.GMAIL_SENDER_EMAIL ?? 'noreply@solo-suite.app'
  const message = [
    `From: ${sender}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    body,
  ].join('\r\n')
  return Buffer.from(message).toString('base64url')
}

export const gmailAdapter: MailAdapter = {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const raw = buildRawMessage(to, subject, body)
    const res = await gmailFetch('/users/me/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw }),
    })
    if (!res.ok) throw new Error(`Gmail send failed: ${res.status}`)
  },

  async sendTemplate(to: string, template: string, data: Record<string, string>): Promise<void> {
    let body = template
    for (const [key, value] of Object.entries(data)) {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    const subject = data.subject ?? 'Notification from Solo Suite'
    await gmailAdapter.sendEmail(to, subject, body)
  },
}
