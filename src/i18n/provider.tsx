"use client"

import {createContext, useCallback, useContext, useMemo, useState} from "react"
import {LOCALE_COOKIE, type Locale} from "./config"
import {setActiveLocale, translate, translatePlural, type Params} from "./core"
import type {MessageKey} from "./messages"

interface I18n {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** `t("раздел.ключ", {name})` */
  t: (key: MessageKey, params?: Params) => string
  /** Множественное число: `tn("tickets.count", 3)` — подставит `{n}` и нужную форму. */
  tn: (key: MessageKey, n: number, params?: Params) => string
}

const Ctx = createContext<I18n | null>(null)

const ONE_YEAR = 60 * 60 * 24 * 365

/** Язык приходит с сервера (cookie), смена — без перезагрузки: cookie, `<html lang>` и перерисовка потребителей. */
export function I18nProvider({initial, children}: {initial: Locale; children: React.ReactNode}) {
  const [locale, setLoc] = useState(initial)
  // выставляем до рендера детей, чтобы tr() и форматтеры в том же проходе видели актуальный язык
  setActiveLocale(locale)

  const setLocale = useCallback((next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${ONE_YEAR};SameSite=Lax`
    document.documentElement.lang = next
    setActiveLocale(next)
    setLoc(next)
  }, [])

  const value = useMemo<I18n>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
      tn: (key, n, params) => translatePlural(locale, key, n, params),
    }),
    [locale, setLocale]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useI18n должен вызываться внутри I18nProvider")
  return ctx
}
