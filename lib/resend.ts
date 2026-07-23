import { Resend } from 'resend'

export const FROM_ADDRESS = 'notifications@4riversrealty.us'
export const AGENT_EMAIL  = process.env.AGENT_NOTIFICATION_EMAIL ?? 'info@4riversrealty.us'

// Lazy singleton — only instantiated when actually sending an email.
// Avoids build-time failure when RESEND_API_KEY is not set (e.g. demo deploys).
let _client: Resend | null = null

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[resend] RESEND_API_KEY not set — emails will not be sent')
    return null
  }
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY)
  return _client
}
