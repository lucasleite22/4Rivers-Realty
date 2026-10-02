'use client'

// Shared auto-repeat sync runner, lifted out of app/(platform)/admin/mls-sync/page.tsx
// and into a context provided by the admin layout (app/(platform)/admin/layout.tsx).
//
// The admin layout's children swap on every route change, but the layout
// itself — and anything it renders ABOVE {children}, like this provider —
// stays mounted for as long as the user stays inside /admin/*. Previously
// this state (and its setInterval) lived directly in the mls-sync page
// component, so navigating to any other admin page unmounted it and
// silently killed the auto-repeat loop. Living here instead means it keeps
// running across admin pages; it still stops on a full page reload, a tab
// close, or navigating outside /admin (e.g. "View Site" or logout), since
// those actually tear down the React tree.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

export type MlsStatus = 'Active' | 'Pending' | 'Active Under Contract' | 'Closed'
export type MlsPropertyType = 'Residential' | 'Land' | 'Commercial' | 'Farm'

export interface SyncStats {
  created: number
  updated: number
  removed: number
  unpublishedNotIdx: number
  skippedNotAuthorized: number
  skippedOffMarket: number
  skippedAlreadySold: number
  skippedOutOfArea: number
  pagesProcessed: number
}

const EMPTY_STATS: SyncStats = {
  created: 0, updated: 0, removed: 0, unpublishedNotIdx: 0,
  skippedNotAuthorized: 0, skippedOffMarket: 0, skippedAlreadySold: 0,
  skippedOutOfArea: 0, pagesProcessed: 0,
}

function sumStats(a: SyncStats, b: SyncStats): SyncStats {
  const out = { ...a }
  for (const key of Object.keys(b) as (keyof SyncStats)[]) out[key] += b[key]
  return out
}

interface MlsSyncRunnerState {
  statuses: MlsStatus[]
  propertyType: MlsPropertyType | ''
  maxPages: number
  running: boolean
  autoRepeat: boolean
  lastStats: SyncStats | null
  totalStats: SyncStats
  runCount: number
  lastRunAt: Date | null
  error: string | null
  setStatuses: (s: MlsStatus[]) => void
  toggleStatus: (s: MlsStatus) => void
  setPropertyType: (t: MlsPropertyType | '') => void
  setMaxPages: (n: number) => void
  runOnce: () => Promise<void>
  setAutoRepeat: (v: boolean) => void
}

const MlsSyncRunnerContext = createContext<MlsSyncRunnerState | null>(null)

export function MlsSyncRunnerProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<MlsStatus[]>(['Active', 'Pending', 'Active Under Contract'])
  const [propertyType, setPropertyType] = useState<MlsPropertyType | ''>('')
  const [maxPages, setMaxPages] = useState(2)
  const [running, setRunning] = useState(false)
  const [autoRepeat, setAutoRepeat] = useState(false)
  const [lastStats, setLastStats] = useState<SyncStats | null>(null)
  const [totalStats, setTotalStats] = useState<SyncStats>(EMPTY_STATS)
  const [runCount, setRunCount] = useState(0)
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Refs mirroring the latest filter state so the interval callback (set up
  // once per autoRepeat toggle) always reads current values instead of
  // whatever was current when the interval was created.
  const statusesRef = useRef(statuses)
  statusesRef.current = statuses
  const propertyTypeRef = useRef(propertyType)
  propertyTypeRef.current = propertyType
  const maxPagesRef = useRef(maxPages)
  maxPagesRef.current = maxPages

  function toggleStatus(s: MlsStatus) {
    setStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  async function runOnce() {
    setRunning(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/mls-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statuses: statusesRef.current,
          propertyType: propertyTypeRef.current || undefined,
          maxPages: maxPagesRef.current,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Sync failed')
      setLastStats(data)
      setTotalStats((prev) => sumStats(prev, data))
      setRunCount((prev) => prev + 1)
      setLastRunAt(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setAutoRepeat(false) // stop the loop on failure instead of hammering a broken endpoint
    } finally {
      setRunning(false)
    }
  }

  useEffect(() => {
    if (!autoRepeat) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    runOnce()
    intervalRef.current = setInterval(runOnce, 120_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRepeat])

  return (
    <MlsSyncRunnerContext.Provider
      value={{
        statuses, propertyType, maxPages, running, autoRepeat,
        lastStats, totalStats, runCount, lastRunAt, error,
        setStatuses, toggleStatus, setPropertyType, setMaxPages, runOnce, setAutoRepeat,
      }}
    >
      {children}
    </MlsSyncRunnerContext.Provider>
  )
}

export function useMlsSyncRunner() {
  const ctx = useContext(MlsSyncRunnerContext)
  if (!ctx) throw new Error('useMlsSyncRunner must be used within MlsSyncRunnerProvider')
  return ctx
}
