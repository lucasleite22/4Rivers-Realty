// app/api/properties/[id]/images/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, AuthError } from '@/lib/auth'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/upload'

// ── POST /api/properties/[id]/images — upload ─

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req)

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    const url = await saveUploadedFile(file, params.id)

    // Determine sort order
    const lastImage = await prisma.propertyImage.findFirst({
      where: { propertyId: params.id },
      orderBy: { sortOrder: 'desc' },
    })
    const sortOrder = (lastImage?.sortOrder ?? -1) + 1

    // First image is cover by default
    const isFirst = sortOrder === 0

    const image = await prisma.propertyImage.create({
      data: {
        propertyId: params.id,
        url,
        isCover: isFirst,
        sortOrder,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/properties/[id]/images]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE /api/properties/[id]/images?imageId= ─

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req)

    const imageId = req.nextUrl.searchParams.get('imageId')
    if (!imageId) {
      return NextResponse.json({ error: 'imageId required' }, { status: 400 })
    }

    const image = await prisma.propertyImage.findUnique({ where: { id: imageId } })
    if (!image || image.propertyId !== params.id) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    await deleteUploadedFile(image.url)
    await prisma.propertyImage.delete({ where: { id: imageId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[DELETE /api/properties/[id]/images]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
