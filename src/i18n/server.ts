import {cookies, headers} from "next/headers"
import {DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale} from "./config"

/** Язык запроса: cookie, а при первом заходе — `Accept-Language` браузера. */
export async function getServerLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value
  if (isLocale(saved)) return saved

  const accepted = (await headers()).get("accept-language") ?? ""
  for (const part of accepted.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase()
    if (isLocale(code)) return code
  }
  return DEFAULT_LOCALE
}
