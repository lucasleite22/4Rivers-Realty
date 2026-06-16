'use client'

import { useEffect, useState } from 'react'
import { Building2, Users, TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react'

interface Stats {
  totalActiveProperties: number
  leadsThisMonth: number
  showingsThisMonth: number
  offersThisMonth: number
  closedThisMonth: number
  overdueFollowUps: number
  recentEvents: { id: string; type: string; entityType: string; createdAt: string; metadata: Record<string, string> }[]
}

const EVENT_LABELS: Record<string, string> = {
  LEAD_CREATED:       'New lead',
  LEAD_STAGE_CHANGED: 'Stage changed',
  PROPERTY_CREATED:   'Property added',
  SHOWING_SCHEDULED:  'Showing scheduled',
  OFFER_MADE:         'Offer made',
  DEAL_CLOSED:        'Deal closed',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const kpis = stats ? [
    { label: 'Active Properties', value: stats.totalActiveProperties, icon: Building2,    color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Leads This Month',  value: stats.leadsThisMonth,        icon: Users,         color: 'text-blue-400',  bg: 'bg-blue-400/10' },
    { label: 'Showings',          value: stats.showingsThisMonth,      icon: Calendar,      color: 'text-purple-400',bg: 'bg-purple-400/10' },
    { label: 'Closed This Month', value: stats.closedThisMonth,        icon: CheckCircle,   color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Offers Made',       value: stats.offersThisMonth,        icon: TrendingUp,    color: 'text-yellow-400',bg: 'bg-yellow-400/10' },
    { label: 'Overdue Follow-ups',value: stats.overdueFollowUps,       icon: AlertCircle,   color: 'text-red-400',   bg: 'bg-red-400/10' },
  ] : []

  return (
    <div className="min-h-full bg-[#0a1929] text-white p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-cormorant text-3xl font-bold">Dashboard</h1>
        <p className="font-barlow text-white/40 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {kpis.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
                <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className={`font-cormorant font-bold text-4xl ${color}`}>{value}</p>
                <p className="font-barlow text-white/40 text-xs mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="font-barlow font-semibold text-sm text-white/70 uppercase tracking-widest">
                Recent Activity
              </h2>
            </div>
            {stats?.recentEvents.length === 0 ? (
              <p className="font-barlow text-white/30 text-sm text-center py-10">No recent activity</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {stats?.recentEvents.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between px-6 py-3 hover:bg-white/3 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                      <span className="font-barlow text-sm text-white/70">
                        {EVENT_LABELS[ev.type] ?? ev.type}
                        {ev.metadata?.name && <span className="text-white font-semibold"> · {ev.metadata.name}</span>}
                        {ev.metadata?.title && <span className="text-white font-semibold"> · {ev.metadata.title}</span>}
                      </span>
                    </div>
                    <span className="font-barlow text-xs text-white/30 flex-shrink-0 ml-4">
                      {new Date(ev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
