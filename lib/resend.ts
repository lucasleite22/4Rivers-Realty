import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('[resend] RESEND_API_KEY not set — emails will not be sent')
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? '')

export const FROM_ADDRESS = 'notifications@4riversrealty.com'
export const AGENT_EMAIL  = process.env.AGENT_NOTIFICATION_EMAIL ?? 'info@4riversrealty.com'
