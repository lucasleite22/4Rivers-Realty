'use server'

// ============================================================
// 4River Realty — Property Server Actions
// ============================================================

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  uploadPropertyImage,
  deletePropertyImage,
  deleteAllPropertyImages,
} from '@/lib/supabase/storage'
import type {
  CreatePropertyData,
  UpdatePropertyData,
  PropertyStatus,
  PropertyWithImages,
} from '@/types/properties'

// ── Helpers ───────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}

function revalidateProperties() {
  revalidatePath('/properties')
  revalidatePath('/admin/properties')
  revalidatePath('/')
}

// ── createProperty ────────────────────────────────────────────

/**
 * Create a new property, optionally uploading an array of image Files.
 *
 * @param data   - Property fields
 * @param images - Optional array of File objects (e.g. from a form upload)
 */
export async function createProperty(
  data: CreatePropertyData,
  images?: File[]
): Promise<PropertyWithImages> {
  const { supabase } = await requireAdmin()

  // 1. Insert property
  const { data: property, error } = await supabase
    .from('properties')
    .insert(data)
    .select()
    .single()

  if (error || !property) throw new Error(error?.message ?? 'Failed to create property')

  // 2. Upload images if provided
  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const { url } = await uploadPropertyImage(file, property.id)

      await supabase.from('property_images').insert({
        property_id: property.id,
        url,
        is_cover:   i === 0,
        sort_order: i,
      })
    }
  }

  revalidateProperties()

  // Return with images
  const { data: full, error: fetchError } = await supabase
    .from('properties')
    .select('*, images:property_images(*)')
    .eq('id', property.id)
    .single()

  if (fetchError || !full) throw new Error('Property created but could not be fetched')

  const imgs = (full.images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order)
  const cover = imgs.find((i: any) => i.is_cover) ?? imgs[0] ?? null

  return { ...full, images: imgs, cover_image_url: cover?.url ?? null }
}

// ── updateProperty ────────────────────────────────────────────

export async function updateProperty(
  id: string,
  data: UpdatePropertyData
): Promise<void> {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('properties')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/properties/${id}`)
  revalidateProperties()
}

// ── deleteProperty ────────────────────────────────────────────

export async function deleteProperty(id: string): Promise<void> {
  const { supabase } = await requireAdmin()

  // 1. Remove all images from storage
  try {
    await deleteAllPropertyImages(id)
  } catch (e: any) {
    console.warn('Storage cleanup warning:', e.message)
  }

  // 2. Delete property (cascade removes property_images rows)
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidateProperties()
}

// ── toggleFeatured ────────────────────────────────────────────

export async function toggleFeatured(id: string): Promise<boolean> {
  const { supabase } = await requireAdmin()

  // Fetch current value
  const { data: current, error: fetchError } = await supabase
    .from('properties')
    .select('featured')
    .eq('id', id)
    .single()

  if (fetchError || !current) throw new Error('Property not found')

  const newValue = !current.featured

  const { error } = await supabase
    .from('properties')
    .update({ featured: newValue })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidateProperties()

  return newValue
}

// ── updatePropertyStatus ──────────────────────────────────────

export async function updatePropertyStatus(
  id: string,
  status: PropertyStatus
): Promise<void> {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/properties/${id}`)
  revalidateProperties()
}

// ── addPropertyImage ──────────────────────────────────────────

/**
 * Upload and register a single image for an existing property.
 * Returns the new image record.
 */
export async function addPropertyImage(
  propertyId: string,
  file: File
): Promise<{ id: string; url: string; is_cover: boolean; sort_order: number }> {
  const { supabase } = await requireAdmin()

  const { url } = await uploadPropertyImage(file, propertyId)

  const { count } = await supabase
    .from('property_images')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId)

  const sortOrder = count ?? 0
  const isCover   = sortOrder === 0

  const { data, error } = await supabase
    .from('property_images')
    .insert({ property_id: propertyId, url, is_cover: isCover, sort_order: sortOrder })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to insert image record')

  revalidatePath(`/properties/${propertyId}`)

  return { id: data.id, url: data.url, is_cover: data.is_cover, sort_order: data.sort_order }
}

// ── removePropertyImage ───────────────────────────────────────

export async function removePropertyImage(
  propertyId: string,
  imageId: string
): Promise<void> {
  const { supabase } = await requireAdmin()

  const { data: img, error: fetchErr } = await supabase
    .from('property_images')
    .select('*')
    .eq('id', imageId)
    .eq('property_id', propertyId)
    .single()

  if (fetchErr || !img) throw new Error('Image not found')

  try {
    await deletePropertyImage(img.url)
  } catch (e: any) {
    console.warn('Storage delete warning:', e.message)
  }

  const { error } = await supabase
    .from('property_images')
    .delete()
    .eq('id', imageId)

  if (error) throw new Error(error.message)

  // Promote next image as cover if needed
  if (img.is_cover) {
    const { data: next } = await supabase
      .from('property_images')
      .select('id')
      .eq('property_id', propertyId)
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

  revalidatePath(`/properties/${propertyId}`)
}
