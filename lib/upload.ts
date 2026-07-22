// lib/upload.ts — File upload helpers (Vercel Blob)
//
// A Vercel o filesystem de produção é somente leitura, então os arquivos
// não podem ser gravados em disco (public/uploads/...) como antes — por
// isso o upload de fotos usa o Vercel Blob Storage.

import { put, del } from '@vercel/blob'
import path from 'path'

function randomFilename(originalName: string): string {
  const ext = path.extname(originalName) || '.jpg'
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
}

/**
 * Save an uploaded File to Vercel Blob storage.
 * Returns the public URL of the uploaded file.
 */
export async function saveUploadedFile(
  file: File,
  propertyId: string
): Promise<string> {
  const filename = randomFilename(file.name)
  const blob = await put(`properties/${propertyId}/${filename}`, file, {
    access: 'public',
  })
  return blob.url
}

/**
 * Save an uploaded File for a lead submission (visitor).
 * Returns the public URL of the uploaded file.
 */
export async function saveLeadAttachment(
  file: File,
  leadId: string
): Promise<string> {
  const filename = randomFilename(file.name)
  const blob = await put(`leads/${leadId}/${filename}`, file, {
    access: 'public',
  })
  return blob.url
}

/**
 * Delete a file from Vercel Blob storage given its public URL.
 */
export async function deleteUploadedFile(url: string): Promise<void> {
  try {
    await del(url)
  } catch (err) {
    console.error('[upload] Failed to delete file:', url, err)
  }
}
