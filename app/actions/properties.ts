'use server'

// ============================================================
// 4Rivers Realty — Property Server Actions (Prisma/MySQL)
// ============================================================

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/upload'

// ── Helpers ───────────────────────────────────────────────────

function revalidateProperties() {
  revalidatePath('/properties')
  revalidatePath('/admin/properties')
  revalidatePath('/')
}

// ── createProperty ────────────────────────────────────────────

export async function createProperty(
  data: {
    title: string
    type: string
    priceUsd: number
    acreage: number
    county: string
    city: string
    address: string
    description: string
    status?: string
    featured?: boolean
    showOnPortal?: boolean
    stables?: number | null
    arenas?: number | null
    pastures?: number | null
  },
  images?: File[]
) {
  const property = await prisma.property.create({
    data: {
      title: data.title,
      type: data.type as any,
      priceUsd: new Prisma.Decimal(data.priceUsd),
      acreage: new Prisma.Decimal(data.acreage),
      county: data.county,
      city: data.city,
      address: data.address,
      description: data.description,
      status: (data.status as any) ?? 'ACTIVE',
      featured: data.featured ?? true,
      showOnPortal: data.showOnPortal ?? true,
      stables: data.stables ?? null,
      arenas: data.arenas ?? null,
      pastures: data.pastures ?? null,
    },
  })

  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      const url = await saveUploadedFile(images[i], property.id)
      await prisma.propertyImage.create({
        data: { propertyId: property.id, url, isCover: i === 0, sortOrder: i },
      })
    }
  }

  await prisma.dashboardEvent.create({
    data: { type: 'PROPERTY_CREATED', entityId: property.id, entityType: 'Property', metadata: { title: property.title } },
  })

  revalidateProperties()

  return prisma.property.findUnique({
    where: { id: property.id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
}

// ── updateProperty ────────────────────────────────────────────

export async function updateProperty(id: string, data: Prisma.PropertyUpdateInput) {
  await prisma.property.update({ where: { id }, data })
  revalidatePath(`/properties/${id}`)
  revalidateProperties()
}

// ── deleteProperty ────────────────────────────────────────────

export async function deleteProperty(id: string) {
  const images = await prisma.propertyImage.findMany({ where: { propertyId: id } })
  for (const img of images) {
    await deleteUploadedFile(img.url)
  }
  await prisma.property.delete({ where: { id } })
  revalidateProperties()
}

// ── toggleFeatured ────────────────────────────────────────────

export async function toggleFeatured(id: string): Promise<boolean> {
  const current = await prisma.property.findUnique({ where: { id }, select: { featured: true } })
  if (!current) throw new Error('Property not found')
  const newValue = !current.featured
  await prisma.property.update({ where: { id }, data: { featured: newValue } })
  revalidateProperties()
  return newValue
}

// ── updatePropertyStatus ──────────────────────────────────────

export async function updatePropertyStatus(id: string, status: string) {
  await prisma.property.update({ where: { id }, data: { status: status as any } })
  if (status === 'SOLD') {
    await prisma.dashboardEvent.create({
      data: { type: 'PROPERTY_SOLD', entityId: id, entityType: 'Property' },
    })
  }
  revalidatePath(`/properties/${id}`)
  revalidateProperties()
}

// ── addPropertyImage ──────────────────────────────────────────

export async function addPropertyImage(propertyId: string, file: File) {
  const url = await saveUploadedFile(file, propertyId)
  const count = await prisma.propertyImage.count({ where: { propertyId } })
  const image = await prisma.propertyImage.create({
    data: { propertyId, url, isCover: count === 0, sortOrder: count },
  })
  revalidatePath(`/properties/${propertyId}`)
  return image
}

// ── removePropertyImage ───────────────────────────────────────

export async function removePropertyImage(propertyId: string, imageId: string) {
  const img = await prisma.propertyImage.findUnique({ where: { id: imageId } })
  if (!img || img.propertyId !== propertyId) throw new Error('Image not found')

  await deleteUploadedFile(img.url)
  await prisma.propertyImage.delete({ where: { id: imageId } })

  // Promote next image as cover if needed
  if (img.isCover) {
    const next = await prisma.propertyImage.findFirst({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' },
    })
    if (next) {
      await prisma.propertyImage.update({ where: { id: next.id }, data: { isCover: true } })
    }
  }

  revalidatePath(`/properties/${propertyId}`)
}
