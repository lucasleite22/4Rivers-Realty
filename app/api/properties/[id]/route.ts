// ============================================================
// GET    /api/properties/[id]  — Public property detail
// PATCH  /api/properties/[id]  — Update property (admin auth)
// DELETE /api/properties/[id]  — Delete property (admin auth)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { deleteAllPropertyImages } from '@/lib/supabase/storage'
import type { PropertyWithImages } from '@/types/properties'

type Params = { params: { id: string } }

// ── GET ───────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('*, images:property_images(*)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  const images = (data.images ?? []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  )
  const cover = images.find((i: any) => i.is_cover) ?? images[0] ?? null
  const property: PropertyWithImages = {
    ...data,
    images,
    cover_image_url: cover?.url ?? null,
  }

  return NextResponse.json(property)
}

// ── PATCH ─────────────────────────────────────────────────────

const updateSchema = z.object({
  title:       z.string().min(1).optional(),
  type:        z.enum(['horse_farm','ranch','residential','commercial','land']).optional(),
  price_usd:   z.number().positive().nullable().optional(),
  acreage:     z.number().positive().nullable().optional(),
  county:      z.string().nullable().optional(),
  city:        z.string().nullable().optional(),
  address:     z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status:      z.enum(['active','sold','under_contract']).optional(),
  featured:    z.boolean().optional(),
  stables:     z.number().int().min(0).nullable().optional(),
  arenas:      z.number().int().min(0).nullable().optional(),
  pastures:    z.number().int().min(0).nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { data, error } = await supabase
    .from('properties')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// ── DELETE ────────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 1. Remove all images from storage
  try {
    await deleteAllPropertyImages(params.id)
  } catch (e: any) {
    console.warn('Storage cleanup error (continuing):', e.message)
  }

  // 2. Delete the property (cascade deletes property_images rows)
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
