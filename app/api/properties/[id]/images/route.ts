// ============================================================
// POST   /api/properties/[id]/images  — Upload image (admin)
// DELETE /api/properties/[id]/images  — Delete image (admin)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { uploadPropertyImage, deletePropertyImage } from '@/lib/supabase/storage'
import type { ImageUploadResult } from '@/types/properties'

type Params = { params: { id: string } }

// ── POST — upload ─────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Expect multipart/form-data with a "file" field
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate mime type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
      { status: 415 }
    )
  }

  // Max 10 MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 413 })
  }

  // 1. Upload to Supabase Storage
  const { url } = await uploadPropertyImage(file, params.id)

  // 2. Count existing images to set sort_order
  const { count } = await supabase
    .from('property_images')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', params.id)

  const sortOrder = count ?? 0

  // 3. Determine if this should be the cover (first image)
  const isCover = sortOrder === 0

  // 4. Insert into property_images table
  const { data, error } = await supabase
    .from('property_images')
    .insert({
      property_id: params.id,
      url,
      is_cover:   isCover,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result: ImageUploadResult = {
    id:         data.id,
    url:        data.url,
    is_cover:   data.is_cover,
    sort_order: data.sort_order,
  }

  return NextResponse.json(result, { status: 201 })
}

// ── DELETE — remove image ─────────────────────────────────────

const deleteSchema = z.object({
  image_id: z.string().uuid(),
})

export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'image_id is required' }, { status: 400 })
  }

  // Fetch image record
  const { data: img, error: fetchError } = await supabase
    .from('property_images')
    .select('*')
    .eq('id', parsed.data.image_id)
    .eq('property_id', params.id)
    .single()

  if (fetchError || !img) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  // 1. Remove from storage
  try {
    await deletePropertyImage(img.url)
  } catch (e: any) {
    console.warn('Storage delete error (continuing):', e.message)
  }

  // 2. Remove from DB
  const { error } = await supabase
    .from('property_images')
    .delete()
    .eq('id', img.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 3. If deleted image was the cover, promote next image
  if (img.is_cover) {
    const { data: next } = await supabase
      .from('property_images')
      .select('id')
      .eq('property_id', params.id)
      .order('sort_order', { ascending: true })
      .limit(1)
      .single()

    if (next) {
      await supabase
        .from('property_images')
        .update({ is_cover: true })
        .eq('id', next.id)
    }
  }

  return new NextResponse(null, { status: 204 })
}
