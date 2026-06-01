import { NextResponse } from 'next/server'
import { createClient, requireAuth } from '@/lib/supabase/server'

export async function GET() {
  try {
    await requireAuth()
    const supabase = createClient()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const [
      activeLeads,
      showingLeads,
      offerLeads,
      closedWonThisMonth,
      overdueLeads,
      upcomingActivities,
    ] = await Promise.all([
      // Total active leads (not closed)
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .not('status', 'in', '(closed_won,closed_lost)'),

      // Leads in showing stage
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'showing'),

      // Leads with offer made
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'offer_made'),

      // Leads closed won this month
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'closed_won')
        .gte('updated_at', startOfMonth)
        .lte('updated_at', endOfMonth),

      // Leads overdue: active, last contact > 7 days ago (or never contacted)
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .not('status', 'in', '(closed_won,closed_lost)')
        .or(`last_contact_at.is.null,last_contact_at.lt.${sevenDaysAgoISO}`),

      // Upcoming activities in the next 7 days
      supabase
        .from('lead_activities')
        .select(`id, lead_id, type, notes, activity_date, lead:leads!lead_id(name)`)
        .gte('activity_date', now.toISOString())
        .lte(
          'activity_date',
          new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order('activity_date', { ascending: true })
        .limit(10),
    ])

    const stats = {
      total_active_leads: activeLeads.count ?? 0,
      leads_showing: showingLeads.count ?? 0,
      leads_offer_made: offerLeads.count ?? 0,
      leads_closed_won_this_month: closedWonThisMonth.count ?? 0,
      leads_overdue_followup: overdueLeads.count ?? 0,
      upcoming_activities: (upcomingActivities.data ?? []).map((a: any) => ({
        id: a.id,
        lead_id: a.lead_id,
        lead_name: a.lead?.name ?? 'Unknown',
        type: a.type,
        activity_date: a.activity_date,
        notes: a.notes,
      })),
    }

    return NextResponse.json({ data: stats })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[DASHBOARD/STATS]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
