// ============================================================
// 4River Realty — Property Portal Types
// ============================================================

import { Database } from './database'

// ── Raw table types from Supabase schema ──────────────────────
export type PropertyRow = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export type PropertyImageRow = Database['public']['Tables']['property_images']['Row']
export type PropertyImageInsert = Database['public']['Tables']['property_images']['Insert']

// ── Enum helpers ──────────────────────────────────────────────
export type PropertyType =
  | 'horse_farm'
  | 'ranch'
  | 'residential'
  | 'commercial'
  | 'land'

export type PropertyStatus = 'active' | 'sold' | 'under_contract'

// ── Composite types ───────────────────────────────────────────

/** Property row with its images joined */
export interface PropertyWithImages extends PropertyRow {
  images: PropertyImageRow[]
  /** Shortcut to the cover image URL (first image with is_cover=true, or first image) */
  cover_image_url: string | null
}

// ── Search / filter ───────────────────────────────────────────

export interface PropertyFilter {
  /** Full-text search across title + description + city + county */
  search?: string
  type?: PropertyType
  status?: PropertyStatus
  featured?: boolean
  price_min?: number
  price_max?: number
  acreage_min?: number
  acreage_max?: number
  county?: string
  city?: string
  /** Pagination — 1-based */
  page?: number
  /** Items per page (default 12, max 100) */
  limit?: number
  /** Sort field */
  sort_by?: 'price_usd' | 'acreage' | 'created_at' | 'title'
  sort_dir?: 'asc' | 'desc'
}

// ── List response ─────────────────────────────────────────────

export interface PropertyListResponse {
  data: PropertyWithImages[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// ── Image upload ──────────────────────────────────────────────

export interface ImageUploadResult {
  id: string
  url: string
  is_cover: boolean
  sort_order: number
}

export interface ReorderPayload {
  id: string
  sort_order: number
}

// ── Server Action payloads ────────────────────────────────────

export interface CreatePropertyData {
  title: string
  type: PropertyType
  price_usd?: number | null
  acreage?: number | null
  county?: string | null
  city?: string | null
  address?: string | null
  description?: string | null
  status?: PropertyStatus
  featured?: boolean
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
