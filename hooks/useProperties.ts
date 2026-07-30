'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { PropertyWithImages, PropertyListResponse } from '@/types/properties'

interface UsePropertiesResult {
  properties: PropertyWithImages[]
  meta: PropertyListResponse['meta'] | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProperties(overrides?: Record<string, string>): UsePropertiesResult {
  const params = useSearchParams()
  const [properties, setProperties] = useState<PropertyWithImages[]>([])
  const [meta, setMeta] = useState<PropertyListResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const merged = new URLSearchParams(params.toString())
      if (overrides) {
        for (const [key, value] of Object.entries(overrides)) merged.set(key, value)
      }
      const qs = merged.toString()
      const res = await fetch(`/api/properties${qs ? `?${qs}` : ''}`)
      if (!res.ok) throw new Error('Failed to load properties')
      const data: PropertyListResponse = await res.json()
      setProperties(data.data)
      setMeta(data.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [params, overrides])

  useEffect(() => {
    fetch_()
  }, [fetch_])

  return { properties, meta, loading, error, refetch: fetch_ }
}
