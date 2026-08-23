// ponytail: webhook URL validation — prevents SSRF, localhost, private network access.
// Every outbound fetch from workflows MUST go through validateWebhookUrl().

const BLOCKED_HOSTS = new Set([
  'localhost', '127.0.0.1', '::1', '[::1]',
  '0.0.0.0', 'metadata.google.internal',
  '169.254.169.254',
])

const PRIVATE_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^fc00:/i,
  /^fe80:/i,
  /^fd[0-9a-f]{2}:/i,
]

export function validateWebhookUrl(url: string): { valid: boolean; reason?: string } {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { valid: false, reason: 'Invalid URL format' }
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only HTTPS URLs are allowed' }
  }

  const hostname = parsed.hostname.toLowerCase()

  if (BLOCKED_HOSTS.has(hostname)) {
    return { valid: false, reason: 'Hostname is blocked' }
  }

  for (const range of PRIVATE_RANGES) {
    if (range.test(hostname)) {
      return { valid: false, reason: 'Private network addresses are blocked' }
    }
  }

  if (hostname.endsWith('.internal') || hostname.endsWith('.local')) {
    return { valid: false, reason: 'Internal/local hostnames are blocked' }
  }

  return { valid: true }
}
