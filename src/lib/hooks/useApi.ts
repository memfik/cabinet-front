"use client"

import {useCallback, useEffect, useRef, useState} from "react"
import {parseApiError, type ApiError} from "@/lib/api/errors"

/**
 * Загрузка данных: `const {data, error, loading, reload} = useApi(() => paymentsApi.getHistory(range), [range])`.
 * Пока идёт повторная загрузка, прежние данные остаются на экране (`loading` = true) — таблица не мигает.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const fetcherRef = useRef(fetcher)

  // эффекты выполняются по порядку: свежий fetcher записан раньше, чем стартует загрузка
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let cancelled = false
    // состояние загрузки выставляем в микротаске — синхронный setState в эффекте даёт лишний рендер
    Promise.resolve().then(() => {
      if (cancelled) return
      setLoading(true)
      setError(null)
    })
    fetcherRef
      .current()
      .then((res) => !cancelled && setData(res))
      .catch((e) => !cancelled && setError(parseApiError(e)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return {data, error, loading, reload, setData}
}
