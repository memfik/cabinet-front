import {DEFAULT_LOCALE, LOCALE_META, type Locale} from "./config"
import {lookup, type MessageKey} from "./messages"
import type {Text} from "./messages/types"

export type Params = Record<string, string | number | null | undefined>

/**
 * Текущий язык для кода вне React (форматтеры, тосты, обработчики). Провайдер выставляет его при рендере
 * и при смене языка. Внутри компонентов используйте `useI18n()` — он перерисует их при смене языка.
 */
let activeLocale: Locale = DEFAULT_LOCALE

export const getLocale = () => activeLocale
export const setActiveLocale = (locale: Locale) => {
  activeLocale = locale
}

const fill = (text: string, params?: Params) =>
  params ? text.replace(/\{(\w+)\}/g, (m, k: string) => (params[k] == null ? "" : String(params[k]))) : text

function pick(text: Text, locale: Locale, n?: number): string {
  if (typeof text === "string") return text
  const category = new Intl.PluralRules(locale).select(n ?? 1)
  return category === "one" ? text[0] : category === "few" ? text[1] : text[2]
}

/** Недопереведённая строка показывается по-русски, а не ключом. */
function resolve(locale: Locale, key: MessageKey, n?: number, params?: Params): string {
  const entry = lookup(key)
  if (!entry) return key
  const text = pick(entry[locale] || entry[DEFAULT_LOCALE], locale, n)
  return fill(text, n === undefined ? params : {n, ...params})
}

export const translate = (locale: Locale, key: MessageKey, params?: Params) => resolve(locale, key, undefined, params)
export const translatePlural = (locale: Locale, key: MessageKey, n: number, params?: Params) =>
  resolve(locale, key, n, params)

/** Перевод вне компонентов. */
export const tr = (key: MessageKey, params?: Params) => translate(activeLocale, key, params)
export const trn = (key: MessageKey, n: number, params?: Params) => translatePlural(activeLocale, key, n, params)

export const intlTag = (locale: Locale = activeLocale) => LOCALE_META[locale].intl
