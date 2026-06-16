import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_ADDRESS, AGENT_EMAIL } from '@/lib/resend'
import { newLeadAgentEmail } from '@/lib/email-templates/new-lead-agent'
import { leadConfirmationEmail } from '@/lib/email-templates/lead-confirmation'
import { requireAuth, AuthError } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req)
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  try {
    const body = await req.json()
    const {
      leadId,
      leadName,
      leadEmail,
      leadPhone,
      leadType,
      leadOrigin,
      propertyInterest,
      budgetUsd,
      notes,
    } = body

    if (!leadName) {
      return NextResponse.json({ error: 'leadName is required' }, { status: 400 })
    }

    const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://4riversrealty.com'}/admin/leads`
    const agentPhone = process.env.AGENT_PHONE ?? '(352) 555-0100'

    const results = await Promise.allSettled([
      // 1 — Notify the agent
      resend.emails.send({
        from: FROM_ADDRESS,
        to: AGENT_EMAIL,
        subject: `New Lead: ${leadName} — 4Rivers Realty`,
        html: newLeadAgentEmail({
          leadName,
          leadEmail: leadEmail ?? null,
          leadPhone: leadPhone ?? null,
          leadType: leadType ?? 'BUYER',
          leadOrigin: leadOrigin ?? 'WEBSITE',
          propertyInterest: propertyInterest ?? null,
          budgetUsd: budgetUsd ?? null,
          notes: notes ?? null,
          adminUrl,
        }),
      }),

      // 2 — Confirm to the lead (only if they provided an email)
      ...(leadEmail
        ? [
            resend.emails.send({
              from: FROM_ADDRESS,
              to: leadEmail,
              subject: 'We received your message — 4Rivers Realty',
              html: leadConfirmationEmail({
                leadName,
                propertyInterest: propertyInterest ?? null,
                agentPhone,
                agentEmail: AGENT_EMAIL,
              }),
            }),
          ]
        : []),
    ])

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length > 0) {
      console.error('[notify/lead] Some emails failed:', failed)
    }

    return NextResponse.json({
      success: true,
      sent: results.length - failed.length,
      failed: failed.length,
    })
  } catch (err) {
    console.error('[POST /api/notify/lead]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
