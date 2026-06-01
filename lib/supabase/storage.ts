// ============================================================
// 4River Realty — Supabase Storage Helpers
// ============================================================

import { createClient } from './server'

const BUCKET = 'property-images'

// ── Types ─────────────────────────────────────────────────────

export interface StorageUploadResult {
  path: string
  url: string
}

// ── Helpers ───────────────────────────────────────────────────

/**
 * Upload a property image file to Supabase Storage.
 *
 * @param file       - The File / Blob to upload
 * @param propertyId - Used as the folder prefix: `{propertyId}/{filename}`
 * @returns          - Storage path and public URL
 */
export async function uploadPropertyImage(
  file: File,
  propertyId: string
): Promise<StorageUploadResult> {
  const supabase = createClient()

  // Build a unique filename to avoid collisions
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `${propertyId}/${filename}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  return {
    path,
    url: getPublicUrl(path),
  }
}

/**
 * Delete a property image from Supabase Storage by its public URL.
 *
 * @param url - Full public URL of the image
 */
export async function deletePropertyImage(url: string): Promise<void> {
  const supabase = createClient()

  const path = extractPathFromUrl(url)
  if (!path) throw new Error(`Cannot extract storage path from URL: ${url}`)

  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw new Error(`Storage delete failed: ${error.message}`)
}

/**
 * Delete all images for a given property (used when deleting the property).
 *
 * @param propertyId - The property UUID
 */
export async function deleteAllPropertyImages(propertyId: string): Promise<void> {
  const supabase = createClient()

  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(propertyId)

  if (listError) throw new Error(`Storage list failed: ${listError.message}`)
  if (!files || files.length === 0) return

  const paths = files.map((f) => `${propertyId}/${f.name}`)
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw new Error(`Storage bulk delete failed: ${error.message}`)
}

/**
 * Return the public URL for a given storage path.
 *
 * @param path - Storage path, e.g. `{propertyId}/{filename}`
 */
export function getPublicUrl(path: string): string {
  // We use the anon-accessible Supabase URL directly.
  // NEXT_PUBLIC_SUPABASE_URL must be set in env.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')

  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`
}

// ── Internal ──────────────────────────────────────────────────

/**
 * Extract the storage path from a Supabase public URL.
 * e.g. `https://<project>.supabase.co/storage/v1/object/public/property-images/abc/file.jpg`
 * → `abc/file.jpg`
 */
function extractPathFromUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}
