// ============================================================
// 4River Realty CRM — TypeScript Types
// ============================================================

// ---- Enums ----

export type UserRole = 'super_admin' | 'agent'

export type LeadType = 'buyer' | 'seller' | 'investor'

export type LeadOrigin =
  | 'Website'
  | 'Referral'
  | 'Zillow'
  | 'Realtor.com'
  | 'Instagram'
  | 'Other'

export type LeadStatus =
  | 'new_lead'
  | 'contacted'
  | 'showing'
  | 'offer_made'
  | 'under_contract'
  | 'closed_won'
  | 'closed_lost'

export type ActivityType = 'call' | 'email' | 'showing' | 'offer' | 'note'

export type PropertyType =
  | 'horse_farm'
  | 'ranch'
  | 'residential'
  | 'commercial'
  | 'land'

export type PropertyStatus = 'active' | 'sold' | 'under_contract'

// ---- Database row types ----

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  active: boolean
  created_at: string
}

export interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  type: LeadType
  origin: LeadOrigin
  property_interest: string | null
  budget_usd: number | null
  acreage_desired: number | null
  county_preferred: string | null
  status: LeadStatus
  featured: boolean
  notes: string | null
  assigned_to: string | null
  last_contact_at: string | null
  created_at: string
  updated_at: string
  // Joined fields (optional)
  assigned_user?: Pick<User, 'id' | 'name' | 'email'>
}

export interface LeadActivity {
  id: string
  lead_id: string
  user_id: string
  type: ActivityType
  notes: string | null
  activity_date: string
  created_at: string
  // Joined fields (optional)
  user?: Pick<User, 'id' | 'name'>
}

export interface Property {
  id: string
  title: string
  type: PropertyType
  price_usd: number | null
  acreage: number | null
  county: string | null
  city: string | null
  address: string | null
  description: string | null
  status: PropertyStatus
  featured: boolean
  stables: number
  arenas: number
  pastures: number
  created_at: string
  updated_at: string
  // Joined fields (optional)
  images?: PropertyImage[]
}

export interface PropertyImage {
  id: string
  property_id: string
  url: string
  is_cover: boolean
  sort_order: number
}

// ---- Input / mutation types ----

export interface CreateUserInput {
  email: string
  name: string
  role?: UserRole
  password: string
}

export interface UpdateUserInput {
  name?: string
  role?: UserRole
  active?: boolean
}

export interface CreateLeadInput {
  name: string
  email?: string | null
  phone?: string | null
  type?: LeadType
  origin?: LeadOrigin
  property_interest?: string | null
  budget_usd?: number | null
  acreage_desired?: number | null
  county_preferred?: string | null
  status?: LeadStatus
  featured?: boolean
  notes?: string | null
  assigned_to?: string | null
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  last_contact_at?: string | null
}

export interface MoveLeadStageInput {
  status: LeadStatus
}

export interface CreateActivityInput {
  type: ActivityType
  notes?: string | null
  activity_date?: string
}

export interface CreatePropertyInput {
  title: string
  type?: PropertyType
  price_usd?: number | null
  acreage?: number | null
  county?: string | null
  city?: string | null
  address?: string | null
  description?: string | null
  status?: PropertyStatus
  featured?: boolean
  stables?: number
  arenas?: number
  pastures?: number
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {}

// ---- API response types ----

export interface ApiSuccess<T> {
  data: T
}

export interface ApiError {
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ---- Dashboard stats ----

export interface DashboardStats {
  total_active_leads: number
  leads_showing: number
  leads_offer_made: number
  leads_closed_won_this_month: number
  leads_overdue_followup: number
  upcoming_activities: UpcomingActivity[]
}

export interface UpcomingActivity {
  id: string
  lead_id: string
  lead_name: string
  type: ActivityType
  activity_date: string
  notes: string | null
}

// ---- Query filter types ----

export interface LeadFilters {
  status?: LeadStatus
  type?: LeadType
  county?: string
  search?: string
  assigned_to?: string
  page?: number
  limit?: number
}

export interface PropertyFilters {
  status?: PropertyStatus
  type?: PropertyType
  county?: string
  min_price?: number
  max_price?: number
  min_acreage?: number
  featured?: boolean
  page?: number
  limit?: number
}
