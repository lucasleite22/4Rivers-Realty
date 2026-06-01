// ============================================================
// GET /api/properties/featured
// Returns up to 6 featured active properties with images.
// Public — no auth required.
// ============================================================

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PropertyWithImages } from '@/types/properties'

export async function GET() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('*, images:property_images(*)')
    .eq('featured', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const properties: PropertyWithImages[] = (data ?? []).map((row) => {
    const images = (row.images ?? []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    )
    const cover = images.find((i: any) => i.is_cover) ?? images[0] ?? null
    return { ...row, images, cover_image_url: cover?.url ?? null }
  })

  return NextResponse.json(properties)
}
