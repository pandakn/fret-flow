"use client"

import { useCallback, useEffect, useState } from "react"

export function useLocalStorage<T>({
  key,
  fallback,
  parse,
  serialize = JSON.stringify,
}: {
  key: string
  fallback: T
  parse: (raw: string | null) => T
  serialize?: (value: T) => string
}) {
  const [value, setValue] = useState<T>(fallback)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Browser storage is intentionally read after mount to keep SSR deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(parse(window.localStorage.getItem(key)))
    setHydrated(true)
  }, [key, parse])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(key, serialize(value))
  }, [hydrated, key, serialize, value])

  const clear = useCallback(() => {
    window.localStorage.removeItem(key)
    setValue(fallback)
  }, [fallback, key])

  return { value, setValue, hydrated, clear }
}
