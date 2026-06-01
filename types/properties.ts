// ============================================================
// 4Rivers Realty — Property Types (Prisma/MySQL)
// ============================================================

import type { Property, PropertyImage } from '@prisma/client'

// ── Re-exports from Prisma ────────────────────────────────────
export type PropertyRow = Property
export type PropertyImageRow = PropertyImage

// ── Enum helpers ──────────────────────────────────────────────
export type PropertyType =
  | 'HORSE_FARM'
  | 'RANCH'
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'LAND'

export type PropertyStatus = 'ACTIVE' | 'SOLD' | 'UNDER_CONTRACT'

// ── Composite types ───────────────────────────────────────────

export interface PropertyWithImages extends Property {
  images: PropertyImage[]
  coverImageUrl?: string | null
}

// ── Search / filter ───────────────────────────────────────────

export interface PropertyFilter {
  search?: string
  type?: PropertyType
  status?: PropertyStatus
  featured?: boolean
  minPrice?: number
  maxPrice?: number
  minAcreage?: number
  county?: string
  page?: number
  limit?: number
}

// ── List response ─────────────────────────────────────────────

export interface PropertyListResponse {
  data: PropertyWithImages[]
  meta: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// ── Image helpers ─────────────────────────────────────────────

export interface ImageUploadResult {
  id: string
  url: string
  isCover: boolean
  sortOrder: number
}

export interface ReorderPayload {
  id: string
  sortOrder: number
  isCover?: boolean
}

// ── Server Action payloads ────────────────────────────────────

export interface CreatePropertyData {
  title: string
  type: PropertyType
  priceUsd: number
  acreage: number
  county: string
  city: string
  address: string
  description: string
  status?: PropertyStatus
  featured?: boolean
  showOnPortal?: boolean
  stables?: number | null
  arenas?: number | null
  pastures?: number | null
}

export type UpdatePropertyData = Partial<CreatePropertyData>

// ── API error shape ───────────────────────────────────────────

export interface ApiError {
  error: string
  details?: string
}
