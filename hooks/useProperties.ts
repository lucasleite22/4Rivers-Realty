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

export function useProperties(): UsePropertiesResult {
  const params = useSearchParams()
  const [properties, setProperties] = useState<PropertyWithImages[]>([])
  const [meta, setMeta] = useState<PropertyListResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams(params.toString())
      // This hook backs the PUBLIC marketing site only. The API treats an
      // authenticated admin caller with no explicit showOnPortal param as
      // "show everything, including unpublished" (that's what the admin
      // curation queue needs by default) — so if whoever's browsing the
      // public site happens to also have a valid admin session cookie
      // (e.g. the same browser used to review listings in /admin), the
      // storefront would silently leak unapproved/hidden listings. Force
      // this explicitly so the public grid never depends on who's viewing.
      qs.set('showOnPortal', 'true')
      if (!qs.get('limit')) qs.set('limit', '24')
      const res = await fetch(`/api/properties?${qs.toString()}`)
      if (!res.ok) throw new Error('Failed to load properties')
      const data: PropertyListResponse = await res.json()
      setProperties(data.data)
      setMeta(data.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetch_()
  }, [fetch_])

  return { properties, meta, loading, error, refetch: fetch_ }
}
