export const LOCALES = ["ru", "en", "kk"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "ru"

/** Язык хранится в cookie: сервер сразу рендерит нужный язык и не мигает русским. */
export const LOCALE_COOKIE = "lang"

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale)

export const LOCALE_META: Record<Locale, {native: string; short: string; intl: string}> = {
  ru: {native: "Русский", short: "RU", intl: "ru-RU"},
  en: {native: "English", short: "EN", intl: "en-GB"},
  kk: {native: "Қазақша", short: "KZ", intl: "kk-KZ"},
}
