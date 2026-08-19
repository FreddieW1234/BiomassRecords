import { useEffect, useMemo, useState } from 'react'
import type { Resource } from '../api/client'
import { namedMap } from '../lib/format'

export function useList<T extends { id: number }>(api: Resource<T>) {
  const [items, setItems] = useState<T[]>([])

  useEffect(() => {
    let cancelled = false
    api
      .list()
      .then((result) => {
        if (!cancelled) setItems(result.data.items)
      })
      .catch(() => {
        // pages surface their own errors; selectors just stay empty
      })
    return () => {
      cancelled = true
    }
  }, [api])

  const byId = useMemo(() => namedMap(items), [items])
  return { items, byId }
}