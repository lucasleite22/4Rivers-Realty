// lib/upload.ts — File upload helpers

import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads', 'properties')
const LEAD_UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads', 'leads')

/**
 * Save an uploaded File to disk.
 * Returns the relative public URL (e.g. /uploads/properties/abc123/image.jpg)
 */
export async function saveUploadedFile(
  file: File,
  propertyId: string
): Promise<string> {
  const dir = path.join(UPLOAD_ROOT, propertyId)

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  const ext = path.extname(file.name) || '.jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const filepath = path.join(dir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)

  return `/uploads/properties/${propertyId}/${filename}`
}

/**
 * Save an uploaded File for a lead submission (visitor).
 * Returns the relative public URL (e.g. /uploads/leads/abc123/image.jpg)
 */
export async function saveLeadAttachment(
  file: File,
  leadId: string
): Promise<string> {
  const dir = path.join(LEAD_UPLOAD_ROOT, leadId)

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  const ext = path.extname(file.name) || '.jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const filepath = path.join(dir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)

  return `/uploads/leads/${leadId}/${filename}`
}

/**
 * Delete a file from disk given its relative public URL.
 */
export async function deleteUploadedFile(url: string): Promise<void> {
  try {
    // url example: /uploads/properties/abc123/image.jpg
    const relativePath = url.startsWith('/') ? url.slice(1) : url
    const filepath = path.join(process.cwd(), 'public', relativePath)
    if (existsSync(filepath)) {
      await unlink(filepath)
    }
  } catch (err) {
    console.error('[upload] Failed to delete file:', url, err)
  }
}
