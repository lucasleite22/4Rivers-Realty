import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { rateLimit, getIp } from '@/lib/rateLimit'
import { resend, FROM_ADDRESS, AGENT_EMAIL } from '@/lib/resend'
import { newLeadAgentEmail } from '@/lib/email-templates/new-lead-agent'
import { leadConfirmationEmail } from '@/lib/email-templates/lead-confirmation'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  // 10 requests per IP per 15 minutes — prevents contact-form spam
  const { allowed, resetAt } = rateLimit(`contact:${getIp(req)}`, 10, 15 * 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests — please wait a few minutes.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    )
  }

  try {
    const body = await req.json()

    const { name, email, phone, propertyInterest, notes, origin, type } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        email: email?.trim() ?? null,
        phone: phone?.trim() ?? null,
        type: type ?? 'BUYER',
        origin: origin ?? 'WEBSITE',
        propertyInterest: propertyInterest ?? null,
        status: 'NEW_LEAD',
        notes: notes?.trim() ?? null,
      },
    })

    // Log dashboard event so the CRM feed picks it up
    await prisma.dashboardEvent.create({
      data: {
        type: 'LEAD_CREATED',
        entityId: lead.id,
        entityType: 'Lead',
        metadata: {
          name: lead.name,
          origin: lead.origin,
          source: 'contact_form',
        },
      },
    })

    // Fire emails in the background — don't block the response
    const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://4riversrealty.com'}/admin/leads`
    const agentPhone = process.env.AGENT_PHONE ?? '(352) 555-0100'

    Promise.allSettled([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: AGENT_EMAIL,
        subject: `New Lead: ${lead.name} — 4Rivers Realty`,
        html: newLeadAgentEmail({
          leadName: lead.name,
          leadEmail: lead.email,
          leadPhone: lead.phone,
          leadType: lead.type,
          leadOrigin: lead.origin,
          propertyInterest: lead.propertyInterest,
          budgetUsd: null,
          notes: lead.notes,
          adminUrl,
        }),
      }),
      ...(lead.email
        ? [resend.emails.send({
            from: FROM_ADDRESS,
            to: lead.email,
            subject: 'We received your message — 4Rivers Realty',
            html: leadConfirmationEmail({
              leadName: lead.name,
              propertyInterest: lead.propertyInterest,
              agentPhone,
              agentEmail: AGENT_EMAIL,
            }),
          })]
        : []),
    ]).catch((err) => console.error('[contact email]', err))

    return NextResponse.json(
      { success: true, id: lead.id },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
