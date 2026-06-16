// app/api/list-property/route.ts — visitor seller submission with optional image uploads

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { saveLeadAttachment } from '@/lib/upload'
import { Prisma } from '@prisma/client'

const MAX_FILES = 8
const MAX_SIZE  = 5 * 1024 * 1024 // 5 MB per file

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const name    = (formData.get('name')    as string | null)?.trim()
    const email   = (formData.get('email')   as string | null)?.trim() || undefined
    const phone   = (formData.get('phone')   as string | null)?.trim() || undefined
    const address = (formData.get('address') as string | null)?.trim()
    const county  = (formData.get('county')  as string | null)?.trim() || undefined
    const type    = (formData.get('propertyType') as string | null)?.trim()
    const acreage = (formData.get('acreage') as string | null)?.trim() || undefined
    const price   = (formData.get('askingPrice') as string | null)?.trim() || undefined
    const notes   = (formData.get('notes')   as string | null)?.trim() || undefined

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!address) {
      return NextResponse.json({ error: 'Property address is required' }, { status: 400 })
    }

    const propertyInterest = [type, address, county ? `${county} County` : '', acreage ? `${acreage} acres` : '']
      .filter(Boolean).join(' — ')

    const notesLines = [
      `SELLER LISTING REQUEST`,
      address && `Address: ${address}`,
      county  && `County: ${county}`,
      type    && `Type: ${type}`,
      acreage && `Acreage: ${acreage}`,
      price   && `Asking: $${price}`,
      notes   && `Details: ${notes}`,
    ].filter(Boolean).join('\n')

    // Create lead first so we have an ID for the upload path
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        type: 'SELLER',
        origin: 'WEBSITE',
        propertyInterest,
        budgetUsd: price ? new Prisma.Decimal(price) : undefined,
        notes: notesLines,
        status: 'NEW_LEAD',
      },
    })

    // Save uploaded images (optional)
    const files = formData.getAll('images') as File[]
    const validFiles = files
      .filter((f) => f instanceof File && f.size > 0)
      .slice(0, MAX_FILES)

    const imageUrls: string[] = []
    for (const file of validFiles) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > MAX_SIZE) continue

      const url = await saveLeadAttachment(file, lead.id)
      imageUrls.push(url)
    }

    // Append image URLs to lead notes
    if (imageUrls.length > 0) {
      const updated = `${lead.notes ?? ''}\n\nAttachments:\n${imageUrls.join('\n')}`
      await prisma.lead.update({
        where: { id: lead.id },
        data: { notes: updated },
      })
    }

    await prisma.dashboardEvent.create({
      data: {
        type: 'LEAD_CREATED',
        entityId: lead.id,
        entityType: 'Lead',
        metadata: { name: lead.name, origin: 'WEBSITE', type: 'SELLER' },
      },
    })

    return NextResponse.json({ id: lead.id, images: imageUrls }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/list-property]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
