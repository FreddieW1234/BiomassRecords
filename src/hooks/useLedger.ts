import { useCallback, useEffect, useState } from 'react'
import type { Resource } from '../api/client'

type LedgerOptions<TItem, TForm> = {
  api: Resource<TItem>
  empty: () => TForm
  toForm: (item: TItem) => TForm
  toPayload?: (form: TForm) => Record<string, unknown>
}

export function useLedger<TItem extends { id: number }, TForm extends Record<string, string>>({
  api,
  empty,
  toForm,
  toPayload,
}: LedgerOptions<TItem, TForm>) {
  const [items, setItems] = useState<TItem[]>([])
  const [form, setForm] = useState<TForm>(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.list()
      setItems(result.data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load entries')
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setField = useCallback((field: keyof TForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }, [])

  const cancel = useCallback(() => {
    setEditingId(null)
    setForm(empty())
  }, [empty])

  const edit = useCallback(
    (item: TItem) => {
      setEditingId(item.id)
      setForm(toForm(item))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [toForm],
  )

  const submit = useCallback(async () => {
    setError(null)
    setSaving(true)
    try {
      const payload = toPayload ? toPayload(form) : form
      if (editingId) {
        await api.update(editingId, payload)
      } else {
        await api.create(payload)
      }
      setEditingId(null)
      setForm(empty())
      await refresh()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      return false
    } finally {
      setSaving(false)
    }
  }, [api, editingId, empty, form, refresh, toPayload])

  const remove = useCallback(
    async (id: number) => {
      if (!window.confirm('Delete this entry? This cannot be undone.')) return
      setError(null)
      try {
        await api.remove(id)
        if (editingId === id) cancel()
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed')
      }
    },
    [api, cancel, editingId, refresh],
  )

  return {
    items,
    form,
    setField,
    editingId,
    error,
    loading,
    saving,
    refresh,
    edit,
    cancel,
    submit,
    remove,
  }
}
