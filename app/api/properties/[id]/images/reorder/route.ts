// ============================================================
// PATCH /api/properties/[id]/images/reorder
// Body: { images: [{ id: string, sort_order: number }] }
// Admin auth required
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

type Params = { params: { id: string } }

const reorderSchema = z.object({
  images: z.array(
    z.object({
      id:         z.string().uuid(),
      sort_order: z.number().int().min(0),
    })
  ).min(1),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { images } = parsed.data

  // Update each image's sort_order in parallel
  const updates = images.map(({ id, sort_order }) =>
    supabase
      .from('property_images')
      .update({ sort_order })
      .eq('id', id)
      .eq('property_id', params.id)
  )

  const results = await Promise.all(updates)
  const failed = results.filter((r) => r.error)

  if (failed.length > 0) {
    return NextResponse.json(
      { error: 'Some updates failed', details: failed.map((r) => r.error?.message) },
      { status: 500 }
    )
  }

  // Set first item (sort_order=0 or lowest) as cover
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
  if (sorted.length > 0) {
    // Clear all covers first, then set the new one
    await supabase
      .from('property_images')
      .update({ is_cover: false })
      .eq('property_id', params.id)

    await supabase
      .from('property_images')
      .update({ is_cover: true })
      .eq('id', sorted[0].id)
      .eq('property_id', params.id)
  }

  // Return updated list
  const { data, error } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', params.id)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
