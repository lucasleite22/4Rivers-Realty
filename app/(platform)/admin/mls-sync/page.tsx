'use client'

import { RefreshCw, Play, Square } from 'lucide-react'
import {
  useMlsSyncRunner,
  type MlsStatus,
  type MlsPropertyType,
  type SyncStats,
} from '@/components/admin/MlsSyncRunnerContext'

const STATUS_OPTIONS: { value: MlsStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Active Under Contract', label: 'Under Contract' },
  { value: 'Closed', label: 'Closed (sold)' },
]

const TYPE_OPTIONS: { value: ''; label: string } | { value: MlsPropertyType; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Land', label: 'Land' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Farm', label: 'Farm' },
] as any

const STAT_LABELS: Record<keyof SyncStats, string> = {
  created: 'Created',
  updated: 'Updated',
  removed: 'Removed',
  unpublishedNotIdx: 'Unpublished (not IDX)',
  skippedNotAuthorized: 'Skipped (not authorized)',
  skippedOffMarket: 'Skipped (off market)',
  skippedAlreadySold: 'Skipped (already sold)',
  skippedOutOfArea: 'Skipped (out of area)',
  pagesProcessed: 'Pages processed',
}

export default function AdminMlsSyncPage() {
  const {
    statuses, propertyType, maxPages, running, autoRepeat,
    lastStats, totalStats, runCount, lastRunAt, error,
    toggleStatus, setPropertyType, setMaxPages, runOnce, setAutoRepeat,
  } = useMlsSyncRunner()

  return (
    <div className="min-h-full bg-[#0a1929] text-white p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl font-bold">MLS Sync</h1>
        <p className="font-barlow text-white/40 text-sm mt-1">
          Trigger a manual sync pass against MLSGrid with custom filters.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
        <div>
          <p className="font-barlow text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-barlow cursor-pointer select-none transition-colors ${
                  statuses.includes(opt.value)
                    ? 'bg-brand-blue/15 border-brand-blue/40 text-brand-blue'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={statuses.includes(opt.value)}
                  onChange={() => toggleStatus(opt.value)}
                  className="accent-brand-blue"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {statuses.includes('Closed') && (
            <p className="font-barlow text-xs text-amber-400/80 mt-2">
              Note: a Closed listing still won&apos;t be imported as a brand-new property on first sight — see
              skippedAlreadySold below. This only matters for catching Active→Closed transitions on listings already tracked.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <p className="font-barlow text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Property type</p>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as MlsPropertyType | '')}
              className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white focus:outline-none focus:border-brand-blue/50"
            >
              {(TYPE_OPTIONS as { value: string; label: string }[]).map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a1929]">{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="font-barlow text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Max pages / run</p>
            <input
              type="number"
              min={1}
              max={3}
              value={maxPages}
              onChange={(e) => setMaxPages(Math.min(3, Math.max(1, Number(e.target.value) || 1)))}
              className="w-24 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg font-barlow text-sm text-white focus:outline-none focus:border-brand-blue/50"
            />
          </div>
        </div>

        {!isDefaultSelection(statuses, propertyType) && (
          <p className="font-barlow text-xs text-white/40">
            Custom filter — this run won&apos;t advance the shared sync cursor, so it won&apos;t affect the daily cron.
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={runOnce}
            disabled={running || autoRepeat || statuses.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-dark-navy font-barlow font-semibold text-sm rounded-lg hover:opacity-90 transition disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Running…' : 'Run now'}
          </button>

          <button
            onClick={() => setAutoRepeat(!autoRepeat)}
            disabled={statuses.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 font-barlow font-semibold text-sm rounded-lg transition disabled:opacity-40 ${
              autoRepeat
                ? 'bg-red-500/90 text-white hover:bg-red-500'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            {autoRepeat ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {autoRepeat ? 'Stop auto-repeat (every 2 min)' : 'Start auto-repeat (every 2 min)'}
          </button>
        </div>
        {autoRepeat && (
          <p className="font-barlow text-xs text-white/40">
            Keeps running while you&apos;re anywhere in the admin panel — it only stops if you reload the page,
            close the tab, or leave the admin section entirely.
          </p>
        )}

        {error && (
          <p className="font-barlow text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {(lastStats || runCount > 0) && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="font-barlow text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
              Last run {lastRunAt && `· ${lastRunAt.toLocaleTimeString()}`}
            </p>
            <StatsList stats={lastStats} />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="font-barlow text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
              Session total · {runCount} run{runCount === 1 ? '' : 's'}
            </p>
            <StatsList stats={totalStats} />
          </div>
        </div>
      )}
    </div>
  )
}

function isDefaultSelection(statuses: MlsStatus[], propertyType: MlsPropertyType | '') {
  if (propertyType) return false
  const defaults: MlsStatus[] = ['Active', 'Pending', 'Active Under Contract']
  return statuses.length === defaults.length && defaults.every((s) => statuses.includes(s))
}

function StatsList({ stats }: { stats: SyncStats | null }) {
  if (!stats) return <p className="font-barlow text-sm text-white/30">No runs yet.</p>
  return (
    <dl className="space-y-1.5">
      {(Object.keys(STAT_LABELS) as (keyof SyncStats)[]).map((key) => (
        <div key={key} className="flex items-center justify-between">
          <dt className="font-barlow text-sm text-white/50">{STAT_LABELS[key]}</dt>
          <dd className="font-barlow text-sm font-semibold text-white">{stats[key]}</dd>
        </div>
      ))}
    </dl>
  )
}
